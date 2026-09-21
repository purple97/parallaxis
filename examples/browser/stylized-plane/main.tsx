import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { Parallaxis, type TimelineInput, type VisualState } from '../../../src';
import './styles.css';

const modelUrl = './public/stylized_plane.glb';
const flightDistance = 24000;
const storyHeight = flightDistance + 1000;
const cloudFadeStart = 14000;
const cloudFadeEnd = 15500;
const oceanRevealStart = 16500;

// The route progresses from level flight into descent, then rotates the plane
// toward a top-down presentation while the camera remains fixed.
const flightTimeline: TimelineInput = [
    {
        range: [0, 6400],
        from: { x: -3, y: 0.62, scale: 0.9, rotateX: 0.08, rotateY: 8.05, rotateZ: 0 },
        to: { x: 1.55, y: 0.62, scale: 0.94, rotateX: 0.08, rotateY: 8.05, rotateZ: 0.02 },
        easing: 'easeInOutCubic',
    },
    {
        range: [6400, 13600],
        from: { x: 1.55, y: 0.62, scale: 0.94, rotateX: 0.08, rotateY: 8.05, rotateZ: 0.02 },
        to: { x: 0.52, y: -0.12, scale: 1, rotateX: 0.28, rotateY: 8.02, rotateZ: 0.08 },
        easing: 'easeInOutCubic',
    },
    {
        range: [13600, 18000],
        from: { x: 0.52, y: -0.12, scale: 1, rotateX: 0.28, rotateY: 8.02, rotateZ: 0.08 },
        to: { x: 0, y: -0.42, scale: 1.05, rotateX: 0.7, rotateY: 7.98, rotateZ: 0.04 },
        easing: 'easeInOutCubic',
    },
    {
        range: [18000, 24000],
        from: { x: 0, y: -0.42, scale: 1.05, rotateX: 0.7, rotateY: 7.98, rotateZ: 0.04 },
        to: { x: -0.18, y: -0.28, scale: 1.1, rotateX: 1.16, rotateY: 7.95, rotateZ: 0 },
        easing: 'easeInOutCubic',
    },
];

function interpolate(from: number, to: number, progress: number) {
    return from + (to - from) * Math.min(Math.max(progress, 0), 1);
}

function resolveFlightZ(scrollY: number) {
    if (scrollY <= 6400) return interpolate(-0.7, -0.52, scrollY / 6400);
    return interpolate(-0.52, 0.4, (scrollY - 6400) / (flightDistance - 6400));
}

type CloudLayer = {
    group: THREE.Group;
    baseX: number;
    baseY: number;
    travelX: number;
    rise: number;
    phase: number;
};

function createCloud(
    geometry: THREE.SphereGeometry,
    material: THREE.MeshLambertMaterial,
    scale: number,
) {
    const cloud = new THREE.Group();
    const puffs = [
        [-0.95, -0.06, 0, 0.88],
        [-0.25, 0.22, 0.08, 1.12],
        [0.52, 0.12, 0, 0.98],
        [1.12, -0.1, -0.04, 0.7],
    ] as const;

    puffs.forEach(([x, y, z, puffScale]) => {
        const puff = new THREE.Mesh(geometry, material);
        puff.position.set(x, y, z);
        puff.scale.set(puffScale * 1.25, puffScale * 0.7, puffScale * 0.72);
        cloud.add(puff);
    });
    cloud.scale.setScalar(scale);
    return cloud;
}

function disposeObject(root: THREE.Object3D) {
    root.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;

        child.geometry.dispose();
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((material) => {
            Object.values(material).forEach((value) => {
                if (value instanceof THREE.Texture) value.dispose();
            });
            material.dispose();
        });
    });
}

function fitModelToScene(model: THREE.Object3D) {
    const bounds = new THREE.Box3().setFromObject(model);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const longestSide = Math.max(size.x, size.y, size.z);
    const scale = longestSide > 0 ? 6.8 / longestSide : 1;

    model.scale.setScalar(scale);
    model.position.copy(center).multiplyScalar(-scale);
}

function PlaneScene() {
    const mountRef = useRef<HTMLDivElement | null>(null);
    const proxyRef = useRef<HTMLDivElement | null>(null);
    const oceanRef = useRef<HTMLDivElement | null>(null);
    const introRef = useRef<HTMLElement | null>(null);
    const progressRef = useRef<HTMLOutputElement | null>(null);
    const transformRef = useRef<HTMLOutputElement | null>(null);
    const [status, setStatus] = useState('正在装配飞机…');
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const mount = mountRef.current;
        const proxy = proxyRef.current;
        if (!mount || !proxy) return undefined;

        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog('#9edcf0', 10, 27);

        const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
        camera.position.set(5.4, 0.85, 6.8);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.setClearColor(0x000000, 0);
        // Shadows are temporarily disabled for this demo.
        // renderer.shadowMap.enabled = true;
        // renderer.shadowMap.type = THREE.PCFShadowMap;
        mount.appendChild(renderer.domElement);

        camera.lookAt(0, 0.05, 0);

        scene.add(new THREE.HemisphereLight('#eafaff', '#59806f', 2.4));

        const sunlight = new THREE.DirectionalLight('#fff2cc', 4.2);
        sunlight.position.set(-4, 7, 5);
        // sunlight.castShadow = true;
        // sunlight.shadow.mapSize.set(1024, 1024);
        scene.add(sunlight);

        const flightRig = new THREE.Group();
        scene.add(flightRig);

        const cloudGeometry = new THREE.SphereGeometry(1, 10, 7);
        const cloudMaterials = [
            new THREE.MeshLambertMaterial({ color: '#d9f2f8', transparent: true, opacity: 0.48, depthWrite: false }),
            new THREE.MeshLambertMaterial({ color: '#f2fbfc', transparent: true, opacity: 0.68, depthWrite: false }),
            new THREE.MeshLambertMaterial({ color: '#ffffff', transparent: true, opacity: 0.78, depthWrite: false }),
        ];
        const cloudOpacities = [0.48, 0.68, 0.78] as const;
        const clouds: CloudLayer[] = [];
        const cloudSeeds = [
            // x, y, z, scale, travelX, rise, layer
            [-4.8, 1.55, -9.5, 1.2, -3.2, 1.1, 0],
            [3.5, -1.2, -8.5, 1.35, -4.3, 1.4, 0],
            [8.2, 1.35, -4.5, 1.25, -11.5, 3.2, 1],
            [11.8, -1.5, -3.2, 1.5, -14.2, 4.6, 1],
            [15.5, 2.6, -5.2, 1.35, -16.8, 3.6, 1],
            [15.8, -4.8, 0.8, 1.75, -20.8, 11.5, 2],
            [21.5, -6.5, 1.5, 2, -25.2, 14, 2],
        ] as const;

        cloudSeeds.forEach(([x, y, z, scale, travelX, rise, layer], index) => {
            const group = createCloud(cloudGeometry, cloudMaterials[layer], scale);
            group.position.set(x, y, z);
            group.rotation.y = (index % 3 - 1) * 0.16;
            scene.add(group);
            clouds.push({ group, baseX: x, baseY: y, travelX, rise, phase: index * 0.83 });
        });

        const calibration = {
            x: 0,
            y: 0,
            z: 0,
            rotationX: 0,
            rotationY: 0,
            rotationZ: 0,
        };
        let latestFlightState: VisualState | null = null;
        let latestScrollProgress = 0;

        const applyCloudTransform = () => {
            const progress = Math.min(Math.max(latestScrollProgress / cloudFadeEnd, 0), 1);
            const descentProgress = Math.min(Math.max((latestScrollProgress - 6000) / 9500, 0), 1);
            const cloudOpacity = 1 - Math.min(Math.max(
                (latestScrollProgress - cloudFadeStart) / (cloudFadeEnd - cloudFadeStart),
                0,
            ), 1);
            clouds.forEach((cloud) => {
                cloud.group.position.x = cloud.baseX + cloud.travelX * progress;
                cloud.group.position.y = cloud.baseY + cloud.rise * descentProgress;
            });
            cloudMaterials.forEach((material, index) => {
                material.opacity = cloudOpacities[index] * cloudOpacity;
            });
        };

        const applyEnvironmentTransform = () => {
            const oceanProgress = Math.min(Math.max(
                (latestScrollProgress - oceanRevealStart) / (flightDistance - oceanRevealStart),
                0,
            ), 1);
            if (oceanRef.current) {
                oceanRef.current.style.transform = `translate3d(0, ${100 - oceanProgress * 78}vh, 0)`;
            }
            if (introRef.current) {
                const introOpacity = 1 - Math.min(Math.max((latestScrollProgress - 3600) / 4400, 0), 1);
                introRef.current.style.opacity = introOpacity.toFixed(3);
            }
        };

        // Both GUI and Parallaxis feed the same final transform. GUI values are
        // calibration offsets; the timeline remains the source of flight motion.
        const applyFlightTransform = () => {
            if (!latestFlightState) return;

            flightRig.position.set(
                latestFlightState.x + calibration.x,
                latestFlightState.y + calibration.y,
                resolveFlightZ(latestScrollProgress) + calibration.z,
            );
            flightRig.scale.setScalar(latestFlightState.scale);
            flightRig.rotation.set(
                latestFlightState.rotateX + calibration.rotationX,
                latestFlightState.rotateY + calibration.rotationY,
                latestFlightState.rotateZ + calibration.rotationZ,
            );

            if (transformRef.current) {
                const { position, rotation } = flightRig;
                transformRef.current.value = [
                    `Position  x ${position.x.toFixed(2)}  y ${position.y.toFixed(2)}  z ${position.z.toFixed(2)}`,
                    `Rotation  x ${rotation.x.toFixed(2)}  y ${rotation.y.toFixed(2)}  z ${rotation.z.toFixed(2)}`,
                ].join('\n');
            }
        };

        const gui = new GUI({ title: '模型变换微调', width: 280 });
        const positionFolder = gui.addFolder('位置偏移');
        positionFolder.add(calibration, 'x', -5, 5, 0.01).name('X');
        positionFolder.add(calibration, 'y', -5, 5, 0.01).name('Y');
        positionFolder.add(calibration, 'z', -5, 5, 0.01).name('Z');
        positionFolder.open();

        const rotationLimit = Math.PI * 2;
        const rotationFolder = gui.addFolder('旋转偏移（弧度）');
        rotationFolder.add(calibration, 'rotationX', -rotationLimit, rotationLimit, 0.01).name('rotation.x');
        rotationFolder.add(calibration, 'rotationY', -rotationLimit, rotationLimit, 0.01).name('rotation.y');
        rotationFolder.add(calibration, 'rotationZ', -rotationLimit, rotationLimit, 0.01).name('rotation.z');
        rotationFolder.open();
        gui.onChange(applyFlightTransform);

        const guiActions = {
            resetTransform: () => {
                calibration.x = 0;
                calibration.y = 0;
                calibration.z = 0;
                calibration.rotationX = 0;
                calibration.rotationY = 0;
                calibration.rotationZ = 0;
                applyFlightTransform();
                gui.controllersRecursive().forEach((controller) => controller.updateDisplay());
            },
        };
        gui.add(guiActions, 'resetTransform').name('重置位置与旋转');

        gui.close();

        // Rotation values are radians because they come from the original Three.js script.
        const runner = new Parallaxis(proxy, {
            timeline: flightTimeline,
            reducedMotion: 'ignore',
            openIntersection: false,
            frameFn: (_style, scrollProgress, _el, state) => {
                latestFlightState = state;
                latestScrollProgress = scrollProgress;
                applyFlightTransform();
                applyCloudTransform();
                applyEnvironmentTransform();
                if (progressRef.current) {
                    progressRef.current.value = `${Math.min(Math.round(scrollProgress), flightDistance)} / ${flightDistance}`;
                }
                return {};
            },
        });

        const playScrollTimeline = () => runner.play();
        window.addEventListener('scroll', playScrollTimeline, { passive: true });
        playScrollTimeline();

        let model: THREE.Object3D | null = null;
        let mixer: THREE.AnimationMixer | null = null;
        let animationFrame = 0;
        let disposed = false;
        const timer = new THREE.Timer();
        timer.connect(document);

        const resize = () => {
            const width = mount.clientWidth;
            const height = mount.clientHeight;
            camera.aspect = width / Math.max(height, 1);
            camera.updateProjectionMatrix();
            renderer.setSize(width, height, false);
        };

        const loader = new GLTFLoader();
        loader.load(
            modelUrl,
            (gltf) => {
                if (disposed) {
                    disposeObject(gltf.scene);
                    return;
                }

                model = gltf.scene;
                fitModelToScene(model);
                // model.traverse((child) => {
                //     if (!(child instanceof THREE.Mesh)) return;
                //     child.castShadow = true;
                //     child.receiveShadow = true;
                // });
                flightRig.add(model);

                if (gltf.animations.length > 0) {
                    mixer = new THREE.AnimationMixer(model);
                    gltf.animations.forEach((clip) => {
                        mixer?.clipAction(clip).reset().play();
                    });
                }

                setLoaded(true);
                setStatus(gltf.animations.length > 0
                    ? `动画播放中 · ${gltf.animations.length} 个片段`
                    : '模型已加载 · 未发现内嵌动画');
            },
            (event) => {
                if (!event.total) return;
                setStatus(`正在装配飞机… ${Math.round((event.loaded / event.total) * 100)}%`);
            },
            (error) => {
                console.error('无法加载飞机模型', error);
                setStatus('飞机模型加载失败，请查看控制台');
            },
        );

        const render = (timestamp?: number) => {
            timer.update(timestamp);
            const delta = Math.min(timer.getDelta(), 0.1);
            mixer?.update(delta);
            const elapsed = timer.getElapsed();
            const cloudProgress = Math.min(Math.max(latestScrollProgress / cloudFadeEnd, 0), 1);
            const cloudRiseProgress = Math.min(Math.max((latestScrollProgress - 6000) / 9500, 0), 1);
            clouds.forEach((cloud) => {
                cloud.group.position.x = cloud.baseX
                    + cloud.travelX * cloudProgress
                    + Math.sin(elapsed * 0.12 + cloud.phase) * 0.08;
                cloud.group.position.y = cloud.baseY
                    + cloud.rise * cloudRiseProgress
                    + Math.sin(elapsed * 0.16 + cloud.phase) * 0.025;
            });
            renderer.render(scene, camera);
            animationFrame = requestAnimationFrame(render);
        };

        resize();
        render();
        window.addEventListener('resize', resize);

        return () => {
            disposed = true;
            cancelAnimationFrame(animationFrame);
            timer.dispose();
            window.removeEventListener('resize', resize);
            window.removeEventListener('scroll', playScrollTimeline);
            runner.disconnect();
            gui.destroy();
            if (mixer && model) {
                mixer.stopAllAction();
                mixer.uncacheRoot(model);
            }
            if (model) disposeObject(model);
            clouds.forEach(({ group }) => scene.remove(group));
            cloudGeometry.dispose();
            cloudMaterials.forEach((material) => material.dispose());
            renderer.dispose();
            renderer.domElement.remove();
        };
    }, []);

    return (
        <main>
            <div className="environment" aria-hidden="true">
                <div className="sky-glow" />
                <div ref={oceanRef} className="ocean">
                    <div className="horizon" />
                </div>
            </div>
            <div ref={mountRef} className="scene" aria-label="双翼螺旋桨飞机三维模型" />
            <div ref={proxyRef} className="parallaxis-proxy" aria-hidden="true" />

            <nav>
                <a href="../">← 所有示例</a>
                <span>PARALLAXIS / SKY TO SEA</span>
            </nav>

            <section ref={introRef} className="intro">
                <p className="eyebrow">FROM SKY TO SEA</p>
                <h1>向海<br />而降</h1>
                <p>向下滚动，跟随飞机掠过云层，逐渐俯瞰从天空浮现的海面。</p>
            </section>

            <div className="scroll-progress" aria-label="滚动动画进度">
                <span>SCROLL Y</span>
                <output ref={progressRef}>0 / 24000</output>
            </div>

            <div className="transform-readout" aria-label="模型最终坐标和旋转">
                <span>FINAL TRANSFORM</span>
                <output ref={transformRef}>{'Position  x -3.00  y 0.62  z -0.70\nRotation  x 0.08  y 8.05  z 0.00'}</output>
                <small>position · rotation (rad)</small>
            </div>

            <div className="story" style={{ height: storyHeight }} aria-hidden="true">
                <span style={{ top: 0 }}>LEVEL FLIGHT · 0000</span>
                <span style={{ top: 6400 }}>DESCENT · 6400</span>
                <span style={{ top: 14000 }}>CLOUD EXIT · 14000</span>
                <span style={{ top: 16500 }}>HORIZON · 16500</span>
                <span style={{ top: 18000 }}>TOP VIEW · 18000</span>
                <span style={{ top: 24000 }}>OVER THE SEA · 24000</span>
            </div>

            <aside className={loaded ? 'status loaded' : 'status'}>
                <span aria-hidden="true" />
                {status}
            </aside>
        </main>
    );
}

createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <PlaneScene />
    </React.StrictMode>,
);

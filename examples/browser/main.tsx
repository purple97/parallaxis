import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as THREE from 'three';
import { ScrollParallax } from '../../src/components/ScrollParallax';
import Parallaxis from '../../src/Parallaxis';
import './styles.css';

type PlanetConfig = {
    name: string;
    radius: number;
    size: number;
    color: string;
    speed: number;
    tiltX: number;
    tiltZ: number;
    offset: number;
};

type PlanetRuntime = {
    pivot: THREE.Object3D;
    speed: number;
};

const planets: PlanetConfig[] = [
    { name: 'Mercury', radius: 2.1, size: 0.09, color: '#d9d2c0', speed: 1.42, tiltX: 18, tiltZ: -12, offset: 0.2 },
    { name: 'Venus', radius: 2.8, size: 0.15, color: '#f2b469', speed: 1.12, tiltX: -10, tiltZ: 24, offset: 1.1 },
    { name: 'Earth', radius: 3.6, size: 0.16, color: '#48a8ff', speed: 0.94, tiltX: 22, tiltZ: -22, offset: 2.2 },
    { name: 'Mars', radius: 4.35, size: 0.13, color: '#ff6b4a', speed: 0.78, tiltX: -25, tiltZ: 15, offset: 3.1 },
    { name: 'Jupiter', radius: 5.55, size: 0.38, color: '#f0c28b', speed: 0.48, tiltX: 13, tiltZ: 32, offset: 0.6 },
    { name: 'Saturn', radius: 6.85, size: 0.31, color: '#f3df9c', speed: 0.38, tiltX: -19, tiltZ: -34, offset: 1.8 },
    { name: 'Uranus', radius: 7.9, size: 0.24, color: '#84f2ee', speed: 0.3, tiltX: 30, tiltZ: 20, offset: 2.8 },
    { name: 'Neptune', radius: 9, size: 0.23, color: '#5c7cff', speed: 0.24, tiltX: -34, tiltZ: -18, offset: 3.7 },
];

const narrativePanels = [
    {
        align: 'left',
        eyebrow: 'Scroll driven orbit',
        title: '滚动不是装饰，它是动画的时间轴',
        body: 'Parallaxis 把 scrollY 解析成 timeline state，再把这个 state 交给 Three.js 场景。你看到的推进、偏移和旋转都来自同一套滚动脚本。',
        range: [760, 1600],
    },
    {
        align: 'right',
        eyebrow: 'Independent revolution',
        title: '公转持续运行，镜头由滚动控制',
        body: '行星自己的轨道动画留给 Three.js render loop；Parallaxis 只负责太阳系整体的位置、缩放、倾角和透明度。',
        range: [1600, 2440],
    },
    {
        align: 'left',
        eyebrow: 'Layered planes',
        title: '轨道不在同一平面，空间感才成立',
        body: '每颗行星的轨道有不同倾角，滚动时整个系统横移并旋转，让视差层次变得可观察。',
        range: [2440, 3280],
    },
    {
        align: 'right',
        eyebrow: 'Glass foreground',
        title: '文案框是前景，太阳系是舞台',
        body: '前景内容用 ScrollParallax 单独淡入并停留；背景场景用 Parallaxis frameFn 驱动，这样 DOM 与 WebGL 的职责不会互相污染。',
        range: [3560, 4440],
    },
    {
        align: 'left',
        eyebrow: 'Diagnostics',
        title: '漂亮之外，还要能证明库的能力',
        body: '这个 demo 保留 scrollY 和 active range，让它既像一个网站，也像一个可观察的动画验证页。',
        range: [4440, 5280],
    },
];

const cameraTimeline = [
    {
        range: [0, 820],
        from: { x: 0, y: 0, scale: 0.78, rotateX: 0, rotateY: 0, opacity: 1 },
        to: { x: -1.4, y: 2.2, scale: 1.18, rotateX: 10, rotateY: -18, opacity: 1 },
        easing: 'easeOutCubic' as const,
    },
    {
        range: [820, 1720],
        from: { x: -1.4, y: 2.2, scale: 1.18, rotateX: 10, rotateY: -18, opacity: 1 },
        to: { x: 2.2, y: -1.1, scale: 1.02, rotateX: -8, rotateY: 24, opacity: 1 },
        easing: 'easeInOutCubic' as const,
    },
    {
        range: [1720, 2860],
        from: { x: 2.2, y: -1.1, scale: 1.02, rotateX: -8, rotateY: 24, opacity: 1 },
        to: { x: -2.8, y: 0.7, scale: 1.36, rotateX: 18, rotateY: -36, opacity: 1 },
        easing: 'easeInOutCubic' as const,
    },
    {
        range: [2860, 4200],
        from: { x: -2.8, y: 0.7, scale: 1.36, rotateX: 18, rotateY: -36, opacity: 1 },
        to: { x: 0, y: 0, scale: 0.72, rotateX: -16, rotateY: 42, opacity: 0.86 },
        easing: 'easeOutCubic' as const,
    },
];

const hiddenParallaxStyle = { opacity: 0 } as const;
const visibleParallaxStyle = { opacity: 1 } as const;

const heroCopyTimeline = [
    {
        range: [0, 640],
        from: { y: 0, opacity: 1, scale: 1 },
        to: { y: -120, opacity: 0.18, scale: 0.94 },
        easing: 'easeOutCubic' as const,
    },
];

const timelineCardTimeline = [
    {
        range: [2960, 3460],
        from: { x: -160, opacity: 0 },
        to: { x: 0, opacity: 1 },
        easing: 'easeOutCubic' as const,
    },
];

function toRadians(degrees: number) {
    return degrees * Math.PI / 180;
}

function useScrollY() {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        let frame = 0;
        const update = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => setScrollY(Math.round(window.scrollY || 0)));
        };

        update();
        window.addEventListener('scroll', update, { passive: true });
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('scroll', update);
        };
    }, []);

    return scrollY;
}

function createOrbit(radius: number, color: string) {
    const points: THREE.Vector3[] = [];
    const segments = 192;

    for (let index = 0; index <= segments; index += 1) {
        const angle = (index / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius * 0.72,
        ));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.28,
    });

    return new THREE.Line(geometry, material);
}

function createStarField() {
    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const colors: number[] = [];
    const color = new THREE.Color();

    for (let index = 0; index < 900; index += 1) {
        vertices.push(
            (Math.random() - 0.5) * 46,
            (Math.random() - 0.5) * 28,
            -Math.random() * 34 - 4,
        );
        color.setHSL(0.58 + Math.random() * 0.08, 0.62, 0.62 + Math.random() * 0.3);
        colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    return new THREE.Points(
        geometry,
        new THREE.PointsMaterial({
            size: 0.035,
            vertexColors: true,
            transparent: true,
            opacity: 0.82,
        }),
    );
}

function createPlanet(config: PlanetConfig, solarSystem: THREE.Group): PlanetRuntime {
    const orbitPlane = new THREE.Group();
    orbitPlane.rotation.x = toRadians(config.tiltX);
    orbitPlane.rotation.z = toRadians(config.tiltZ);
    orbitPlane.add(createOrbit(config.radius, config.color));

    const pivot = new THREE.Object3D();
    pivot.rotation.y = config.offset;

    const planet = new THREE.Mesh(
        new THREE.SphereGeometry(config.size, 32, 32),
        new THREE.MeshStandardMaterial({
            color: config.color,
            emissive: config.color,
            emissiveIntensity: 0.16,
            roughness: 0.45,
            metalness: 0.08,
        }),
    );
    planet.position.x = config.radius;
    planet.scale.z = 0.98;
    planet.name = config.name;
    pivot.add(planet);

    if (config.name === 'Saturn') {
        const ring = new THREE.Mesh(
            new THREE.RingGeometry(config.size * 1.55, config.size * 2.1, 48),
            new THREE.MeshBasicMaterial({
                color: '#ffe8ad',
                transparent: true,
                opacity: 0.5,
                side: THREE.DoubleSide,
            }),
        );
        ring.rotation.x = Math.PI / 2.3;
        planet.add(ring);
    }

    orbitPlane.add(pivot);
    solarSystem.add(orbitPlane);

    return { pivot, speed: config.speed };
}

function SolarSystemScene() {
    const mountRef = useRef<HTMLDivElement | null>(null);
    const proxyRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const mount = mountRef.current;
        const proxy = proxyRef.current;
        if (!mount || !proxy) return undefined;

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2('#030b1b', 0.045);

        const camera = new THREE.PerspectiveCamera(48, mount.clientWidth / mount.clientHeight, 0.1, 100);
        camera.position.set(0, 1.5, 15);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        mount.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight('#9bbcff', 0.42);
        const sunLight = new THREE.PointLight('#ffd37a', 18, 42, 1.3);
        scene.add(ambientLight, sunLight);

        const stars = createStarField();
        scene.add(stars);

        const solarSystem = new THREE.Group();
        solarSystem.rotation.z = toRadians(-8);
        scene.add(solarSystem);

        const sun = new THREE.Mesh(
            new THREE.SphereGeometry(0.78, 64, 64),
            new THREE.MeshBasicMaterial({ color: '#ffd166' }),
        );
        solarSystem.add(sun);

        const sunHalo = new THREE.Mesh(
            new THREE.SphereGeometry(1.28, 64, 64),
            new THREE.MeshBasicMaterial({
                color: '#ff9f43',
                transparent: true,
                opacity: 0.16,
                blending: THREE.AdditiveBlending,
            }),
        );
        solarSystem.add(sunHalo);

        const farHalo = new THREE.Mesh(
            new THREE.SphereGeometry(2.1, 64, 64),
            new THREE.MeshBasicMaterial({
                color: '#4dd8ff',
                transparent: true,
                opacity: 0.055,
                blending: THREE.AdditiveBlending,
            }),
        );
        solarSystem.add(farHalo);

        const runtimePlanets = planets.map((planet) => createPlanet(planet, solarSystem));

        const runner = new Parallaxis(proxy, {
            timeline: cameraTimeline,
            style: { opacity: 1, willChange: 'transform, opacity' },
            reducedMotion: 'ignore',
            openIntersection: false,
            frameFn: (_style, _scrollProgress, _el, state) => {
                solarSystem.position.x = state.x;
                solarSystem.position.y = state.y * 0.22;
                solarSystem.scale.setScalar(state.scale);
                solarSystem.rotation.x = toRadians(state.rotateX);
                solarSystem.rotation.y = toRadians(state.rotateY);
                mount.style.opacity = String(state.opacity);
                return {};
            },
        });

        const play = () => runner.play();
        window.addEventListener('scroll', play, { passive: true });
        play();

        let animationFrame = 0;
        let previousTime = performance.now();
        let elapsedTime = 0;
        const animate = (time = performance.now()) => {
            const delta = Math.min((time - previousTime) / 1000, 0.05);
            previousTime = time;
            elapsedTime += delta;
            runtimePlanets.forEach((planet) => {
                planet.pivot.rotation.y += delta * planet.speed * 0.26;
            });
            sun.rotation.y += delta * 0.16;
            sunHalo.scale.setScalar(1 + Math.sin(elapsedTime * 1.8) * 0.025);
            farHalo.scale.setScalar(1 + Math.sin(elapsedTime * 1.1) * 0.04);
            stars.rotation.y += delta * 0.012;
            renderer.render(scene, camera);
            animationFrame = requestAnimationFrame(animate);
        };
        animate();

        const resize = () => {
            const width = mount.clientWidth;
            const height = mount.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };

        window.addEventListener('resize', resize);

        return () => {
            window.removeEventListener('scroll', play);
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrame);
            runner.disconnect();
            renderer.dispose();
            mount.removeChild(renderer.domElement);
        };
    }, []);

    return (
        <div className="space-viewport" aria-hidden="true">
            <div ref={mountRef} className="solar-system-canvas" />
            <div ref={proxyRef} className="solar-system-proxy" />
        </div>
    );
}

function NarrativePanel({ panel, scrollY }: { panel: typeof narrativePanels[number]; scrollY: number }) {
    const [start, end] = panel.range;
    const fadeEnd = Math.min(start + 260, end);
    const isActive = start <= scrollY && scrollY < end;
    const timeline = useMemo(() => [
        {
            range: [start, fadeEnd] as [number, number],
            from: { y: 56, opacity: 0, scale: 0.96 },
            to: { y: 0, opacity: 1, scale: 1 },
            easing: 'easeOutCubic' as const,
        },
    ], [fadeEnd, start]);

    if (!isActive) return <section className={`narrative-section narrative-${panel.align}`} />;

    return (
        <section className={`narrative-section narrative-${panel.align}`}>
            <ScrollParallax
                timeline={timeline}
                reducedMotion="ignore"
                style={hiddenParallaxStyle}
            >
                <article className="glass-panel">
                    <p className="eyebrow">{panel.eyebrow}</p>
                    <h2>{panel.title}</h2>
                    <p>{panel.body}</p>
                </article>
            </ScrollParallax>
        </section>
    );
}

function ScrollHud({ scrollY }: { scrollY: number }) {
    const activePanel = narrativePanels.find((panel) => panel.range[0] <= scrollY && scrollY <= panel.range[1]);

    return (
        <aside className="hud" aria-label="scroll diagnostics">
            <span>scrollY</span>
            <strong>{scrollY}</strong>
            <small>{activePanel ? activePanel.eyebrow : 'deep space'}</small>
        </aside>
    );
}

function App() {
    const scrollY = useScrollY();

    return (
        <main>
            <SolarSystemScene />
            <nav className="top-nav" aria-label="Primary">
                <a href="#top" className="brand">Parallaxis</a>
                <div>
                    <a href="#orbit">Orbit Demo</a>
                    <a href="#timeline">Timeline</a>
                    <a href="#diagnostics">Diagnostics</a>
                </div>
            </nav>
            <ScrollHud scrollY={scrollY} />

            <section id="top" className="hero-section">
                <ScrollParallax
                    timeline={heroCopyTimeline}
                    reducedMotion="ignore"
                    style={visibleParallaxStyle}
                >
                    <div className="hero-copy">
                        <p className="eyebrow">Solar Parallax Lab</p>
                        <h1>滚动穿越一个会呼吸的太阳系</h1>
                        <p>
                            8 大行星持续公转，滚动条驱动镜头推进、横移、旋转和前景文案切换。
                        </p>
                    </div>
                </ScrollParallax>
            </section>

            <div id="orbit" className="narrative-stack">
                {narrativePanels.slice(0, 3).map((panel) => (
                    <NarrativePanel key={panel.eyebrow} panel={panel} scrollY={scrollY} />
                ))}
            </div>

            <section id="timeline" className="timeline-band">
                <ScrollParallax
                    timeline={timelineCardTimeline}
                    reducedMotion="ignore"
                    style={hiddenParallaxStyle}
                >
                    <div className="timeline-card">
                        <p className="eyebrow">v2 timeline</p>
                        <h2>一个滚动区间，一段可解释的视觉状态</h2>
                        <div className="timeline-rules">
                            <span>range</span>
                            <strong>[1720, 2860]</strong>
                            <span>state</span>
                            <strong>x / y / scale / rotateX / rotateY</strong>
                            <span>target</span>
                            <strong>Three.js solarSystem group</strong>
                        </div>
                    </div>
                </ScrollParallax>
            </section>

            <div id="diagnostics" className="narrative-stack narrative-stack-late">
                {narrativePanels.slice(3).map((panel) => (
                    <NarrativePanel key={panel.eyebrow} panel={panel} scrollY={scrollY} />
                ))}
            </div>

            <section className="finish-section">
                <article className="glass-panel finish-panel">
                    <p className="eyebrow">Demo complete</p>
                    <h2>Parallaxis 驱动滚动，Three.js 保持宇宙运转</h2>
                    <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        回到顶部
                    </button>
                </article>
            </section>
        </main>
    );
}

createRoot(document.getElementById('root') as HTMLElement).render(<App />);

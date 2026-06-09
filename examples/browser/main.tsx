import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ScrollParallax } from '../../src/components/ScrollParallax';
import { renderGrid as GridOverlay } from '../../src/components/grid';
import Parallaxis from '../../src/Parallaxis';
import './styles.css';

const heroTimeline = [
    {
        range: [160, 900],
        from: { x: 0, y: 0, opacity: 1 },
        to: { x: 360, y: 260, opacity: 0.65 },
        easing: 'easeOutCubic' as const,
    },
    {
        range: [420, 1200],
        from: { scale: 1, rotate: 0 },
        to: { scale: 1.2, rotate: 18 },
        easing: 'easeInOutCubic' as const,
    },
    {
        range: [900, 1600],
        from: { x: 360, y: 260, rotate: 18 },
        to: { x: 40, y: 700, rotate: 330 },
        easing: 'easeOutCubic' as const,
    },
];

const legacyFadeLeftScript = { start: 240, x: [0, -120], opacity: [1, 0], end: 720 } as const;
const legacyFadeRightScript = { start: 240, x: [0, 120], opacity: [1, 0], end: 720 } as const;

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

function ImperativeProbe() {
    const boxRef = useRef<HTMLDivElement | null>(null);
    const runnerRef = useRef<Parallaxis | null>(null);

    useEffect(() => {
        if (!boxRef.current) return undefined;

        runnerRef.current = new Parallaxis(boxRef.current, {
            timeline: [
                {
                    range: [1750, 2150],
                    from: { y: 0, opacity: 0 },
                    to: { y: -180, opacity: 1 },
                },
                {
                    range: [2150, 2550],
                    from: { scale: 0.8, rotate: 0 },
                    to: { scale: 1.15, rotate: 180 },
                    easing: 'easeOutCubic',
                },
            ],
            style: { opacity: 0, willChange: 'transform, opacity' },
            debug: false,
            openIntersection: false,
        });

        const play = () => runnerRef.current?.play();
        play();
        window.addEventListener('scroll', play, { passive: true });

        return () => {
            window.removeEventListener('scroll', play);
            runnerRef.current?.disconnect();
        };
    }, []);

    return (
        <section className="stage stage-dark">
            <div ref={boxRef} className="imperative-card">
                <strong>Parallaxis class</strong>
                <span>直接实例化验证 timeline，不经过 React 组件封装。</span>
            </div>
        </section>
    );
}

function ContainerProbe() {
    const containerRef = useRef<HTMLDivElement | null>(null);

    return (
        <section className="container-demo">
            <div className="section-heading">
                <p className="eyebrow">Custom container</p>
                <h2>容器内滚动</h2>
            </div>
            <div ref={containerRef} className="scroll-box">
                <div className="scroll-box-space">
                    <ScrollParallax
                        container={containerRef}
                        timeline={[
                            {
                                range: [0, 360],
                                from: { x: 0, y: 0, opacity: 1 },
                                to: { x: 260, y: 180, opacity: 0.35 },
                                easing: 'easeOutCubic',
                            },
                            {
                                range: [360, 760],
                                from: { x: 260, y: 180 },
                                to: { x: 60, y: 460 },
                                easing: 'easeInOutCubic',
                            },
                        ]}
                        style={{ opacity: 1 }}
                    >
                        <div className="container-card">
                            <strong>container</strong>
                            <span>监听 scroll-box，而不是 window。</span>
                        </div>
                    </ScrollParallax>
                </div>
            </div>
        </section>
    );
}

function RuleProbe() {
    return (
        <section className="rule-demo">
            <div className="section-heading">
                <p className="eyebrow">Timeline rules</p>
                <h2>重叠与继承</h2>
            </div>
            <div className="rule-grid">
                <ScrollParallax
                    timeline={[
                        {
                            range: [3200, 3600],
                            from: { x: 0, opacity: 1 },
                            to: { x: 220, opacity: 0.45 },
                        },
                        {
                            range: [3400, 3900],
                            from: { x: 40 },
                            to: { x: -160 },
                            easing: 'easeOutCubic',
                        },
                    ]}
                    style={{ opacity: 1 }}
                >
                    <div className="rule-card overlap-card">
                        <strong>overlap</strong>
                        <span>同属性重叠时，后声明的 x 片段优先。</span>
                    </div>
                </ScrollParallax>

                <ScrollParallax
                    timeline={[
                        {
                            range: [3200, 3600],
                            from: { x: 0, opacity: 1 },
                            to: { x: 220, opacity: 0.45 },
                        },
                        {
                            range: [3400, 3900],
                            from: { y: 0 },
                            to: { y: 160 },
                            easing: 'easeOutCubic',
                        },
                    ]}
                    style={{ opacity: 1 }}
                >
                    <div className="rule-card inherit-card">
                        <strong>inherit</strong>
                        <span>后段只声明 y，不会覆盖上一段的 x / opacity。</span>
                    </div>
                </ScrollParallax>
            </div>
        </section>
    );
}

function HorizontalProbe() {
    const containerRef = useRef<HTMLDivElement | null>(null);

    return (
        <section className="horizontal-demo">
            <div className="section-heading">
                <p className="eyebrow">Axis x</p>
                <h2>横向滚动</h2>
            </div>
            <div ref={containerRef} className="scroll-x-box">
                <div className="scroll-x-space">
                    <ScrollParallax
                        axis="x"
                        container={containerRef}
                        timeline={[
                            {
                                range: [0, 520],
                                from: { x: 0, opacity: 1 },
                                to: { x: 360, opacity: 0.5 },
                                easing: 'easeOutCubic',
                            },
                        ]}
                        style={{ opacity: 1 }}
                    >
                        <div className="horizontal-card">
                            <strong>axis x</strong>
                            <span>读取 scrollLeft 作为进度。</span>
                        </div>
                    </ScrollParallax>
                </div>
            </div>
        </section>
    );
}

function PropsUpdateProbe() {
    const [expanded, setExpanded] = useState(false);
    const timeline = expanded
        ? [
            {
                range: [0, 500],
                from: { x: 0, scale: 1, opacity: 1 },
                to: { x: 260, scale: 1.16, opacity: 0.5 },
                easing: 'easeOutCubic' as const,
            },
        ]
        : [
            {
                range: [0, 500],
                from: { x: 0, scale: 1, opacity: 1 },
                to: { x: 120, scale: 1, opacity: 0.8 },
                easing: 'easeOutCubic' as const,
            },
        ];

    return (
        <section className="props-demo">
            <div className="section-heading">
                <p className="eyebrow">Props update</p>
                <h2>脚本更新</h2>
            </div>
            <button className="update-button" type="button" onClick={() => setExpanded((value) => !value)}>
                切换 timeline
            </button>
            <ScrollParallax timeline={timeline} reducedMotion="ignore" style={{ opacity: 1 }}>
                <div className="props-card">
                    <strong>{expanded ? 'updated' : 'initial'}</strong>
                    <span>props 改变后会重新初始化 Parallaxis。</span>
                </div>
            </ScrollParallax>
            <div className="reduced-note">
                reducedMotion=&quot;ignore&quot; 用于验证该配置能覆盖系统减少动画设置。
            </div>
        </section>
    );
}

function App() {
    const scrollY = useScrollY();

    return (
        <main>
            <GridOverlay />
            <aside className="hud">
                <span>scrollY</span>
                <strong>{scrollY}</strong>
            </aside>

            <section className="hero">
                <div>
                    <p className="eyebrow">Browser verification</p>
                    <h1>Parallaxis</h1>
                    <p className="intro">
                        滚动页面，验证 v2 timeline、legacy animationScript、自定义容器和 Grid 调试层。
                    </p>
                </div>
            </section>

            <section className="stage stage-light">
                <ScrollParallax timeline={heroTimeline} debug={false}>
                    <div className="motion-card">
                        <strong>timeline</strong>
                        <span>range / from / to / easing</span>
                    </div>
                </ScrollParallax>
            </section>

            <section className="split">
                <ScrollParallax animationScript={legacyFadeLeftScript} style={{ opacity: 1 }}>
                    <article className="copy-card">
                        <h2>legacy 左侧淡出</h2>
                        <p>验证旧 animationScript 仍能 normalize 到 v2 core。</p>
                    </article>
                </ScrollParallax>

                <ScrollParallax animationScript={legacyFadeRightScript} style={{ opacity: 1 }}>
                    <article className="copy-card">
                        <h2>legacy 右侧淡出</h2>
                        <p>验证 x: [0, 120] 和 opacity: [1, 0]。</p>
                    </article>
                </ScrollParallax>
            </section>

            <ImperativeProbe />
            <ContainerProbe />
            <RuleProbe />
            <HorizontalProbe />
            <PropsUpdateProbe />

            <section className="finish">
                <h2>验证结束</h2>
                <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    回到顶部
                </button>
            </section>
        </main>
    );
}

createRoot(document.getElementById('root') as HTMLElement).render(<App />);

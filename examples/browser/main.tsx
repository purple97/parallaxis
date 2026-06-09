import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ScrollParallax } from '../../src/components/ScrollParallax';
import Parallaxis from '../../src/Parallaxis';
import './styles.css';

const heroScript = [
    { start: 160, x: [0, 360], y: [0, 260], end: 900 },
    { start: 420, opacity: [1, 0.35], scale: [1, 1.2], end: 1200 },
    { start: 900, x: [360, 40], y: [260, 700], rotate: [0, 330], end: 1600 },
];

const fadeLeftScript = { start: 240, x: [0, -120], opacity: [1, 0], end: 720 };
const fadeRightScript = { start: 240, x: [0, 120], opacity: [1, 0], end: 720 };

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
        if (!boxRef.current) return;

        runnerRef.current = new Parallaxis(boxRef.current, {
            animationScript: [
                { start: 1750, y: [0, -180], opacity: [0, 1], end: 2150 },
                { start: 2150, opacity: [1, 1], scale: [0.8, 1.15], rotate: [0, 180], end: 2550 },
            ],
            style: { opacity: 0, willChange: 'transform, opacity' },
            debug: false,
            openIntersection: false,
        });

        const play = () => runnerRef.current?.play(window.scrollY || 0);
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
                <span>直接实例化验证，不经过 React 组件封装。</span>
            </div>
        </section>
    );
}

function App() {
    const scrollY = useScrollY();

    return (
        <main>
            <aside className="hud">
                <span>scrollY</span>
                <strong>{scrollY}</strong>
            </aside>

            <section className="hero">
                <div>
                    <p className="eyebrow">Browser verification</p>
                    <h1>Parallaxis</h1>
                    <p className="intro">
                        滚动页面，观察位移、缩放、旋转、透明度和补帧效果是否符合预期。
                    </p>
                </div>
            </section>

            <section className="stage stage-light">
                <ScrollParallax animationScript={heroScript as any} debug={false}>
                    <div className="motion-card">
                        <strong>ScrollParallax</strong>
                        <span>x / y / scale / rotate / opacity</span>
                    </div>
                </ScrollParallax>
            </section>

            <section className="split">
                <ScrollParallax animationScript={fadeLeftScript as any} style={{ opacity: 1 }}>
                    <article className="copy-card">
                        <h2>左侧淡出</h2>
                        <p>验证 x: [0, -120] 和 opacity: [1, 0]。</p>
                    </article>
                </ScrollParallax>

                <ScrollParallax animationScript={fadeRightScript as any} style={{ opacity: 1 }}>
                    <article className="copy-card">
                        <h2>右侧淡出</h2>
                        <p>验证 x: [0, 120] 和 opacity: [1, 0]。</p>
                    </article>
                </ScrollParallax>
            </section>

            <ImperativeProbe />

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

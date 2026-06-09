import { useEffect, useRef } from 'react';
import Parallaxis from '../Parallaxis';
import type { ParallaxisOption } from '../Parallaxis';

export type ContainerProp = HTMLElement | React.RefObject<HTMLElement>;

export type UseParallaxisOptions = Omit<ParallaxisOption, 'container'> & {
    container?: ContainerProp;
};

export function resolveContainer(container?: ContainerProp): HTMLElement | undefined {
    if (!container) return undefined;
    if (container instanceof HTMLElement) return container;
    return container.current ?? undefined;
}

export function useParallaxis<T extends HTMLElement>(options: UseParallaxisOptions) {
    const elementRef = useRef<T>(null);
    const instanceRef = useRef<Parallaxis | null>(null);

    useEffect(() => {
        const container = resolveContainer(options.container);
        const {
            container: _container,
            ...parallaxisOption
        } = options;

        instanceRef.current = new Parallaxis(elementRef.current, {
            ...parallaxisOption,
            container,
        });

        const handleScroll = () => {
            instanceRef.current?.play();
        };

        const scrollTarget: HTMLElement | Window = container ?? window;
        scrollTarget.addEventListener('scroll', handleScroll, { passive: true });

        const frame = window.requestAnimationFrame(handleScroll);

        return () => {
            window.cancelAnimationFrame(frame);
            scrollTarget.removeEventListener('scroll', handleScroll);
            instanceRef.current?.disconnect();
            instanceRef.current = null;
        };
    }, [
        options.afterSupplement,
        options.animationScript,
        options.axis,
        options.beforeSupplement,
        options.container,
        options.debug,
        options.duration,
        options.frameFn,
        options.openIntersection,
        options.reducedMotion,
        options.style,
        options.timeline,
        options.transformOrigin,
    ]);

    return {
        elementRef,
        instanceRef,
    };
}

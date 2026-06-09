/// <reference types="react" />
import Parallaxis from '../Parallaxis';
import type { ParallaxisOption } from '../Parallaxis';
export type ContainerProp = HTMLElement | React.RefObject<HTMLElement>;
export type UseParallaxisOptions = Omit<ParallaxisOption, 'container'> & {
    container?: ContainerProp;
};
export declare function resolveContainer(container?: ContainerProp): HTMLElement | undefined;
export declare function useParallaxis<T extends HTMLElement>(options: UseParallaxisOptions): {
    elementRef: import("react").RefObject<T>;
    instanceRef: import("react").MutableRefObject<Parallaxis | null>;
};

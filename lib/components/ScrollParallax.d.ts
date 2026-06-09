import React from 'react';
import type { ParallaxisOption } from '../Parallaxis';
import type { ContainerProp } from '../react/useParallaxis';
export type ScrollParallaxProps = Omit<ParallaxisOption, 'container'> & {
    children?: React.ReactNode;
    container?: ContainerProp;
};
export declare const ScrollParallax: React.ForwardRefExoticComponent<Omit<ParallaxisOption, "container"> & {
    children?: React.ReactNode;
    container?: ContainerProp | undefined;
} & React.RefAttributes<HTMLSpanElement>>;

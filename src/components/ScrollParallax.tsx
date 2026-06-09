import React, {
    forwardRef,
    useImperativeHandle,
} from 'react';
import type { ParallaxisOption } from '../Parallaxis';
import { useParallaxis } from '../react/useParallaxis';
import type { ContainerProp } from '../react/useParallaxis';

export type ScrollParallaxProps = Omit<ParallaxisOption, 'container'> & {
    children?: React.ReactNode;
    container?: ContainerProp;
};

export const ScrollParallax = forwardRef<HTMLSpanElement, ScrollParallaxProps>((props, ref) => {
    const { children, ...option } = props;
    const { elementRef } = useParallaxis<HTMLSpanElement>(option);

    useImperativeHandle(ref, () => elementRef.current as HTMLSpanElement);

    return (
        <span
            ref={elementRef}
            style={{
                backfaceVisibility: 'hidden',
                position: 'relative',
                display: 'inline-block',
                userSelect: 'initial',
                pointerEvents: 'initial',
                width: '100%',
                ...props.style,
            }}
        >
            {children}
        </span>
    );
});


import React, { forwardRef, useRef, useEffect, useCallback } from 'react'
import Parallaxis from '../Parallaxis';
import type { FrameScriptInfo } from '../lib';


function getScrollY() {
    return window.scrollY || 0;
}

export const ScrollParallax = forwardRef<{ animationScript: FrameScriptInfo[] }, any>((props, ref) => {
    const parallaxRef = useRef(null);
    const scriptsRef = useRef<any>(null);

    const handleScroll = useCallback(() => {
        if (scriptsRef.current) {
            const scrollTop = getScrollY();
            scriptsRef.current.play(scrollTop)
        }
    }, [scriptsRef.current])

    useEffect(() => {
        scriptsRef.current = new Parallaxis(parallaxRef.current, props)
        //
        window.addEventListener("scroll", handleScroll, { passive: true });

        setTimeout(() => {
            handleScroll()
        }, 0)
        return () => {
            window.removeEventListener("scroll", handleScroll);
        }
    }, []);

    return (
        <span ref={parallaxRef} style={{
            backfaceVisibility: "hidden",
            position: "relative",
            display: "inline-block",
            userSelect: "initial",
            pointerEvents: "initial",
            width: "100%",
            ...props.style
        }}>
            {props.children}
        </span>

    );
})
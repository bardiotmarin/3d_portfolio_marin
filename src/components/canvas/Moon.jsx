import React, { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";

const MoonHero = () => {
    const moon = useGLTF("/moon/scene.gltf");
    const moonRef = useRef();

    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking && moonRef.current && document.visibilityState === "visible") {
                window.requestAnimationFrame(() => {
                    const scrollY = window.scrollY;
                    const yPos = -scrollY / 100;
                    moonRef.current.position.y = yPos;
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // Pass group for future compositing
    return (
        <group>
            <ambientLight intensity={0.2} />
            <directionalLight position={[2, 5, -2]} intensity={1} />
            <primitive object={moon.scene} ref={moonRef} />
        </group>
    );
};

export default MoonHero;

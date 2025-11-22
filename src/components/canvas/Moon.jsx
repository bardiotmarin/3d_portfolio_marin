import React, { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";

const Moon = () => {
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

                    // Effectuer d'autres ajustements ici si nécessaire

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

    return <primitive object={moon.scene} ref={moonRef} />;
};

export default Moon;

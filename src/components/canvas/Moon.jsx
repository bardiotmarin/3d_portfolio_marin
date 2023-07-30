import React, { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";

const Moon = () => {
    const moon = useGLTF("public/moon/scene.gltf");
    const moonRef = useRef();

    useEffect(() => {
        const handleScroll = () => {
            if (moonRef.current) {
                const scrollY = window.scrollY;
                const yPos = -scrollY / 50; // Adjust the speed of movement here
                moonRef.current.position.y = yPos;

                // Modify the scale to simulate the explosion effect
                const scale = 1 - scrollY / 10000;
                moonRef.current.scale.set(scale, scale, scale);
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

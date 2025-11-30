import React, { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";

const MoonHero = () => {
    const moon = useGLTF("/moon/scene.gltf");
    const moonRef = useRef();

    useEffect(() => {
        let rotationId;
        const animate = () => {
            if (moonRef.current) {
                moonRef.current.rotation.y += 0.0027;
            }
            rotationId = requestAnimationFrame(animate);
        };
        animate();
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
            if(rotationId) cancelAnimationFrame(rotationId);
        };
    }, []);

    return (
        <group>
            <ambientLight intensity={0.2} />
            <directionalLight position={[2, 5, -2]} intensity={1} />
            <primitive object={moon.scene} ref={moonRef} />
        </group>
    );
};

export default MoonHero;

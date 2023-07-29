import React, { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";

const Lotus = () => {
    const lotus = useGLTF("/lotus_flower/scene.gltf");
    const canvasRef = useRef();
    let contextLost = false;

    useEffect(() => {
        const canvas = canvasRef.current;

        const handleContextLost = (event) => {
            console.warn("WebGL context lost. Reason:", event.reason);
            contextLost = true;
            // Handle context loss here (e.g., cleanup resources)
        };

        const handleContextRestored = () => {
            console.log("WebGL context restored.");
            contextLost = false;
            // Reinitialize your WebGL resources here
            // For example, reload textures, recreate shaders, etc.
        };

        canvas.addEventListener("webglcontextlost", handleContextLost, false);
        canvas.addEventListener("webglcontextrestored", handleContextRestored, false);

        return () => {
            canvas.removeEventListener("webglcontextlost", handleContextLost);
            canvas.removeEventListener("webglcontextrestored", handleContextRestored);
        };
    }, []);

    return (
        <Canvas
            ref={canvasRef}
            shadows
            frameloop="demand"
            dpr={[1, 2]}
            gl={{ preserveDrawingBuffer: true }}
            camera={{
                fov: 75,
                near: 0.1,
                far: 1000,
                position: [0, 0, 5],
            }}
        >
            <ambientLight intensity={0.5} />
            <directionalLight
                castShadow
                position={[2.5, 8, 5]}
                intensity={1.5}
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-far={50}
                shadow-camera-left={-10}
                shadow-camera-right={10}
                shadow-camera-top={10}
                shadow-camera-bottom={-10}
            />
            <pointLight position={[0, -10, 0]} intensity={0.5} />
            <OrbitControls autoRotate enableZoom={false} maxPolarAngle={Math.PI / 4} minPolarAngle={Math.PI / 4} />
            {lotus.scene && <primitive object={lotus.scene} scale={1.0} position={[0, 0, 0]} rotation={[0, 0, 0]} />}
        </Canvas>
    );
};

export default Lotus;

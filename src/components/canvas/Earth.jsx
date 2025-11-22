import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";

import CanvasLoader from "../Loader";

const Earth = () => {
    const earth = useGLTF("/spaceman/scene.gltf");

    return <primitive object={earth.scene} scale={2.4} position-y={0} rotation-y={Math.PI / -1.31} />;
};

const EarthCanvas = () => {
    return (
        <Canvas
            shadows
            frameloop="demand"
            dpr={[1, 2]}
            gl={{ preserveDrawingBuffer: true }}
            camera={{
                fov: 45,
                near: 0.1,
                far: 200,
                position: [9, -3, 6],
            }}
        >
            {/* Add a directional light */}
            <directionalLight
                intensity={0.90} // Adjust the light intensity as needed
                castShadow={true}
                shadow-mapSize-width={1024}
                position={[-8, -2., 0]} // The light is positioned above the scene
                rotation={[5, 0, 0]}
            />

            {/* Add a point light */}
            <pointLight
                position={[-5.9, 13, 150]}
                intensity={1.5}
                distance={450}
            />

            <Suspense fallback={<CanvasLoader />}>
                <OrbitControls
                    enablePan={false} // Disable camera panning with right-click
                    autoRotate
                    enableZoom={true}
                    enableDamping={false}

                    maxPolarAngle={Math.PI / 2}
                    minPolarAngle={Math.PI / 12}
                    minDistance={8.5}
                    maxDistance={11.5}
                    // Ajoutez ces propriétés pour bloquer l'angle gauche-droite (yaw)
                    // Par exemple, ici, nous bloquons l'angle à Math.PI / 4 radians (45 degrés)
                    minAzimuthAngle={Math.PI / 4}
                    maxAzimuthAngle={-Math.PI /8}

                />
                <Earth class="moon" />
                <Preload all />
            </Suspense>
        </Canvas>
    );
};

export default EarthCanvas;

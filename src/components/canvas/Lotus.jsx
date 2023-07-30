import React, {Suspense} from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";

import CanvasLoader from "../Loader";

const Lotus = () => {
    const lotus = useGLTF("/lotus_flower/scene.gltf");

    return (

        <primitive object={lotus.scene} scale={2.4} position-y={0} rotation-y={0} />

    );
};

const LotusCanvas = () => {
    return (
        <Canvas

            frameloop="demand"
            dpr={[1, 2]}
            gl={{ preserveDrawingBuffer: true }}
            camera={{
                fov: 45,
                near: 0.1,
                far: 200,
                position: [-4, 3, 6],
            }}
        >
            <spotLight
                position={[-10, -10, 90]}
                angle={180}
                penumbra={0}
                intensity={12}

                shadow-mapSize={5024}
            />
            <Suspense fallback={<CanvasLoader />}>
                <OrbitControls
                    autoRotate
                    enableZoom={false}
                    maxPolarAngle={Math.PI}
                    minPolarAngle={Math.PI / 2}
                />
                <Lotus />

                <Preload all />
            </Suspense>
        </Canvas>
    );
};
export default LotusCanvas;
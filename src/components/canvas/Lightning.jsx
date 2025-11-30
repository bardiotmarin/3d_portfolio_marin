import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSpring, animated } from "@react-spring/three";

// Fonction pour generer la "forme" d'un éclair
function getRandomPoints(num = 7, length = 2.2, direction = "vertical") {
  const pts = [new THREE.Vector3(0, 0, 0)];
  for (let i = 1; i < num; i++) {
    pts.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        i * (length / (num - 1)) + (direction === "diagonal" ? i * 0.13 : 0),
        (Math.random() - 0.5) * 0.33
      )
    );
  }
  return pts;
}

const Lightning = ({
  numPoints = 7,
  thickness = 0.06,
  length = 2.2,
  colorStart = "#fffacd",
  colorEnd = "#65b3ff",
  direction = "vertical",
  fusion = "vertical", // Pour ton dégradé
  ...props
}) => {
  const ref = useRef();
  const points = useRef(getRandomPoints(numPoints, length, direction)).current;

  // Animation du gradient de couleur
  const [{ clrStart, clrEnd }, setColor] = useSpring(() => ({
    clrStart: colorStart,
    clrEnd: colorEnd,
    config: { duration: 900 },
  }));

  React.useEffect(() => {
    const handle = () => {
      const nextA = `hsl(${Math.floor(Math.random() * 360)}, 100%, 74%)`;
      const nextB = `hsl(${Math.floor(Math.random() * 360)}, 100%, 68%)`;
      setColor({ clrStart: nextA, clrEnd: nextB });
      for (let i = 1; i < points.length; i++) {
        points[i].x = (Math.random() - 0.5) * 0.7;
        points[i].y = i * (length / numPoints) + (direction === "diagonal" ? i * 0.14 : 0);
        points[i].z = (Math.random() - 0.5) * 0.44;
      }
    };
    window.addEventListener("scroll", handle);
    window.addEventListener("click", handle);
    return () => {
      window.removeEventListener("scroll", handle);
      window.removeEventListener("click", handle);
    };
  }, [setColor, points, length, numPoints, direction]);

  useFrame(() => {
    points.forEach((p, i) => {
      if (i > 0) {
        p.x += (Math.random() - 0.5) * 0.0012;
        p.z += (Math.random() - 0.5) * 0.002;
      }
    });
    ref.current.setFromPoints(points);
  });

  // Pour la version ultra-push : tu peux ajouter un ShaderMaterial custom pour vrai dégradé vertical, mais déjà ce code marche visuellement avec animation de la couleur.
  return (
    <group {...props}>
      <animated.line ref={ref}>
        <bufferGeometry attach="geometry" />
        {/* Color dynamique : tu vois la couleur BASE */}
        <animated.lineBasicMaterial
          attach="material"
          linewidth={6}
          color={clrStart}
        />
      </animated.line>
      {/* Halo transparent autour pour effet lumineux */}
      <mesh>
        <tubeGeometry args={[new THREE.CatmullRomCurve3(points), 64, thickness * 2, 8, false]} />
        <meshBasicMaterial
          transparent
          opacity={0.19}
          color={clrEnd}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};

export default Lightning;

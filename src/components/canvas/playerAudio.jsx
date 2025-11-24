import React, { useEffect, useRef, useContext } from "react";
import * as THREE from "three";
import { AudioPlayerContext } from "../../context/AudioPlayerContext";

const AudioVisualizer = () => {
  const containerRef = useRef(null);
  
  // ✅ Utilise le Context au lieu du state local
  const { isPlaying, audioData } = useContext(AudioPlayerContext);
  
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const materialRef = useRef(null);
  const animationIdRef = useRef(0);
  
  // ✅ State pour l'interaction souris
  const mouseRef = useRef({ x: 0, y: 0, isDown: false });
  const targetMouseRef = useRef({ x: 0, y: 0 });
  
  const stateRef = useRef({
    time: 0,
    lowFreq: 0,
    midFreq: 0,
    highFreq: 0,
    kickEnergy: 0
  });

  const getResponsiveYPosition = () => {
    const width = window.innerWidth;
    if (width < 500) return -0.15;
    if (width < 768) return -0.25;
    if (width < 1024) return -0.30;
    return -0.35;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // ✅ Event listeners
    const handleMouseMove = (e) => {
      const rect = containerRef.current.getBoundingClientRect();
      targetMouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      targetMouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handleMouseDown = () => {
      if (!isPlaying) {
        mouseRef.current.isDown = true;
      }
    };

    const handleMouseUp = () => {
      mouseRef.current.isDown = false;
    };

    const handleTouchStart = (e) => {
      if (!isPlaying) {
        mouseRef.current.isDown = true;
        const rect = containerRef.current.getBoundingClientRect();
        const touch = e.touches[0];
        targetMouseRef.current.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        targetMouseRef.current.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
      }
    };

    const handleTouchMove = (e) => {
      const rect = containerRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      targetMouseRef.current.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      targetMouseRef.current.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handleTouchEnd = () => {
      mouseRef.current.isDown = false;
    };

    // --- SHADERS ---
    const vertexShaderSource = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision highp float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform float lowFreq;
      uniform float midFreq;
      uniform float highFreq;
      uniform float kickEnergy;
      uniform float yPosition;
      uniform vec2 iMouse;
      uniform float mouseStrength;

      varying vec2 vUv;

      // --- BRUIT ET FBM ---
      vec3 hash33(vec3 p) { 
        float n = sin(dot(p, vec3(7, 157, 113)));    
        return fract(vec3(2097152, 262144, 32768) * n); 
      }
      
      float noise(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(mix(hash33(i).x, hash33(i + vec3(1,0,0)).x, f.x),
                       mix(hash33(i + vec3(0,1,0)).x, hash33(i + vec3(1,1,0)).x, f.x), f.y),
                   mix(mix(hash33(i + vec3(0,0,1)).x, hash33(i + vec3(1,0,1)).x, f.x),
                       mix(hash33(i + vec3(0,1,1)).x, hash33(i + vec3(1,1,1)).x, f.x), f.y), f.z);
      }

      float fbm(vec3 p) {
        float v = 0.0;
        float a = 0.5;
        vec3 shift = vec3(100);
        for (int i = 0; i < 5; ++i) {
          v += a * noise(p);
          p = p * 2.0 + shift;
          a *= 0.5;
        }
        return v;
      }

      // --- FONCTION SLIME (SMOOTH MIN) ---
      float smin(float a, float b, float k) {
        float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
        return mix(b, a, h) - k * h * (1.0 - h);
      }

      float map(vec3 p) {
        float t = iTime * 0.5;
        
        // Rotation
        vec3 q = p;
        q.xz *= mat2(cos(t), -sin(t), sin(t), cos(t));
        
        // 1. Forme Principale
        float distortion = fbm(q * 1.5 + iTime);
        distortion += sin(q.x * 5.0 + iTime * 3.0) * (lowFreq * 0.02);
        float d1 = length(q) - distortion * 0.23; 

        // 2. Forme Souris
        vec3 mousePos = vec3(iMouse.x, iMouse.y, 0.0);
        float d2 = length(p - mousePos) - 0.05;

        // 3. Fusion Slime
        float k = 1.2 * mouseStrength; 
        if (mouseStrength < 0.01) return d1;
        
        return smin(d1, d2, k);
      }

      vec3 calcNormal(vec3 p) {
        vec2 e = vec2(0.001, 0.0);
        return normalize(vec3(
          map(p + e.xyy) - map(p - e.xyy),
          map(p + e.yxy) - map(p - e.yxy),
          map(p + e.yyx) - map(p - e.yyx)
        ));
      }

      vec3 palette(float t) {
        vec3 a = vec3(0.5, 0.5, 0.5);
        vec3 b = vec3(0.5, 0.5, 0.5);
        vec3 c = vec3(1.0, 1.0, 1.0);
        vec3 d = vec3(0.00, 0.33, 0.67);
        return a + b * cos(6.28318 * (c * t + d));
      }

      void mainImage(out vec4 fragColor, in vec2 fragCoord) {
        vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
        
        vec3 ro = vec3(0.0, yPosition, 4.0); 
        vec3 rd = normalize(vec3(uv, -1.0));
        
        float t = 0.0;
        float d = 0.0;
        int hit = 0;
        
        // Raymarching
        for(int i = 0; i < 64; i++) {
          vec3 p = ro + rd * t;
          d = map(p);
          if(d < 0.001) { hit = 1; break; }
          if(t > 10.0) break;
          t += d;
        }
        
        vec4 finalColor = vec4(0.0);
        
        if(hit == 1) {
          vec3 p = ro + rd * t;
          vec3 n = calcNormal(p);
          
          float noiseVal = fbm(p * 2.0 + iTime);
          
          // --- EFFET ABERRATION CHROMATIQUE (PRISME) ---
          // On calcule la couleur 3 fois avec un léger décalage pour R, G et B
          // Cela donne l'effet "verre liquide" sur les bords
          float aberration = 0.05; // Intensité de l'effet prisme
          
          vec3 col;
          col.r = palette(noiseVal + lowFreq * 0.01 - aberration).r;
          col.g = palette(noiseVal + lowFreq * 0.01).g;
          col.b = palette(noiseVal + lowFreq * 0.01 + aberration).b;
          
          // Fresnel (Reflet sur les bords)
          float fresnel = pow(1.0 - max(0.0, dot(n, -rd)), 3.0);
          
          // Ajout d'un reflet spéculaire très net pour l'effet "mouillé/gluant"
          col += vec3(1.0) * fresnel * 0.5; 

          // --- GESTION TRANSPARENCE ---
          // Base très faible (0.05) pour voir à travers
          // Le fresnel ajoute de l'opacité sur les bords pour définir la forme
          float alpha = clamp(fresnel * 0.8 + 0.05, 0.0, 0.5);
          
          finalColor = vec4(col, alpha);
        } else {
          // Lueur de fond
          float dist = length(uv - vec2(0.0, yPosition - 0.15)); 
          float glow = 0.01 / (dist - 0.1);
          glow = clamp(glow, 0.0, 0.6);
          finalColor = vec4(vec3(0.5, 0.8, 1.0) * glow, glow * 0.3);
        }
        
        fragColor = finalColor;
      }

      void main() {
        mainImage(gl_FragColor, gl_FragCoord.xy);
      }
    `;

    // --- INIT THREE.JS ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    camera.position.z = 1;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.pointerEvents = 'auto';
    rendererRef.current = renderer;
    containerRef.current.appendChild(renderer.domElement);

    const shaderMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexShaderSource,
      fragmentShader: fragmentShaderSource,
      uniforms: {
        iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        iTime: { value: 0 },
        lowFreq: { value: 0 },
        midFreq: { value: 0 },
        highFreq: { value: 0 },
        kickEnergy: { value: 0 },
        yPosition: { value: getResponsiveYPosition() },
        iMouse: { value: new THREE.Vector2(0, 0) },
        mouseStrength: { value: 0 }
      },
      transparent: true,
      blending: THREE.NormalBlending
    });
    materialRef.current = shaderMaterial;

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, shaderMaterial);
    scene.add(mesh);

    containerRef.current.addEventListener('mousemove', handleMouseMove);
    containerRef.current.addEventListener('mousedown', handleMouseDown);
    containerRef.current.addEventListener('mouseup', handleMouseUp);
    containerRef.current.addEventListener('touchstart', handleTouchStart);
    containerRef.current.addEventListener('touchmove', handleTouchMove);
    containerRef.current.addEventListener('touchend', handleTouchEnd);

    // --- ANIMATION LOOP ---
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      mouseRef.current.x = THREE.MathUtils.lerp(mouseRef.current.x, targetMouseRef.current.x, 0.1);
      mouseRef.current.y = THREE.MathUtils.lerp(mouseRef.current.y, targetMouseRef.current.y, 0.1);
      
      if (audioData && audioData.analyser && isPlaying) {
        const dataArray = new Uint8Array(audioData.analyser.frequencyBinCount);
        audioData.analyser.getByteFrequencyData(dataArray);
        
        let low = 0, mid = 0;
        for(let i = 0; i < 5; i++) low += dataArray[i];
        for(let i = 5; i < 20; i++) mid += dataArray[i];
        
        const rawLow = low / 5;
        const rawKick = dataArray[2];
        
        stateRef.current.lowFreq = THREE.MathUtils.lerp(stateRef.current.lowFreq, rawLow, 0.3);
        stateRef.current.midFreq = THREE.MathUtils.lerp(stateRef.current.midFreq, mid / 15, 0.1);
        stateRef.current.kickEnergy = THREE.MathUtils.lerp(stateRef.current.kickEnergy, rawKick * 2.0, 0.4);
      } else {
        stateRef.current.lowFreq *= 0.95;
        stateRef.current.midFreq *= 0.95;
        stateRef.current.kickEnergy *= 0.9;
      }

      stateRef.current.time += 0.01;

      if (materialRef.current) {
        const u = materialRef.current.uniforms;
        u.iTime.value = stateRef.current.time;
        u.lowFreq.value = stateRef.current.lowFreq;
        u.midFreq.value = stateRef.current.midFreq;
        u.kickEnergy.value = stateRef.current.kickEnergy;
        
        u.iMouse.value.set(mouseRef.current.x, mouseRef.current.y);
        
        const targetStrength = mouseRef.current.isDown ? 1.0 : 0.0;
        u.mouseStrength.value = THREE.MathUtils.lerp(u.mouseStrength.value, targetStrength, 0.1);
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if(rendererRef.current && materialRef.current) {
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
        materialRef.current.uniforms.iResolution.value.set(window.innerWidth, window.innerHeight);
        materialRef.current.uniforms.yPosition.value = getResponsiveYPosition();
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
        containerRef.current.removeEventListener('mousedown', handleMouseDown);
        containerRef.current.removeEventListener('mouseup', handleMouseUp);
        containerRef.current.removeEventListener('touchstart', handleTouchStart);
        containerRef.current.removeEventListener('touchmove', handleTouchMove);
        containerRef.current.removeEventListener('touchend', handleTouchEnd);
      }
      cancelAnimationFrame(animationIdRef.current);
      if (rendererRef.current && containerRef.current) {
        if (containerRef.current.contains(rendererRef.current.domElement)) {
            containerRef.current.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current.dispose();
      }
    };
  }, [isPlaying, audioData]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-auto" />
    </div>
  );
};

export default AudioVisualizer;

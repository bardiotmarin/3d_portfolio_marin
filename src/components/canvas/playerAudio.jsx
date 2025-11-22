import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import audioFile from '../../assets/music/ECHO8.ogg';


const AudioVisualizer = () => {
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const materialRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioElementRef = useRef(null);
  const animationIdRef = useRef(0);
  
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const bandEnergiesRef = useRef(Array(8).fill(0));
  
  const stateRef = useRef({
    time: 0,
    idleAnimation: 0,
    transitionFactor: 0,
    lowFreq: 0,
    midFreq: 0,
    highFreq: 0,
    kickDetected: false,
    kickEnergy: 0,
    kickImpactDuration: 0
  });

  useEffect(() => {
    if (!containerRef.current) return;

    // --- CONFIGURATION ---
    const settings = {
      baseSpeed: 1.0,
      idleSpeed: 0.1,
      bassReactivity: 0.4,
      midReactivity: 0.5,
      highReactivity: 0.4,
      kickReactivity: 0.6,
      bounceIntensity: 0.15,
      waveIntensity: 0.08,
      waveComplexity: 2.2,
      rippleIntensity: 0.25,
      lineThickness: 1.8,
      lineStraightness: 2.53,
      idleWaveHeight: 0.01,
      enableGrain: true,
      grainIntensity: 0.0009,
      grainSpeed: 2.0,
      grainMean: 0.0,
      grainVariance: 0.5,
      color1In: [255, 200, 0],
      color1Out: [255, 100, 0],
      color2In: [255, 100, 100],
      color2Out: [200, 50, 50],
      color3In: [255, 150, 50],
      color3Out: [200, 100, 0],
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
      uniform float transitionFactor;
      uniform float lineStraightness;
      uniform float idleAnimation;
      uniform float idleWaveHeight;
      uniform float kickEnergy;
      uniform float bounceIntensity;
      uniform float waveIntensity;
      uniform float waveComplexity;
      uniform float rippleIntensity;
      uniform float lineThickness;
      uniform bool enableGrain;
      uniform float grainIntensity;
      uniform float grainSpeed;
      uniform float grainMean;
      uniform float grainVariance;
      
      // Variables manquantes ajoutées ici
      uniform float baseSpeed;
      uniform float idleSpeed;
      uniform float bassReactivity;
      uniform float midReactivity;
      uniform float highReactivity;
      uniform float kickReactivity;
      uniform float bounceEffect;

      uniform vec3 color1In;
      uniform vec3 color1Out;
      uniform vec3 color2In;
      uniform vec3 color2Out;
      uniform vec3 color3In;
      uniform vec3 color3Out;

      varying vec2 vUv;

      float squared(float value) { return value * value; }
      float smootherstep(float edge0, float edge1, float x) {
        float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
        return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
      }

      float gaussian(float z, float u, float o) {
        return (1.0 / (o * sqrt(2.0 * 3.1415))) * exp(-(((z - u) * (z - u)) / (2.0 * (o * o))));
      }

      vec3 applyGrain(vec3 color, vec2 uv) {
        if (!enableGrain) return color;
        float t = iTime * grainSpeed;
        float seed = dot(uv, vec2(12.9898, 78.233));
        float noise = fract(sin(seed) * 43758.5453 + t);
        noise = gaussian(noise, grainMean, grainVariance * grainVariance);
        return color + vec3(noise) * grainIntensity;
      }

      float kickRipple(vec2 uv, float energy, float time) {
        float dist = distance(uv, vec2(0.5, 0.5));
        float width = 0.05;
        float speed = 1.2;
        float ripple1 = smootherstep(energy * speed * time - width, energy * speed * time, dist);
        ripple1 *= smootherstep(dist, dist + width, energy * speed * time + width);
        return ripple1 * energy * 0.7;
      }

      void mainImage(out vec4 fragColor, in vec2 fragCoord) {
        vec2 p = fragCoord.xy / iResolution.xy;
        vec3 bgCol = vec3(0.0); 
        
        float speed = mix(idleSpeed, baseSpeed, transitionFactor);
        float ballVisibility = mix(0.8, 0.2, transitionFactor);
        float straightnessFactor = mix(1.0, lineStraightness, transitionFactor);
        float idleWave = idleWaveHeight * sin(p.x * 5.0 + idleAnimation * 0.2);
        
        float bassPulse = squared(lowFreq) * bassReactivity * transitionFactor;
        float midPulse = squared(midFreq) * midReactivity * transitionFactor;
        float highPulse = squared(highFreq) * highReactivity * transitionFactor;
        float kickPulse = squared(kickEnergy) * kickReactivity * 1.5 * transitionFactor;
        float bounce = bounceEffect * bounceIntensity * transitionFactor;
        
        float curveIntensity = mix(idleWaveHeight, 0.05 + waveIntensity * (bassPulse + kickPulse * 0.7), transitionFactor);
        float curve = curveIntensity * sin((6.25 * p.x) + (speed * iTime));
        float ripple = rippleIntensity * kickRipple(p, kickEnergy, mod(iTime, 10.0)) * transitionFactor;
        
        float audioWave = mix(0.0, (0.1 * sin(p.x * 20.0 * waveComplexity) * bassPulse + 0.08 * sin(p.x * 30.0 * waveComplexity) * midPulse + 0.05 * sin(p.x * 50.0 * waveComplexity) * highPulse) / straightnessFactor, transitionFactor);
        
        // Line A
        float lineAFreq = 40.0 * waveComplexity + 80.0 * bassPulse + 90.0 * kickPulse;
        float lineASpeed = 1.5 * speed + 6.0 * bassPulse + 6.0 * kickPulse;
        float lineAWave = mix(idleWave, (0.01 + 0.05 * bassPulse + 0.1 * kickPulse) / straightnessFactor, transitionFactor);
        float kickWaveEffect = (kickEnergy > 0.1) ? kickEnergy * 0.3 * sin(15.0 * (p.x - iTime * 0.5)) * transitionFactor : 0.0;
        float lineAOffset = bassPulse * 0.3 * sin(p.x * 10.0 - iTime * 2.0) + kickWaveEffect * 0.7;
        float lineAAnim = mix(0.5 + idleWave, 0.5 + curve + audioWave + lineAWave * sin((lineAFreq * p.x) + (-lineASpeed * iTime)) + lineAOffset - bounce, transitionFactor);
        float lineAThickness = lineThickness * (1.0 + bassPulse * 0.4 + kickPulse * 0.8);
        float lineAShape = smootherstep(1.0 - clamp(distance(p.y, lineAAnim) * (2.0 / lineAThickness), 0.0, 1.0), 1.0, 0.99);
        vec3 lineACol = (1.0 - lineAShape) * vec3(mix(color1In, color1Out, lineAShape));
        
        // Ball A
        float ballASize = 0.5 + 0.4 * bassPulse + kickEnergy * 1.2 * transitionFactor;
        float ballAX = 0.2 + 0.1 * sin(iTime * 0.2 * speed) * midPulse;
        float ballAShape = smootherstep(1.0 - clamp(distance(p, vec2(ballAX, lineAAnim)) * ballASize, 0.0, 1.0), 1.0, 0.99);
        vec3 ballACol = (1.0 - ballAShape) * vec3(mix(color1In, color1Out, ballAShape)) * mix(1.0, ballVisibility, transitionFactor);
        
        // Line B
        float lineBFreq = 50.0 * waveComplexity + 100.0 * midPulse;
        float lineBSpeed = 2.0 * speed + 8.0 * midPulse;
        float lineBWave = mix(idleWave * 0.8, (0.01 + 0.05 * midPulse) / straightnessFactor, transitionFactor);
        float lineBOffset = midPulse * 0.2 * sin(p.x * 15.0 - iTime * 1.5) + kickEnergy * 0.1 * sin(p.x * 25.0 - iTime * 3.0) * transitionFactor;
        float lineBAnim = mix(0.5 + idleWave * 0.8, 0.5 + curve - audioWave + lineBWave * sin((lineBFreq * p.x) + (lineBSpeed * iTime)) * sin(lineBSpeed * iTime) + lineBOffset - bounce * 0.5, transitionFactor);
        float lineBThickness = lineThickness * (1.0 + midPulse * 0.3 + kickEnergy * 0.3 * transitionFactor);
        float lineBShape = smootherstep(1.0 - clamp(distance(p.y, lineBAnim) * (2.0 / lineBThickness), 0.0, 1.0), 1.0, 0.99);
        vec3 lineBCol = (1.0 - lineBShape) * vec3(mix(color2In, color2Out, lineBShape));
        
        // Ball B
        float ballBSize = 0.5 + 0.4 * highPulse + kickEnergy * 0.3 * transitionFactor;
        float ballBX = 0.8 - 0.1 * sin(iTime * 0.3 * speed) * midPulse;
        float ballBShape = smootherstep(1.0 - clamp(distance(p, vec2(ballBX, lineBAnim)) * ballBSize, 0.0, 1.0), 1.0, 0.99);
        vec3 ballBCol = (1.0 - ballBShape) * vec3(mix(color2In, color2Out, ballBShape)) * mix(1.0, ballVisibility, transitionFactor);
        
        // Line C
        float lineCFreq = 60.0 * waveComplexity + 120.0 * highPulse;
        float lineCSpeed = 2.5 * speed + 10.0 * highPulse;
        float lineCWave = mix(idleWave * 1.2, (0.01 + 0.05 * highPulse) / straightnessFactor, transitionFactor);
        float lineCOffset = highPulse * 0.15 * sin(p.x * 20.0 - iTime * 1.0);
        float lineCAnim = mix(0.5 + idleWave * 1.2, 0.5 + curve * 0.7 - audioWave * 0.5 + lineCWave * sin((lineCFreq * p.x) + (lineCSpeed * iTime)) * sin(lineCSpeed * (iTime + 0.1)) + lineCOffset - bounce * 0.3, transitionFactor);
        float lineCThickness = lineThickness * (1.0 + highPulse * 0.2 + kickEnergy * 0.1 * transitionFactor);
        float lineCShape = smootherstep(1.0 - clamp(distance(p.y, lineCAnim) * (2.0 / lineCThickness), 0.0, 1.0), 1.0, 0.99);
        vec3 lineCCol = (1.0 - lineCShape) * vec3(mix(color3In, color3Out, lineCShape));
        
        // Ball C
        float ballCSize = 0.5 + 0.4 * highPulse + kickEnergy * 0.1 * transitionFactor;
        float ballCX = 0.5 + 0.15 * sin(iTime * 0.4 * speed) * highPulse;
        float ballCShape = smootherstep(1.0 - clamp(distance(p, vec2(ballCX, lineCAnim)) * ballCSize, 0.0, 1.0), 1.0, 0.99);
        vec3 ballCCol = (1.0 - ballCShape) * vec3(mix(color3In, color3Out, ballCShape)) * mix(1.0, ballVisibility, transitionFactor);
        
        vec3 rippleCol = vec3(1.0, 0.8, 0.4) * ripple * transitionFactor;
        
        vec3 fcolor = bgCol + lineACol + lineBCol + lineCCol + ballACol + ballBCol + ballCCol + rippleCol;
        fcolor = applyGrain(fcolor, p);
        
        // --- CORRECTION TRANSPARENCE ---
        // On calcule l'alpha basé sur la luminosité de la couleur finale
        // Si c'est noir (0,0,0), l'alpha sera 0 (transparent)
        float brightness = length(fcolor);
        float alpha = smoothstep(0.0, 0.1, brightness); 
        
        fragColor = vec4(fcolor, alpha);
      }

      void main() {
        mainImage(gl_FragColor, vUv * iResolution);
      }
    `;

    // --- INIT THREE.JS ---
    const init = () => {
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      camera.position.z = 1;
      cameraRef.current = camera;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setClearColor(0x000000, 0); 
      renderer.setSize(window.innerWidth, window.innerHeight);
      // IMPORTANT : on laisse passer les événements souris à travers le canvas
      renderer.domElement.style.pointerEvents = 'none'; 
      rendererRef.current = renderer;
      containerRef.current.appendChild(renderer.domElement);

      const shaderMaterial = new THREE.ShaderMaterial({
        vertexShader: vertexShaderSource,
        fragmentShader: fragmentShaderSource,
        uniforms: {
          iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
          iTime: { value: 0 },
          iMouse: { value: new THREE.Vector2(0.5, 0.5) },
          lowFreq: { value: 0 },
          midFreq: { value: 0 },
          highFreq: { value: 0 },
          isPlaying: { value: false },
          transitionFactor: { value: 0 },
          lineStraightness: { value: settings.lineStraightness },
          idleAnimation: { value: 0 },
          idleWaveHeight: { value: settings.idleWaveHeight },
          kickEnergy: { value: 0 },
          beatPhase: { value: 0 },
          bounceEffect: { value: 0 },
          baseSpeed: { value: settings.baseSpeed },
          idleSpeed: { value: settings.idleSpeed },
          bassReactivity: { value: settings.bassReactivity },
          midReactivity: { value: settings.midReactivity },
          highReactivity: { value: settings.highReactivity },
          kickReactivity: { value: settings.kickReactivity },
          bounceIntensity: { value: settings.bounceIntensity },
          waveIntensity: { value: settings.waveIntensity },
          waveComplexity: { value: settings.waveComplexity },
          rippleIntensity: { value: settings.rippleIntensity },
          lineThickness: { value: settings.lineThickness },
          enableGrain: { value: settings.enableGrain },
          grainIntensity: { value: settings.grainIntensity },
          grainSpeed: { value: settings.grainSpeed },
          grainMean: { value: settings.grainMean },
          grainVariance: { value: settings.grainVariance },
          color1In: { value: new THREE.Vector3(...settings.color1In).divideScalar(255) },
          color1Out: { value: new THREE.Vector3(...settings.color1Out).divideScalar(255) },
          color2In: { value: new THREE.Vector3(...settings.color2In).divideScalar(255) },
          color2Out: { value: new THREE.Vector3(...settings.color2Out).divideScalar(255) },
          color3In: { value: new THREE.Vector3(...settings.color3In).divideScalar(255) },
          color3Out: { value: new THREE.Vector3(...settings.color3Out).divideScalar(255) },
        },
        transparent: true,
      });
      materialRef.current = shaderMaterial;

      const geometry = new THREE.PlaneGeometry(2, 2);
      const mesh = new THREE.Mesh(geometry, shaderMaterial);
      scene.add(mesh);
    };

    const getWeightedAverage = (array) => {
        if (array.length === 0) return 0;
        let sum = 0;
        let weight = 0;
        let maxVal = 0;
        for (let i = 0; i < array.length; i++) {
            const value = array[i] / 255;
            maxVal = Math.max(maxVal, value);
            sum += Math.pow(value, 1.5);
            weight++;
        }
        const avg = sum / weight;
        return avg * 0.7 + maxVal * 0.3;
    };

    const updateFrequencies = () => {
       if (!analyserRef.current) return;
       const dataArray = dataArrayRef.current;
       analyserRef.current.getByteFrequencyData(dataArray);
       const state = stateRef.current;

       const bands = [[1, 4], [4, 9], [9, 20], [20, 40], [40, 80], [80, 160], [160, 300], [300, 500]];
       for(let i=0; i<bands.length; i++) {
           const [start, end] = bands[i];
           const avg = getWeightedAverage(dataArray.slice(start, end));
           bandEnergiesRef.current[i] = avg;
       }
       
       const kickAvg = bandEnergiesRef.current[1];
       if (kickAvg > 0.15 && kickAvg > state.kickEnergy + 0.05) {
           state.kickDetected = true;
           state.kickEnergy = kickAvg;
       } else {
           state.kickDetected = false;
           state.kickEnergy *= 0.8;
       }

       state.lowFreq = bandEnergiesRef.current[2];
       state.midFreq = bandEnergiesRef.current[4];
       state.highFreq = bandEnergiesRef.current[6];
       
       if(materialRef.current) {
         const u = materialRef.current.uniforms;
         u.lowFreq.value = state.lowFreq;
         u.midFreq.value = state.midFreq;
         u.highFreq.value = state.highFreq;
         u.kickEnergy.value = state.kickEnergy;
       }
    };

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      const state = stateRef.current;
      state.time += 0.01;
      state.idleAnimation += 0.01;
      
      const mat = materialRef.current;
      if (mat) {
        mat.uniforms.iTime.value = state.time;
        mat.uniforms.idleAnimation.value = state.idleAnimation;
        
        const targetTransition = audioElementRef.current && !audioElementRef.current.paused ? 1.0 : 0.0;
        if(state.transitionFactor < targetTransition) state.transitionFactor += 0.02;
        if(state.transitionFactor > targetTransition) state.transitionFactor -= 0.02;
        mat.uniforms.transitionFactor.value = state.transitionFactor;

        if(state.transitionFactor > 0) updateFrequencies();
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    init();
    animate();

    const handleResize = () => {
      if (rendererRef.current && materialRef.current) {
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
        materialRef.current.uniforms.iResolution.value.set(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationIdRef.current);
      if(rendererRef.current) {
          rendererRef.current.dispose();
          if(containerRef.current) containerRef.current.removeChild(rendererRef.current.domElement);
      }
      if(audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const togglePlay = async () => {
    if (!audioElementRef.current) {
        const audio = new Audio(audioFile);
        audio.crossOrigin = "anonymous";
        audio.loop = true;
        audioElementRef.current = audio;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        audioContextRef.current = ctx;
        
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        analyserRef.current = analyser;
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
        
        const source = ctx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(ctx.destination);
    }

    if (audioContextRef.current?.state === "suspended") {
        await audioContextRef.current.resume();
    }

    if (isPlaying) {
        audioElementRef.current.pause();
        setIsPlaying(false);
    } else {
        await audioElementRef.current.play();
        setIsPlaying(true);
    }
  };

  return (
    // Container global
    <div className="relative w-full h-full">
      
      {/* 1. Le Canvas (Fond) : pointer-events-none pour laisser passer les clics */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      
      {/* 2. Le Bouton (Devant) : position FIXED et z-index MAX pour être sûr de cliquer */}
      <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[9999] pointer-events-auto">
        <button 
          onClick={togglePlay}
          className="px-8 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full hover:bg-white/20 transition-all font-bold uppercase tracking-widest text-sm cursor-pointer"
        >
          {isPlaying ? "Stop Music" : "Play Music"}
        </button>
      </div>
    </div>
  );
};

export default AudioVisualizer;

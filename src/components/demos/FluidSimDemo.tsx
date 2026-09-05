import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Zap, RotateCw, Play, Pause, Layers, Cpu } from 'lucide-react';

interface Palette {
  name: string;
  colors: THREE.Color[];
}

const PALETTES: Record<string, Palette> = {
  emeraldTeal: {
    name: 'Signal Teal & Emerald',
    colors: [
      new THREE.Color('#0891b2'), // Signal teal
      new THREE.Color('#16a34a'), // Emerald green
      new THREE.Color('#06b6d4'), // Cyan
      new THREE.Color('#059669'), // Deep emerald
    ],
  },
  cyberViolet: {
    name: 'Cyber Violet',
    colors: [
      new THREE.Color('#8b5cf6'),
      new THREE.Color('#6366f1'),
      new THREE.Color('#a855f7'),
      new THREE.Color('#06b6d4'),
    ],
  },
  crimsonCore: {
    name: 'Crimson Core',
    colors: [
      new THREE.Color('#e11d48'),
      new THREE.Color('#f43f5e'),
      new THREE.Color('#ea580c'),
      new THREE.Color('#be123c'),
    ],
  },
};

export const FluidSimDemo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [particleCountSetting, setParticleCountSetting] = useState<number>(25000);
  const [fps, setFps] = useState<number>(60);
  const [flowMode, setFlowMode] = useState<'vortex' | 'laminar' | 'chaos'>('vortex');
  const [activePaletteKey, setActivePaletteKey] = useState<string>('emeraldTeal');
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // References to hold animation & simulation state across renders
  const simStateRef = useRef({
    isPaused: false,
    flowMode: 'vortex' as 'vortex' | 'laminar' | 'chaos',
    particleCount: 25000,
    activePalette: PALETTES.emeraldTeal,
    mouseX: 0,
    mouseY: 0,
    isInteracting: false,
    rotX: 0.2,
    rotY: 0,
    targetRotX: 0.2,
    targetRotY: 0,
  });

  // Sync state refs for requestAnimationFrame
  useEffect(() => {
    simStateRef.current.isPaused = isPaused;
  }, [isPaused]);

  useEffect(() => {
    simStateRef.current.flowMode = flowMode;
  }, [flowMode]);

  useEffect(() => {
    simStateRef.current.activePalette = PALETTES[activePaletteKey] || PALETTES.emeraldTeal;
  }, [activePaletteKey]);

  useEffect(() => {
    simStateRef.current.particleCount = particleCountSetting;
  }, [particleCountSetting]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let renderer: THREE.WebGLRenderer | any = null;
    let isDisposed = false;
    let animationId: number;

    const width = container.clientWidth || 640;
    const height = 340;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 0, 85);

    // 2. Initialize Three.js WebGL Renderer
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // 3. Particle System Geometry
    const maxParticles = 50000;
    const positions = new Float32Array(maxParticles * 3);
    const velocities = new Float32Array(maxParticles * 3);
    const colors = new Float32Array(maxParticles * 3);
    const sizes = new Float32Array(maxParticles);

    const initParticle = (index: number) => {
      const pIdx = index * 3;
      const theta = Math.random() * Math.PI * 2;
      const radius = 6 + Math.random() * 28;
      const heightVal = (Math.random() - 0.5) * 12;

      positions[pIdx] = Math.cos(theta) * radius;
      positions[pIdx + 1] = heightVal;
      positions[pIdx + 2] = Math.sin(theta) * radius;

      const speed = 0.35 + Math.random() * 0.45;
      velocities[pIdx] = -Math.sin(theta) * speed;
      velocities[pIdx + 1] = (Math.random() - 0.5) * 0.1;
      velocities[pIdx + 2] = Math.cos(theta) * speed;

      const palette = simStateRef.current.activePalette.colors;
      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[pIdx] = col.r;
      colors[pIdx + 1] = col.g;
      colors[pIdx + 2] = col.b;

      sizes[index] = Math.random() * 2.8 + 1.2;
    };

    for (let i = 0; i < maxParticles; i++) {
      initParticle(i);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Custom Particle Sprite Texture
    const createCircleTexture = () => {
      const texCanvas = document.createElement('canvas');
      texCanvas.width = 64;
      texCanvas.height = 64;
      const ctx = texCanvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.35, 'rgba(255,255,255,0.7)');
        gradient.addColorStop(0.85, 'rgba(255,255,255,0.1)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
      }
      return new THREE.CanvasTexture(texCanvas);
    };

    const particleMaterial = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      map: createCircleTexture(),
    });

    const particleSystem = new THREE.Points(geometry, particleMaterial);
    scene.add(particleSystem);

    // Subtle 3D Wireframe Boundary Cage
    const cageGeo = new THREE.BoxGeometry(70, 45, 70);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0x334155,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const cage = new THREE.Mesh(cageGeo, cageMat);
    scene.add(cage);

    // 4. Mouse / Touch Controls & Attractor Raycasting
    let isDragging = false;
    let prevPointerX = 0;
    let prevPointerY = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevPointerX = clientX;
      prevPointerY = clientY;
      simStateRef.current.isInteracting = true;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      simStateRef.current.mouseX = ((clientX - rect.left) / rect.width) * 2 - 1;
      simStateRef.current.mouseY = -(((clientY - rect.top) / rect.height) * 2 - 1);

      if (isDragging) {
        const deltaX = clientX - prevPointerX;
        const deltaY = clientY - prevPointerY;
        prevPointerX = clientX;
        prevPointerY = clientY;

        simStateRef.current.targetRotY += deltaX * 0.008;
        simStateRef.current.targetRotX += deltaY * 0.008;
        simStateRef.current.targetRotX = Math.max(-1.2, Math.min(1.2, simStateRef.current.targetRotX));
      }
    };

    const onPointerUp = () => {
      isDragging = false;
      simStateRef.current.isInteracting = false;
    };

    canvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    canvas.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // 5. Simulation & Render Loop
    let lastTime = performance.now();
    let frameCounter = 0;
    let lastFpsUpdate = performance.now();

    const animate = (time: number) => {
      if (isDisposed) return;
      animationId = requestAnimationFrame(animate);

      frameCounter++;
      if (time - lastFpsUpdate >= 500) {
        setFps(Math.round((frameCounter * 1000) / (time - lastFpsUpdate)));
        frameCounter = 0;
        lastFpsUpdate = time;
      }

      const delta = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      // Smooth camera orbit
      simStateRef.current.rotX += (simStateRef.current.targetRotX - simStateRef.current.rotX) * 0.08;
      simStateRef.current.rotY += (simStateRef.current.targetRotY - simStateRef.current.rotY) * 0.08;

      const distance = 82;
      camera.position.x = distance * Math.sin(simStateRef.current.rotY) * Math.cos(simStateRef.current.rotX);
      camera.position.y = distance * Math.sin(simStateRef.current.rotX);
      camera.position.z = distance * Math.cos(simStateRef.current.rotY) * Math.cos(simStateRef.current.rotX);
      camera.lookAt(0, 0, 0);

      if (!isDragging) {
        simStateRef.current.targetRotY += 0.0015;
      }

      // Physics Integration if not paused
      if (!simStateRef.current.isPaused) {
        const activeCount = simStateRef.current.particleCount;
        const mode = simStateRef.current.flowMode;
        const t = time * 0.001;

        const attractorX = simStateRef.current.mouseX * 30;
        const attractorY = simStateRef.current.mouseY * 20;

        for (let i = 0; i < activeCount; i++) {
          const idx = i * 3;
          let px = positions[idx];
          let py = positions[idx + 1];
          let pz = positions[idx + 2];

          let vx = velocities[idx];
          let vy = velocities[idx + 1];
          let vz = velocities[idx + 2];

          const freq = 0.05;
          const curlX = Math.sin(py * freq + t * 0.8) - Math.cos(pz * freq);
          const curlY = Math.sin(pz * freq) - Math.cos(px * freq + t * 0.6);
          const curlZ = Math.sin(px * freq + t * 0.5) - Math.cos(py * freq);

          if (mode === 'vortex') {
            const distSq = px * px + pz * pz + 1.0;
            const tangentialSpeed = 16.0 / distSq;
            vx += -pz * tangentialSpeed * delta;
            vz += px * tangentialSpeed * delta;
            vx += -px * 0.02 * delta;
            vz += -pz * 0.02 * delta;
            vy += (curlY * 1.5 - py * 0.1) * delta;
          } else if (mode === 'laminar') {
            vx += (curlX * 1.2 + 0.3) * delta;
            vy += (curlY * 0.8) * delta;
            vz += (curlZ * 0.6) * delta;
          } else {
            vx += curlX * 3.5 * delta;
            vy += curlY * 3.5 * delta;
            vz += curlZ * 3.5 * delta;
          }

          if (simStateRef.current.isInteracting) {
            const dx = attractorX - px;
            const dy = attractorY - py;
            const dist = Math.sqrt(dx * dx + dy * dy) + 0.1;
            if (dist < 40) {
              const pull = (1.0 - dist / 40) * 18.0 * delta;
              vx += (dx / dist) * pull;
              vy += (dy / dist) * pull;
              vx += (-dy / dist) * pull * 1.2;
              vy += (dx / dist) * pull * 1.2;
            }
          }

          const friction = mode === 'laminar' ? 0.985 : mode === 'vortex' ? 0.978 : 0.965;
          vx *= friction;
          vy *= friction;
          vz *= friction;

          px += vx;
          py += vy;
          pz += vz;

          const limit = 34;
          if (px > limit || px < -limit || py > limit || py < -limit || pz > limit || pz < -limit) {
            initParticle(i);
            continue;
          }

          positions[idx] = px;
          positions[idx + 1] = py;
          positions[idx + 2] = pz;

          velocities[idx] = vx;
          velocities[idx + 1] = vy;
          velocities[idx + 2] = vz;
        }

        geometry.attributes.position.needsUpdate = true;
      }

      if (renderer) {
        renderer.render(scene, camera);
      }
    };

    animationId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth || 640;
      const h = 340;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      canvas.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      window.removeEventListener('resize', handleResize);

      geometry.dispose();
      particleMaterial.dispose();
      cageGeo.dispose();
      cageMat.dispose();
      if (renderer && renderer.dispose) {
        renderer.dispose();
      }
    };
  }, [particleCountSetting]);

  return (
    <div
      ref={containerRef}
      className="my-6 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4 sm:p-5 shadow-md"
    >
      {/* Header Info & Real-Time Performance HUD */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-[var(--border-subtle)] gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[6px] bg-[var(--color-signal-teal)]/10 text-[var(--color-signal-teal)] flex items-center justify-center font-bold">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[var(--text-primary)] font-semibold tracking-tight uppercase">
                Three.js 3D Particle Fluid
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border text-emerald-700 dark:text-[var(--color-acid-lime)] bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/50">
                WebGL 2.0 Engine
              </span>
            </div>
            <div className="text-[11px] text-[var(--text-muted)] font-mono">
              3D Curl-Noise Navier-Stokes simulation with interactive 3D camera orbit
            </div>
          </div>
        </div>

        {/* Real-time counters */}
        <div className="flex items-center gap-3 text-xs font-mono text-[var(--text-muted)] shrink-0">
          <span className="flex items-center gap-1 font-semibold text-[var(--text-primary)]">
            <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-[var(--color-acid-lime)]" /> {fps} FPS
          </span>
          <span className="text-[var(--text-faint)]">·</span>
          <span className="text-[var(--text-primary)] font-medium">
            {particleCountSetting.toLocaleString()} 3D nodes
          </span>
        </div>
      </div>

      {/* Three.js Interactive 3D Canvas Viewport */}
      <div className="relative rounded-[8px] overflow-hidden border border-[var(--border-subtle)] bg-[#07090e] cursor-grab active:cursor-grabbing shadow-inner">
        <canvas ref={canvasRef} className="w-full block h-[340px]" />

        {/* Floating Controls Overlay */}
        <div className="absolute top-2.5 left-3 flex items-center gap-2 pointer-events-none">
          <div className="px-2 py-1 rounded bg-black/60 backdrop-blur-xs border border-white/10 text-[10px] font-mono text-slate-300 flex items-center gap-1.5">
            <RotateCw className="w-3 h-3 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
            Drag to Orbit in 3D · Touch/Click Attractor
          </div>
        </div>

        <div className="absolute top-2.5 right-3 flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-2 py-1 rounded bg-black/70 hover:bg-black/90 text-white border border-white/15 text-[11px] font-mono flex items-center gap-1 transition-all"
            title={isPaused ? 'Resume Simulation' : 'Pause Simulation'}
          >
            {isPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3 text-cyan-400" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>
        </div>

        <div className="absolute bottom-2 left-3 text-[10px] font-mono text-slate-400/80 pointer-events-none">
          Three.js r185 · Perspective Camera · Additive Alpha Blending · Zero GC in Simulation Loop
        </div>
      </div>

      {/* Bottom Interactive Controls */}
      <div className="flex flex-wrap items-center justify-between mt-3.5 pt-3 border-t border-[var(--border-subtle)] text-xs font-mono text-[var(--text-muted)] gap-3">
        {/* Flow Dynamics Modes */}
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--text-secondary)] font-medium mr-1">Fluid Mode:</span>
          {(['vortex', 'laminar', 'chaos'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFlowMode(mode)}
              className={`px-2.5 py-1 rounded-[5px] text-[11px] capitalize border transition-all ${
                flowMode === mode
                  ? 'bg-[var(--text-primary)] text-[var(--bg-canvas)] border-[var(--text-primary)] font-semibold shadow-xs'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-hover)]'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Particle Density Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--text-secondary)] font-medium mr-1 flex items-center gap-1">
            <Layers className="w-3 h-3 text-[var(--color-signal-teal)]" /> Density:
          </span>
          {[10000, 25000, 50000].map((count) => (
            <button
              key={count}
              onClick={() => setParticleCountSetting(count)}
              className={`px-2 py-1 rounded-[5px] text-[11px] border transition-all ${
                particleCountSetting === count
                  ? 'bg-[var(--text-primary)] text-[var(--bg-canvas)] border-[var(--text-primary)] font-semibold shadow-xs'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-hover)]'
              }`}
            >
              {count >= 1000 ? `${count / 1000}k` : count}
            </button>
          ))}
        </div>

        {/* Color Palette Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--text-secondary)] font-medium mr-1">Palette:</span>
          {Object.entries(PALETTES).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setActivePaletteKey(key)}
              className={`px-2 py-1 rounded-[5px] text-[11px] border transition-all ${
                activePaletteKey === key
                  ? 'bg-[var(--text-primary)] text-[var(--bg-canvas)] border-[var(--text-primary)] font-semibold shadow-xs'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-hover)]'
              }`}
            >
              {val.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

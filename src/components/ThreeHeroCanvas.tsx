import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

export type CanvasThemeMode = 'iridescent' | 'arterial' | 'cyan' | 'monochrome';

interface ThreeHeroCanvasProps {
  onInteract?: () => void;
}

interface ColorPalette {
  name: string;
  colors: THREE.Color[];
  bg: string;
}

const PALETTES: Record<CanvasThemeMode, ColorPalette> = {
  iridescent: {
    name: 'Molten Iridescent',
    bg: '#080808',
    colors: [
      new THREE.Color('#fe1e34'),
      new THREE.Color('#ffac2e'),
      new THREE.Color('#0ae448'),
      new THREE.Color('#00bae2'),
      new THREE.Color('#9d95ff'),
    ],
  },
  arterial: {
    name: 'SVZ Arterial Red',
    bg: '#080808',
    colors: [
      new THREE.Color('#fe1e34'),
      new THREE.Color('#ff0000'),
      new THREE.Color('#8b0000'),
      new THREE.Color('#fcfcfc'),
    ],
  },
  cyan: {
    name: 'Linear Obsidian Teal',
    bg: '#08090a',
    colors: [
      new THREE.Color('#00bae2'),
      new THREE.Color('#02b8cc'),
      new THREE.Color('#38bdf8'),
      new THREE.Color('#e4f222'),
    ],
  },
  monochrome: {
    name: 'GSAP Chalkboard',
    bg: '#0e100f',
    colors: [
      new THREE.Color('#fffce1'),
      new THREE.Color('#d4d2d2'),
      new THREE.Color('#7c7c6f'),
      new THREE.Color('#0ae448'),
    ],
  },
};

export const ThreeHeroCanvas: React.FC<ThreeHeroCanvasProps> = ({ onInteract }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeTheme, setActiveTheme] = useState<CanvasThemeMode>('iridescent');
  const [fps, setFps] = useState<number>(60);

  const simRef = useRef({
    mouseX: 0,
    mouseY: 0,
    targetMouseX: 0,
    targetMouseY: 0,
    clickImpulse: 0,
    time: 0,
    isVisible: true,
    activeTheme: 'iridescent' as CanvasThemeMode,
    densityCount: 16000,
  });

  useEffect(() => {
    simRef.current.activeTheme = activeTheme;
  }, [activeTheme]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animId: number;
    let isDisposed = false;

    const width = container.clientWidth;
    const height = container.clientHeight || 460;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 18, 52);
    camera.lookAt(0, 0, 0);

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    } catch (e) {
      console.warn('Three.js context failed:', e);
      return;
    }

    const count = simRef.current.densityCount;
    const cols = Math.floor(Math.sqrt(count * 1.6));
    const rows = Math.floor(count / cols);
    const actualCount = cols * rows;

    const positions = new Float32Array(actualCount * 3);
    const basePositions = new Float32Array(actualCount * 3);
    const colors = new Float32Array(actualCount * 3);
    const scales = new Float32Array(actualCount);
    const phaseOffsets = new Float32Array(actualCount);

    const xSpacing = 110 / cols;
    const zSpacing = 85 / rows;
    const palette = PALETTES[simRef.current.activeTheme];

    let i = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = (c - cols / 2) * xSpacing;
        const z = (r - rows / 2) * zSpacing;

        const i3 = i * 3;
        positions[i3] = x;
        positions[i3 + 1] = 0;
        positions[i3 + 2] = z;

        basePositions[i3] = x;
        basePositions[i3 + 1] = 0;
        basePositions[i3 + 2] = z;

        const colorRatio = (c / cols + r / rows) * 0.5;
        const colIdx = Math.floor(colorRatio * palette.colors.length) % palette.colors.length;
        const color = palette.colors[colIdx];

        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;

        scales[i] = Math.random() * 1.8 + 0.8;
        phaseOffsets[i] = Math.random() * Math.PI * 2;
        i++;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const createParticleTexture = (): THREE.Texture => {
      const c = document.createElement('canvas');
      c.width = 64;
      c.height = 64;
      const ctx = c.getContext('2d');
      if (ctx) {
        const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(0.3, 'rgba(255,255,255,0.85)');
        grad.addColorStop(0.7, 'rgba(255,255,255,0.25)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);
      }
      return new THREE.CanvasTexture(c);
    };

    const material = new THREE.PointsMaterial({
      size: 1.6,
      vertexColors: true,
      map: createParticleTexture(),
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      simRef.current.targetMouseX = nx;
      simRef.current.targetMouseY = ny;
    };

    const handlePointerDown = () => {
      simRef.current.clickImpulse = 4.5;
      if (onInteract) onInteract();
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    container.addEventListener('mousedown', handlePointerDown);

    const observer = new IntersectionObserver(
      ([entry]) => {
        simRef.current.isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    const handleResize = () => {
      if (!container || !renderer) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight || 460;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = performance.now();

    const animate = () => {
      if (isDisposed) return;
      animId = requestAnimationFrame(animate);

      if (!simRef.current.isVisible) return;

      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      frameCount++;
      if (now - fpsTimer >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        fpsTimer = now;
      }

      simRef.current.mouseX += (simRef.current.targetMouseX - simRef.current.mouseX) * 0.06;
      simRef.current.mouseY += (simRef.current.targetMouseY - simRef.current.mouseY) * 0.06;

      if (simRef.current.clickImpulse > 0.01) {
        simRef.current.clickImpulse *= 0.94;
      } else {
        simRef.current.clickImpulse = 0;
      }

      simRef.current.time += delta * 0.9;
      const t = simRef.current.time;

      const posAttr = geometry.attributes.position as THREE.BufferAttribute;
      const colAttr = geometry.attributes.color as THREE.BufferAttribute;
      const currentPalette = PALETTES[simRef.current.activeTheme];

      const mX = simRef.current.mouseX * 35;
      const mZ = -simRef.current.mouseY * 25;
      const impulse = simRef.current.clickImpulse;

      for (let j = 0; j < actualCount; j++) {
        const j3 = j * 3;
        const bx = basePositions[j3];
        const bz = basePositions[j3 + 2];
        const phase = phaseOffsets[j];

        const wave1 = Math.sin(bx * 0.08 + t * 1.5 + phase) * 3.2;
        const wave2 = Math.cos(bz * 0.09 - t * 1.2) * 2.8;
        const wave3 = Math.sin((bx + bz) * 0.04 + t * 0.8) * 1.8;

        const dx = bx - mX;
        const dz = bz - mZ;
        const distSq = dx * dx + dz * dz;
        const mouseLift = Math.exp(-distSq / 220) * 8.5;

        const rippleDist = Math.sqrt(distSq);
        const ripple = Math.sin(rippleDist * 0.5 - t * 8.0) * impulse * Math.exp(-rippleDist / 40);

        positions[j3 + 1] = wave1 + wave2 + wave3 + mouseLift + ripple;
        positions[j3] = bx + Math.sin(t * 0.5 + bz * 0.05) * 0.8;

        const elevation = (positions[j3 + 1] + 6) / 18;
        const clampedElevation = Math.max(0, Math.min(1, elevation));
        const colorIndex = Math.floor(clampedElevation * (currentPalette.colors.length - 1));
        const c1 = currentPalette.colors[colorIndex];
        const c2 = currentPalette.colors[Math.min(colorIndex + 1, currentPalette.colors.length - 1)];
        const lerpFactor = (clampedElevation * (currentPalette.colors.length - 1)) % 1;

        colors[j3] = c1.r + (c2.r - c1.r) * lerpFactor;
        colors[j3 + 1] = c1.g + (c2.g - c1.g) * lerpFactor;
        colors[j3 + 2] = c1.b + (c2.b - c1.b) * lerpFactor;
      }

      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;

      camera.position.x = Math.sin(t * 0.15) * 4 + simRef.current.mouseX * 6;
      camera.position.y = 18 + Math.cos(t * 0.12) * 2 + simRef.current.mouseY * 4;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', handlePointerDown);
      observer.disconnect();

      geometry.dispose();
      material.dispose();
      if (renderer) renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[360px] sm:h-[420px] md:h-[480px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#080808] shadow-2xl select-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block cursor-crosshair" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/40 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/70 via-transparent to-[#080808]/70 pointer-events-none" />

      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-mono text-white/90 shadow-md">
          <span className="w-2 h-2 rounded-full bg-[#fe1e34] animate-pulse" />
          <span className="tracking-wider uppercase text-[11px] font-semibold text-zinc-300">
            THREE.JS BARE-METAL SHADER FIELD
          </span>
          <span className="text-white/30 hidden sm:inline">|</span>
          <span className="text-emerald-400 font-medium hidden sm:inline">{fps} FPS</span>
        </div>

        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/10 p-1 rounded-full shadow-md text-xs font-mono">
          {(['iridescent', 'arterial', 'cyan', 'monochrome'] as CanvasThemeMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setActiveTheme(mode)}
              className={`px-2.5 py-1 rounded-full text-[11px] transition-all capitalize ${
                activeTheme === mode
                  ? 'bg-white text-black font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {mode === 'iridescent' ? 'Iridescent' : mode === 'arterial' ? 'Arterial' : mode === 'cyan' ? 'Teal' : 'Mono'}
            </button>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-xs font-mono text-zinc-500 pointer-events-none">
        <span className="hidden sm:inline">
          Hover pointer to induce hydrodynamic displacement • Click for ripple impulse
        </span>
        <span className="text-zinc-400 text-[11px] ml-auto">
          16,000 Vertex Vectors • Additive Blending
        </span>
      </div>
    </div>
  );
};

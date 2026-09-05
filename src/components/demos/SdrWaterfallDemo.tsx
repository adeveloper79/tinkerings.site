import React, { useState, useEffect, useRef } from 'react';
import { Radio, Play, Pause } from 'lucide-react';

export const SdrWaterfallDemo: React.FC = () => {
  const [isRunning, setIsRunning] = useState(true);
  const [decodedPackets, setDecodedPackets] = useState<Array<{
    time: string;
    id: string;
    temp: number;
    hum: number;
    rssi: number;
  }>>([
    { time: '14:22:01', id: '0x3F', temp: 21.4, hum: 48, rssi: -62 },
    { time: '14:22:59', id: '0x3F', temp: 21.3, hum: 48, rssi: -61 },
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    const height = (canvas.height = 140);

    let animationId: number;
    let step = 0;

    const drawWaterfall = () => {
      if (!isRunning) return;

      // Shift canvas up by 1 pixel
      const imgData = ctx.getImageData(0, 1, width, height - 1);
      ctx.putImageData(imgData, 0, 0);

      // Draw bottom row with noise floor and periodic 433.92MHz pulse
      const centerBin = Math.floor(width / 2);
      const isBurst = (step % 120) < 14;

      for (let x = 0; x < width; x++) {
        let intensity = Math.random() * 25; // ambient RF noise floor
        const distToCenter = Math.abs(x - centerBin);

        if (distToCenter < 12 && isBurst) {
          intensity += Math.max(0, 180 - distToCenter * 12 + Math.random() * 40);
        }

        if (intensity < 40) {
          ctx.fillStyle = `rgb(8, 9, ${Math.floor(intensity + 10)})`;
        } else if (intensity < 100) {
          ctx.fillStyle = `rgb(2, ${Math.floor(intensity * 1.5)}, 204)`;
        } else if (intensity < 180) {
          ctx.fillStyle = `rgb(${Math.floor(intensity)}, 242, 34)`; // Acid lime spectrum
        } else {
          ctx.fillStyle = `rgb(255, 255, 255)`;
        }

        ctx.fillRect(x, height - 1, 1, 1);
      }

      step++;

      // Occasionally add a decoded packet
      if (step % 240 === 0) {
        const last = decodedPackets[0] || { temp: 21.3, hum: 48 };
        const newTemp = Number((last.temp + (Math.random() - 0.5) * 0.2).toFixed(1));
        const newHum = Math.min(95, Math.max(20, Math.floor(last.hum + (Math.random() - 0.5) * 2)));
        setDecodedPackets((prev) => [
          {
            time: new Date().toLocaleTimeString(),
            id: '0x3F',
            temp: newTemp,
            hum: newHum,
            rssi: -60 - Math.floor(Math.random() * 6),
          },
          ...prev.slice(0, 4),
        ]);
      }

      animationId = requestAnimationFrame(drawWaterfall);
    };

    animationId = requestAnimationFrame(drawWaterfall);

    return () => cancelAnimationFrame(animationId);
  }, [isRunning, decodedPackets]);

  return (
    <div className="my-6 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4 shadow-md">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-cyan-600 dark:text-[var(--color-signal-teal)]" />
          <span className="font-mono text-xs text-[var(--text-primary)] font-medium tracking-tight">
            RF SPECTROGRAM · 433.920 MHz (BW: 250 kHz)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1 px-2 py-1 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] transition-colors shadow-xs"
          >
            {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-[var(--color-pulse-green)]" />}
            {isRunning ? 'Freeze' : 'Resume'}
          </button>
        </div>
      </div>

      <div className="relative rounded-[8px] overflow-hidden border border-[var(--border-subtle)] bg-[#08090a] shadow-inner">
        <canvas ref={canvasRef} className="w-full block h-[130px]" />
        <div className="absolute top-2 left-3 text-[10px] font-mono text-[#e4f222] bg-[#08090a]/80 px-1.5 py-0.5 rounded border border-white/10">
          CENTER: 433.92 MHz · FSK/OOK CARRIER
        </div>
      </div>

      {/* Demodulated Telemetry Packets */}
      <div className="mt-3">
        <div className="text-[11px] font-mono text-[var(--text-muted)] mb-1.5 flex items-center justify-between">
          <span>REAL-TIME PACKET BUFFER:</span>
          <span className="text-[var(--color-pulse-green)] font-semibold">CRC-16 CHECKSUM VALID</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
          {decodedPackets.slice(0, 2).map((pkt, i) => (
            <div key={i} className="p-2.5 rounded-[6px] bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex justify-between items-center shadow-xs">
              <div>
                <span className="text-[var(--text-faint)] text-[10px]">{pkt.time}</span>
                <div className="text-[var(--text-primary)] font-semibold">Sensor ID: {pkt.id}</div>
              </div>
              <div className="text-right">
                <span className="text-emerald-700 dark:text-[var(--color-acid-lime)] font-semibold">{pkt.temp}°C</span>
                <span className="text-[var(--text-muted)] ml-2">/ {pkt.hum}% RH</span>
                <div className="text-[10px] text-cyan-600 dark:text-[var(--color-signal-teal)] font-medium">{pkt.rssi} dBm</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

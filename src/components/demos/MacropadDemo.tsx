import React, { useState, useEffect } from 'react';
import { Volume2, Terminal, RotateCcw } from 'lucide-react';

interface KeyConfig {
  id: number;
  label: string;
  sub: string;
  command: string;
  keyTrigger: string;
}

const KEYS: KeyConfig[] = [
  { id: 1, label: 'GIT STASH', sub: 'git stash pop', command: 'git stash --include-untracked', keyTrigger: '1' },
  { id: 2, label: 'TEST ALL', sub: 'cargo test --all', command: 'cargo test --workspace -- --nocapture', keyTrigger: '2' },
  { id: 3, label: 'FORMAT', sub: 'rustfmt src/*', command: 'prettier --write . && cargo fmt', keyTrigger: '3' },
  { id: 4, label: 'MIC MUTE', sub: 'system mic toggle', command: 'pactl set-source-mute @DEFAULT_SOURCE@ toggle', keyTrigger: '4' },
];

export const MacropadDemo: React.FC = () => {
  const [activeKey, setActiveKey] = useState<number | null>(null);
  const [encoderValue, setEncoderValue] = useState(65);
  const [logMessages, setLogMessages] = useState<string[]>([
    '[INIT] RP2040 HID Controller mounted on /dev/ttyACM0',
    '[READY] Listening for matrix switch interrupts...'
  ]);

  // Gentle mechanical switch audio click via Web Audio API
  const playClickSound = (frequency = 320) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Audio context might be restricted before user gesture
    }
  };

  const handleKeyPress = (key: KeyConfig) => {
    setActiveKey(key.id);
    playClickSound(340 + key.id * 30);
    const timestamp = new Date().toLocaleTimeString();
    setLogMessages((prev) => [
      `[${timestamp}] GPIO_${key.id + 1} LOW -> Executing: ${key.command}`,
      ...prev.slice(0, 5),
    ]);
    setTimeout(() => setActiveKey(null), 180);
  };

  const rotateEncoder = (delta: number) => {
    setEncoderValue((v) => Math.min(100, Math.max(0, v + delta)));
    playClickSound(580);
    setLogMessages((prev) => [
      `[ENC] Rotary Quadrature Pulse: Level ${Math.min(100, Math.max(0, encoderValue + delta))}%`,
      ...prev.slice(0, 5),
    ]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = KEYS.find((k) => k.keyTrigger === e.key);
      if (target && !['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) {
        handleKeyPress(target);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [encoderValue]);

  return (
    <div className="my-6 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 shadow-md">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-pulse-green)] dark:bg-[var(--color-acid-lime)] animate-pulse"></span>
          <span className="font-mono text-xs text-[var(--text-primary)] font-medium tracking-tight">INTERACTIVE FIRMWARE SIMULATOR</span>
          <span className="text-[11px] font-mono text-[var(--text-muted)] px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
            Press keys [1, 2, 3, 4] or click
          </span>
        </div>
        <button
          onClick={() => setLogMessages(['[RESET] Controller cleared'])}
          className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
          title="Clear log"
        >
          <RotateCcw className="w-3 h-3" /> Clear
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-5 items-center">
        {/* Physical Deck Representation */}
        <div className="md:col-span-6 bg-[var(--bg-canvas)] p-5 rounded-[12px] border border-[var(--border-subtle)] relative shadow-xs">
          <div className="flex justify-between items-center mb-4 text-[11px] font-mono text-[var(--text-faint)]">
            <span>RP2040-PICO-4K</span>
            <span className="text-[var(--color-pulse-green)] dark:text-[var(--color-acid-lime)] font-semibold">USB 2.0 FULL SPEED</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {KEYS.map((k) => {
              const isPressed = activeKey === k.id;
              return (
                <button
                  key={k.id}
                  onClick={() => handleKeyPress(k)}
                  className={`relative flex flex-col items-start p-3.5 rounded-[8px] border transition-all text-left group select-none shadow-xs ${
                    isPressed
                      ? 'bg-[var(--text-primary)] border-[var(--text-primary)] text-[var(--bg-canvas)] translate-y-0.5'
                      : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-elevated)]'
                  }`}
                >
                  <div className="flex w-full items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isPressed ? 'bg-[var(--bg-canvas)] text-[var(--text-primary)] font-bold' : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'
                    }`}>
                      K{k.id} [{k.keyTrigger}]
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                  </div>
                  <span className="font-semibold text-xs tracking-tight">{k.label}</span>
                  <span className={`text-[10px] font-mono truncate max-w-full ${
                    isPressed ? 'opacity-80' : 'text-[var(--text-muted)]'
                  }`}>
                    {k.sub}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Rotary Knob */}
          <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[var(--text-muted)]" />
              <span className="text-xs font-mono text-[var(--text-muted)]">EC11 Dial:</span>
              <span className="text-xs font-mono text-[var(--text-primary)] font-medium">{encoderValue}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => rotateEncoder(-5)}
                className="w-7 h-7 rounded-[6px] bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--border-hover)] flex items-center justify-center font-mono text-xs shadow-xs"
              >
                -
              </button>
              <button
                onClick={() => rotateEncoder(5)}
                className="w-7 h-7 rounded-[6px] bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--border-hover)] flex items-center justify-center font-mono text-xs shadow-xs"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Live Terminal Log Output */}
        <div className="md:col-span-6 bg-[#090b0e] text-[#e2e8f0] rounded-[12px] border border-[var(--border-subtle)] p-4 font-mono text-xs h-[230px] flex flex-col justify-between overflow-hidden shadow-inner">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 text-[11px] text-gray-400">
            <span className="flex items-center gap-1.5 text-gray-300">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" /> /dev/ttyACM0 (115200 8N1)
            </span>
            <span className="text-emerald-400">ONLINE</span>
          </div>
          <div className="flex-1 py-2 overflow-y-auto space-y-1.5">
            {logMessages.map((msg, i) => (
              <div key={i} className="leading-relaxed break-all text-gray-300">
                {msg.includes('Executing') ? (
                  <span className="text-emerald-400 font-semibold">{msg}</span>
                ) : msg.includes('ENC') ? (
                  <span className="text-cyan-300">{msg}</span>
                ) : (
                  <span className="text-gray-400">{msg}</span>
                )}
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-white/10 text-[10px] text-gray-400 flex items-center justify-between">
            <span>Latency: &lt; 1.2ms (USB Polling: 1000Hz)</span>
            <span className="text-emerald-400">READY</span>
          </div>
        </div>
      </div>
    </div>
  );
};

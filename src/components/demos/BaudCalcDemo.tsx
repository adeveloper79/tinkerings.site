import React, { useState } from 'react';
import { Cpu, Calculator, Activity } from 'lucide-react';

export const BaudCalcDemo: React.FC = () => {
  const [baudRate, setBaudRate] = useState<number>(3000000);
  const [packetBytes, setPacketBytes] = useState<number>(32);
  const [dataBits] = useState<number>(8);
  const [stopBits] = useState<number>(1);
  const [hasParity] = useState<boolean>(false);

  // Framing bits per byte: 1 start bit + dataBits + (1 parity if enabled) + stopBits
  const bitsPerByte = 1 + dataBits + (hasParity ? 1 : 0) + stopBits;
  const rawBytesPerSecond = baudRate / bitsPerByte;
  const packetsPerSecond = Math.floor(rawBytesPerSecond / packetBytes);
  const payloadThroughputKb = ((packetsPerSecond * packetBytes) / 1024).toFixed(1);
  const recommendedBufferSize = Math.max(16384, Math.pow(2, Math.ceil(Math.log2(rawBytesPerSecond * 0.05))));

  return (
    <div className="my-6 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 shadow-md">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-emerald-700 dark:text-[var(--color-acid-lime)]" />
          <span className="font-mono text-xs text-[var(--text-primary)] font-medium tracking-tight">
            UART TELEMETRY THROUGHPUT CALCULATOR
          </span>
          <span className="text-[11px] font-mono text-[var(--text-muted)] bg-[var(--bg-elevated)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
            Buffer Optimization
          </span>
        </div>
        <span className="text-xs font-mono text-[var(--color-pulse-green)] font-medium">8N1 FRAMING</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-[var(--text-muted)]">Baud Rate:</span>
              <span className="text-[var(--text-primary)] font-medium">{baudRate.toLocaleString()} bps</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[115200, 921600, 2000000, 3000000].map((b) => (
                <button
                  key={b}
                  onClick={() => setBaudRate(b)}
                  className={`py-1.5 px-2 rounded-[6px] text-xs font-mono border transition-all ${
                    baudRate === b
                      ? 'bg-[var(--text-primary)] text-[var(--bg-canvas)] font-semibold border-[var(--text-primary)] shadow-xs'
                      : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:border-[var(--border-hover)]'
                  }`}
                >
                  {(b / 1000000) >= 1 ? `${b / 1000000}M` : `${b / 1000}k`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-[var(--text-muted)]">Average Message Size:</span>
              <span className="text-[var(--text-primary)] font-medium">{packetBytes} Bytes / packet</span>
            </div>
            <input
              type="range"
              min="8"
              max="128"
              step="4"
              value={packetBytes}
              onChange={(e) => setPacketBytes(Number(e.target.value))}
              className="w-full accent-emerald-600 dark:accent-[var(--color-acid-lime)] h-1.5 bg-[var(--bg-elevated)] rounded-lg cursor-pointer"
            />
          </div>

          <div className="p-3 rounded-[8px] bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-xs font-mono space-y-1 text-[var(--text-muted)] shadow-xs">
            <div className="text-[11px] text-[var(--text-faint)] font-medium">UART Overdrive Metrics:</div>
            <div className="flex justify-between">
              <span>Bits per Byte overhead:</span>
              <span className="text-[var(--text-secondary)] font-medium">{bitsPerByte} bits (10x ratio)</span>
            </div>
            <div className="flex justify-between">
              <span>Gross Symbol Clock:</span>
              <span className="text-[var(--text-secondary)] font-medium">{(baudRate / 1000000).toFixed(2)} MHz</span>
            </div>
          </div>
        </div>

        {/* Calculated Results */}
        <div className="bg-[var(--bg-canvas)] rounded-[8px] border border-[var(--border-subtle)] p-4 font-mono text-xs flex flex-col justify-between shadow-xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <span className="text-[var(--text-muted)] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-600 dark:text-[var(--color-signal-teal)]" /> Max Ingestion Rate:
              </span>
              <span className="text-emerald-600 dark:text-[var(--color-acid-lime)] font-semibold text-sm">
                {packetsPerSecond.toLocaleString()} msgs/sec
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <span className="text-[var(--text-muted)]">Effective Throughput:</span>
              <span className="text-[var(--text-primary)] font-medium">{payloadThroughputKb} KB/s</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <span className="text-[var(--text-muted)]">Ring Buffer Size:</span>
              <span className="text-cyan-600 dark:text-[var(--color-signal-teal)] font-medium">{recommendedBufferSize / 1024} KB (Power of 2)</span>
            </div>
          </div>

          <div className="mt-4 p-2.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)] shadow-xs">
            <div className="text-[10px] text-[var(--text-muted)] mb-1 font-semibold flex items-center gap-1">
              <Cpu className="w-3 h-3 text-emerald-700 dark:text-[var(--color-acid-lime)]" /> Recommended Rust Buffer Config:
            </div>
            <code className="text-emerald-600 dark:text-[var(--color-acid-lime)] font-semibold">
              let mut reader = BufReader::with_capacity({recommendedBufferSize}, port);
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

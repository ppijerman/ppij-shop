'use client';

import { useRef, useState } from 'react';

// ── Layout helpers ──────────────────────────────────────────────────────────

export function TweakSection({ label }: { label: string }) {
  return <div className="twk-sect">{label}</div>;
}

function TweakRow({ label, value, children, inline = false }: { label: string; value?: string | number; children: React.ReactNode; inline?: boolean }) {
  return (
    <div className={inline ? 'twk-row twk-row-h' : 'twk-row'}>
      <div className="twk-lbl">
        <span>{label}</span>
        {value != null && <span className="twk-val">{value}</span>}
      </div>
      {children}
    </div>
  );
}

// ── Controls ────────────────────────────────────────────────────────────────

export function TweakSlider({ label, value, min = 0, max = 100, step = 1, unit = '', onChange }: { label: string; value: number; min?: number; max?: number; step?: number; unit?: string; onChange: (v: number) => void }) {
  return (
    <TweakRow label={label} value={`${value}${unit}`}>
      <input type="range" className="twk-slider" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} />
    </TweakRow>
  );
}

export function TweakToggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="twk-row twk-row-h">
      <div className="twk-lbl"><span>{label}</span></div>
      <button type="button" className="twk-toggle" data-on={value ? '1' : '0'} role="switch" aria-checked={!!value} onClick={() => onChange(!value)}><i /></button>
    </div>
  );
}

function isLight(hex: string): boolean {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, c => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}

function CheckIcon({ light }: { light: boolean }) {
  return (
    <svg viewBox="0 0 14 14" aria-hidden="true" style={{ position: 'absolute', top: 6, left: 6, width: 13, height: 13, filter: 'drop-shadow(0 1px 1px rgba(0,0,0,.3))' }}>
      <path d="M3 7.2 5.8 10 11 4.2" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" stroke={light ? 'rgba(0,0,0,.78)' : '#fff'} />
    </svg>
  );
}

export function TweakColor({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  if (!options?.length) {
    return (
      <div className="twk-row twk-row-h">
        <div className="twk-lbl"><span>{label}</span></div>
        <input type="color" className="twk-swatch" value={value} onChange={e => onChange(e.target.value)} />
      </div>
    );
  }
  const cur = String(JSON.stringify(value)).toLowerCase();
  return (
    <TweakRow label={label}>
      <div className="twk-chips" role="radiogroup">
        {options.map((o, i) => {
          const on = String(JSON.stringify(o)).toLowerCase() === cur;
          return (
            <button key={i} type="button" className="twk-chip" role="radio" aria-checked={on} data-on={on ? '1' : '0'} style={{ background: o, position: 'relative' }} onClick={() => onChange(o)}>
              {on && <CheckIcon light={isLight(o)} />}
            </button>
          );
        })}
      </div>
    </TweakRow>
  );
}

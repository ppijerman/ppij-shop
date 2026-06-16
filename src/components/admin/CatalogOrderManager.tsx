'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

type Item = { id: string; name: string; is_active: boolean; primary_image?: string; bundle_image_url?: string };

function SortableList({
  items,
  onSave,
}: {
  items: Item[];
  onSave: (ids: string[], onSuccess: () => void) => void;
}) {
  const [list, setList] = useState(items);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const dragIndex = useRef<number | null>(null);

  const handleDragEnter = (index: number) => {
    const from = dragIndex.current;
    if (from === null || from === index) return;
    dragIndex.current = index;
    setList(prev => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDirty(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24 }}>
        {list.map((item, index) => {
          const imgUrl = item.primary_image || item.bundle_image_url;
          return (
            <div
              key={item.id}
              draggable
              onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; dragIndex.current = index; }}
              onDragEnter={() => handleDragEnter(index)}
              onDragOver={e => e.preventDefault()}
              onDragEnd={() => { dragIndex.current = null; }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '10px 14px',
                border: '1px solid var(--line)',
                borderRadius: 8,
                background: item.is_active ? 'var(--cream)' : 'var(--cream-2)',
                cursor: 'grab',
                userSelect: 'none',
                opacity: item.is_active ? 1 : 0.5,
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--muted)', width: 20, flexShrink: 0 }}>☰</span>
              {imgUrl ? (
                <img src={imgUrl} alt="" draggable={false} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, flexShrink: 0, pointerEvents: 'none' }} />
              ) : (
                <div style={{ width: 40, height: 40, background: 'var(--line)', borderRadius: 4, flexShrink: 0 }} />
              )}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, flex: 1, letterSpacing: '0.05em' }}>{item.name}</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.15em',
                padding: '3px 8px', borderRadius: 999,
                background: item.is_active ? 'var(--black)' : 'var(--line)',
                color: item.is_active ? 'var(--cream)' : 'var(--muted)',
              }}>
                {item.is_active ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
          );
        })}
      </div>

      <button
        disabled={!dirty || saving}
        onClick={() => {
          setSaving(true);
          onSave(list.map(i => i.id), () => {
            setDirty(false);
            setSaving(false);
          });
        }}
        style={{
          padding: '12px 28px',
          background: dirty && !saving ? 'var(--black)' : 'var(--line)',
          color: dirty && !saving ? 'var(--cream)' : 'var(--muted)',
          border: 'none',
          borderRadius: 999,
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.1em',
          cursor: dirty && !saving ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s',
        }}
      >
        {saving ? 'SAVING…' : 'SAVE ORDER'}
      </button>
    </div>
  );
}

export default function CatalogOrderManager({ products, bundles }: { products: any[]; bundles: any[] }) {
  const [tab, setTab] = useState<'products' | 'bundles'>('products');
  const [toast, setToast] = useState('');
  const router = useRouter();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSave = async (endpoint: string, ids: string[], onSuccess: () => void) => {
    try {
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: ids }),
      });
      if (!res.ok) throw new Error('Failed to save');
      showToast('Order saved');
      onSuccess();
      router.refresh();
    } catch {
      showToast('Failed to save order');
    }
  };

  const tabStyle = (active: boolean) => ({
    padding: '10px 20px',
    border: '1px solid var(--line)',
    borderRadius: 999,
    fontFamily: 'var(--font-mono)' as const,
    fontSize: 11,
    fontWeight: active ? 700 : 500,
    letterSpacing: '0.1em',
    background: active ? 'var(--black)' : 'transparent',
    color: active ? 'var(--cream)' : 'var(--muted)',
    cursor: 'pointer' as const,
  });

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        <button style={tabStyle(tab === 'products')} onClick={() => setTab('products')}>PRODUCTS</button>
        <button style={tabStyle(tab === 'bundles')} onClick={() => setTab('bundles')}>BUNDLES</button>
      </div>

      {tab === 'products' ? (
        <SortableList
          key="products"
          items={products.map(p => ({ id: p.id, name: p.name, is_active: p.is_active, primary_image: p.primary_image }))}
          onSave={(ids, onSuccess) => handleSave('/api/products/reorder', ids, onSuccess)}
        />
      ) : (
        <SortableList
          key="bundles"
          items={bundles.map(b => ({ id: b.id, name: b.name, is_active: b.is_active, bundle_image_url: b.bundle_image_url }))}
          onSave={(ids, onSuccess) => handleSave('/api/bundles/reorder', ids, onSuccess)}
        />
      )}

      {toast && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--black)', color: 'var(--cream)',
          fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em',
          padding: '12px 24px', borderRadius: 999, zIndex: 9999,
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}

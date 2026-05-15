'use client';

import { useState } from 'react';
import { Product, ProductCategory, Color } from '@/types';

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: any) => void;
}

export default function ProductForm({ initialData, onSubmit }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    subtitle: initialData?.subtitle || '',
    category: initialData?.category || 'T-SHIRT',
    price: initialData?.price || 0,
    originalPrice: initialData?.originalPrice || null,
    tag: initialData?.tag || '',
    desc: initialData?.desc || '',
  });

  const [sizes, setSizes] = useState<string[]>(initialData?.sizes || []);
  const [colors, setColors] = useState<Color[]>(initialData?.colors || []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div style={{ background: 'white', padding: 32, borderRadius: 12, border: '1px solid var(--line)', maxWidth: 800 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div style={fieldGroup}>
          <label style={labelStyle}>Product Name</label>
          <input name="name" value={formData.name} onChange={handleChange} style={inputStyle} placeholder="e.g. Fang & Horn" />
        </div>
        <div style={fieldGroup}>
          <label style={labelStyle}>Subtitle</label>
          <input name="subtitle" value={formData.subtitle} onChange={handleChange} style={inputStyle} placeholder="e.g. OVERSIZED TEE — WHITE" />
        </div>
        <div style={fieldGroup}>
          <label style={labelStyle}>Category</label>
          <select name="category" value={formData.category} onChange={handleChange} style={inputStyle}>
            <option value="T-SHIRT">T-SHIRT</option>
            <option value="TOTE BAG">TOTE BAG</option>
          </select>
        </div>
        <div style={fieldGroup}>
          <label style={labelStyle}>Tag</label>
          <input name="tag" value={formData.tag} onChange={handleChange} style={inputStyle} placeholder="e.g. NEW, BESTSELLER" />
        </div>
        <div style={fieldGroup}>
          <label style={labelStyle}>Price (€)</label>
          <input name="price" type="number" value={formData.price} onChange={handleChange} style={inputStyle} />
        </div>
        <div style={fieldGroup}>
          <label style={labelStyle}>Original Price (€)</label>
          <input name="originalPrice" type="number" value={formData.originalPrice || ''} onChange={handleChange} style={inputStyle} placeholder="Leave empty if no discount" />
        </div>
      </div>

      <div style={{ ...fieldGroup, marginBottom: 24 }}>
        <label style={labelStyle}>Description</label>
        <textarea name="desc" value={formData.desc} onChange={handleChange} style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} />
      </div>

      <div style={{ marginBottom: 32 }}>
        <label style={labelStyle}>Sizes & Stock</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {['S', 'M', 'L', 'XL', 'XXL', 'ONE SIZE'].map(s => (
            <button 
              key={s}
              onClick={() => {
                if (sizes.includes(s)) setSizes(sizes.filter(x => x !== s));
                else setSizes([...sizes, s]);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: 4,
                border: '1px solid var(--line)',
                background: sizes.includes(s) ? 'var(--black)' : 'white',
                color: sizes.includes(s) ? 'white' : 'var(--black)',
                cursor: 'pointer',
                fontSize: 12,
                fontFamily: 'var(--font-mono)'
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <label style={labelStyle}>Colors</label>
        <div style={{ display: 'flex', gap: 12, flexDirection: 'column', marginTop: 8 }}>
          {colors.map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <input 
                value={c.name} 
                onChange={(e) => {
                  const newColors = [...colors];
                  newColors[i].name = e.target.value;
                  setColors(newColors);
                }}
                style={{ ...inputStyle, flex: 1 }}
                placeholder="Color Name (e.g. White)"
              />
              <input 
                type="color"
                value={c.hex} 
                onChange={(e) => {
                  const newColors = [...colors];
                  newColors[i].hex = e.target.value;
                  setColors(newColors);
                }}
                style={{ width: 44, height: 44, padding: 0, border: 'none', cursor: 'pointer' }}
              />
              <button 
                onClick={() => setColors(colors.filter((_, idx) => idx !== i))}
                style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', fontSize: 20 }}
              >
                ×
              </button>
            </div>
          ))}
          <button 
            onClick={() => setColors([...colors, { name: '', hex: '#000000' }])}
            style={{ 
              alignSelf: 'flex-start',
              padding: '8px 16px', 
              background: 'white', 
              border: '1px dashed var(--line)', 
              borderRadius: 4, 
              fontSize: 12, 
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)'
            }}
          >
            + ADD COLOR
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 40 }}>
        <label style={labelStyle}>Images</label>
        <div style={{ 
          marginTop: 8, 
          border: '2px dashed var(--line)', 
          padding: 40, 
          textAlign: 'center', 
          borderRadius: 8,
          color: 'var(--muted)',
          fontSize: 13
        }}>
          Click or drag images to upload
        </div>
      </div>

      <button 
        onClick={() => onSubmit({ ...formData, sizes, colors })}
        style={{
          width: '100%',
          padding: '16px',
          background: 'var(--black)',
          color: 'var(--cream)',
          border: 'none',
          borderRadius: 8,
          fontFamily: 'var(--font-mono)',
          fontSize: 14,
          fontWeight: 700,
          cursor: 'pointer',
          letterSpacing: '0.1em'
        }}
      >
        {initialData ? 'SAVE CHANGES' : 'CREATE PRODUCT'}
      </button>
    </div>
  );
}

const fieldGroup: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  textTransform: 'uppercase',
  color: 'var(--muted)',
  letterSpacing: '0.05em'
};

const inputStyle: React.CSSProperties = {
  padding: '12px',
  borderRadius: 6,
  border: '1px solid var(--line)',
  fontSize: 14,
  fontFamily: 'inherit'
};

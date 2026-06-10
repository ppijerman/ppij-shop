'use client';

import { FitConfig, FitType } from '@/types';
import { useState } from 'react';

interface ProductFormProps {
  initialData?: any;
  action: (formData: FormData) => Promise<void>;
}

const getFieldStyle = (isChanged: boolean) => ({
  ...inputStyle,
  borderColor: isChanged ? 'var(--accent)' : 'var(--line)',
  backgroundColor: isChanged ? '#fff7ed' : 'white',
});

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'ONE SIZE'];

export default function ProductForm({ initialData, action }: ProductFormProps) {
  const variants = initialData?.variants || [];
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    subtitle: initialData?.subtitle || '',
    category: initialData?.category || 'TSHIRT',
    tag: initialData?.tag || '',
    skuPrefix: initialData?.sku_prefix || '',
    weight: initialData?.weight_g || 0,
    desc: initialData?.desc || ''
  });
  
  const [colors, setColors] = useState<{name: string, hex: string}[]>(
    Array.from(new Set(variants.map((v: any) => JSON.stringify({ name: v.color_name, hex: v.color_hex }))))
      .map(s => JSON.parse(s as string))
  );

  const [fits, setFits] = useState<Record<FitType, FitConfig>>(() => {
    const initialFits: Record<FitType, FitConfig> = {
      REGULAR: { enabled: true, price: 0, originalPrice: null, sizes: [], stock: {} },
      OVERSIZED: { enabled: false, price: 0, originalPrice: null, sizes: [], stock: {} }
    };

    if (variants.length > 0) {
      variants.forEach((v: any) => {
        const type = (v.fit_type || 'REGULAR') as FitType;
        initialFits[type].enabled = true;
        initialFits[type].price = v.price;
        initialFits[type].originalPrice = v.original_price;
        if (!initialFits[type].sizes.includes(v.size.trim())) {
          initialFits[type].sizes.push(v.size.trim());
        }
        initialFits[type].stock[v.color_name] = initialFits[type].stock[v.color_name] || {};
        initialFits[type].stock[v.color_name][v.size.trim()] = v.stock;
      });
    }
    return initialFits;
  })

  const [images, setImages] = useState<{ url: string; is_primary: boolean; }[]>(initialData?.images || []);
  const [fileInputKey, setFileInputKey] = useState(0);

  const handleUpdateFit = (type: FitType, updates: Partial<FitConfig>) => {
    setFits(prev => ({
      ...prev,
      [type]: { ...prev[type], ...updates}
    }));
  };

  const handleStockChange = (type: FitType, colorName: string, size: string, value: number) => {
    setFits(prev => ({
      ...prev,
      [type]: {
        ...(prev[type]),
        stock: {
          ...prev[type].stock,
          [colorName]: {
            ...(prev[type].stock[colorName] || {}),
            [size]: value
          }
        }
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set('images', JSON.stringify(images));
    formData.set('colors', JSON.stringify(colors));
    formData.set('fits', JSON.stringify(fits));
    action(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: 'white', padding: 32, borderRadius: 12, border: '1px solid var(--line)', maxWidth: 800 }}>
      {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div style={fieldGroup}>
          <label style={labelStyle}>Product Name</label>
          <input 
            name="name" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})}
            style={getFieldStyle(formData.name !== (initialData?.name || ''))} 
            placeholder="e.g. Fang & Horn" 
          />
        </div>
        <div style={fieldGroup}>
          <label style={labelStyle}>Subtitle</label>
          <input 
            name="subtitle" 
            value={formData.subtitle} 
            onChange={e => setFormData({...formData, subtitle: e.target.value})}
            style={getFieldStyle(formData.subtitle !== (initialData?.subtitle || ''))}
            placeholder="e.g. OVERSIZED TEE — WHITE" 
          />
        </div>
        <div style={fieldGroup}>
          <label style={labelStyle}>Category</label>
          <select 
            name="category" 
            value={formData.category} 
            onChange={e => {
              const newCategory = e.target.value;
              setFormData({...formData, category: newCategory});
              if (newCategory === 'TOTEBAG') {
                setFits(prev => ({
                  ...prev,
                  REGULAR: { ...prev.REGULAR, enabled: true, sizes: ['ONE SIZE'] },
                  OVERSIZED: { ...prev.OVERSIZED, enabled: false }
                }));
              }
            }}
            style={{...getFieldStyle(formData.category !== (initialData?.category || 'TSHIRT')), height: '48px'}}
          >
            <option value="TSHIRT">TSHIRT</option>
            <option value="TOTEBAG">TOTE BAG</option>
          </select>
        </div>
        <div style={fieldGroup}>
          <label style={labelStyle}>Tag</label>
          <input 
            name="tag" 
            value={formData.tag} 
            onChange={e => setFormData({...formData, tag: e.target.value})}
            style={getFieldStyle(formData.tag !== (initialData?.tag || ''))}
            placeholder="e.g. NEW, BESTSELLER" 
          />
        </div>
        <div style={fieldGroup}>
          <label style={labelStyle}>SKU Prefix</label>
          <input 
            name="skuPrefix" 
            value={formData.skuPrefix} 
            onChange={e => setFormData({...formData, skuPrefix: e.target.value})}
            style={getFieldStyle(formData.skuPrefix !== (initialData?.sku_prefix || ''))}
            placeholder="e.g. FH-TEE" 
          />
        </div>
        <div style={fieldGroup}>
          <label style={labelStyle}>Weight (kg)</label>
          <input 
            name="weight" 
            type="number" 
            step="0.01" 
            value={formData.weight} 
            onChange={e => setFormData({...formData, weight: parseFloat(e.target.value) || 0})}
            style={getFieldStyle(formData.weight !== (initialData?.weight_g || 0))}
            placeholder="e.g. 0.25" 
          />
        </div>
      </div>

      <div style={{ ...fieldGroup, marginBottom: 24 }}>
        <label style={labelStyle}>Description</label>
        <textarea 
          name="desc" 
          value={formData.desc} 
          onChange={e => setFormData({...formData, desc: e.target.value})}
          style={{ ...getFieldStyle(formData.desc !== (initialData?.desc || '')), minHeight: 100, resize: 'vertical' }} 
        />
      </div>

      {formData.category !== 'TOTEBAG' && (
        <div  style={{ marginBottom: 32 }}>
          <label style={labelStyle}>Enabled Fits</label>
          <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
            {(['REGULAR', 'OVERSIZED'] as FitType[]).map(f => (
              <label key={f} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 10, 
                cursor: 'pointer',
                padding: '10px 16px',
                border: '1px solid var(--line)',
                borderRadius: 8,
                background: fits[f].enabled ? 'rgba(0,0,0,0.03)' : 'transparent',
                transition: 'all 0.2s ease',
                borderColor: fits[f].enabled ? 'var(--black)' : 'var(--line)'
              }}>
                <input 
                  type="checkbox"
                  checked={fits[f].enabled}
                  onChange={e => handleUpdateFit(f, { enabled: e.target.checked })}
                  style={{ 
                    width: 18, 
                    height: 18, 
                    cursor: 'pointer',
                    accentColor: 'var(--black)'
                  }}
                />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: fits[f].enabled ? 600 : 400 }}>{f}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 32 }}>
        <label style={labelStyle}>Global Colors</label>
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
                placeholder='Color Name (e.g White)'
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
              <button type='button' 
                onClick={() => setColors(colors.filter((_, idx) => idx !== i))} 
                style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', fontSize: 20 }}>
                ×
              </button>
            </div>
          ))}
          <button type='button' 
            onClick={() => setColors([...colors, { name: '', hex: '#000000' }])} 
            style={{ alignSelf: 'flex-start', padding: '8px 16px', background: 'white', border: '1px dashed var(--line)', borderRadius: 4, fontSize: 12, cursor: 'pointer', fontFamily:'var(--font-mono)' }}
          >
            + ADD COLOR
          </button>
        </div>
      </div>

      {(['REGULAR', 'OVERSIZED'] as FitType[]).map(f => fits[f].enabled && (
        <div key={f} style={{ marginBottom: 40, padding: 24, border: '1px solid var(--line)', borderRadius: 12, background: '#fafafa' }}>
          <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, marginBottom: 20, color: 'var(--accent-deep)' }}>{f} FIT CONFIGURATION</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            <div style={fieldGroup}>
              <label style={labelStyle}>{f} Price (€)</label>
              <input type="number" value={fits[f].price} 
                onChange={e => handleUpdateFit(f, { price: parseFloat(e.target.value) || 0 })} 
                style={inputStyle}/>
            </div>
            <div style={fieldGroup}>
              <label style={labelStyle}>{f} Original Price (€)</label>
              <input type="number" value={fits[f].originalPrice || ''} 
                onChange={e => handleUpdateFit(f, { originalPrice: parseFloat(e.target.value) || null })} 
                style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>{f} Sizes</label>
            {formData.category === 'TOTEBAG' ? (
              <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--black)', fontWeight: 600 }}>
                ONE SIZE (Standard for Tote Bags)
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {DEFAULT_SIZES.map(s => (
                  <button
                    type="button" key={s}
                    onClick={() => {
                      const newSizes = fits[f].sizes.includes(s) ? fits[f].sizes.filter(x => x !== s) : [...fits[f].sizes, s];
                      handleUpdateFit(f, { sizes: newSizes });
                    }}
                    style={{
                      padding: '8px 16px', borderRadius: 4, border: '1px solid var(--line)', fontSize: 12, fontFamily: 'var(--font-mono)', cursor: 'pointer',
                      background: fits[f].sizes.includes(s) ? 'var(--black)' : 'white',
                      color: fits[f].sizes.includes(s) ? 'white' : 'var(--black)'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {fits[f].sizes.length > 0 && colors.length > 0 && (
            <div style={{ marginTop: 12, border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden', background: 'white' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ background: '#f9f9f9', borderBottom: '1px solid var(--line)' }}>
                    <th style={{ padding: 10, textAlign: 'left', fontFamily: 'var(--font-mono)' }}>Color / Size</th>
                    {fits[f].sizes.map(s => <th key={s} style={{ padding: 10, textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{s}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {colors.map(c => (
                    <tr key={c.name} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: 10, fontWeight: 600 }}>{c.name}</td>
                      {fits[f].sizes.map(s => (
                        <td key={s} style={{ padding: 6 }}>
                          <input 
                            type="number" value={fits[f].stock[c.name]?.[s] ?? 0}
                            onChange={(e) => handleStockChange(f, c.name, s, parseInt(e.target.value) || 0)}
                            style={{ width: '100%', padding: '6px', textAlign: 'center', border: '1px solid var(--line)', borderRadius: 4, fontFamily: 'var(--font-mono)' }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}

      <div style={{ marginBottom: 40 }}>
        <label style={labelStyle}>Images</label>
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          onChange={async (e) => {
            if (!e.target.files || e.target.files.length === 0) return;
            const newImages: { url: string; is_primary: boolean; }[] = [...images];
            for (const file of Array.from(e.target.files)) {
              const url = URL.createObjectURL(file);
              newImages.push({ url, is_primary: newImages.length === 0 });
            }
            setImages(newImages);
            setFileInputKey(prevKey => prevKey + 1);
          }}
          style={{ marginBottom: 20, display: 'block' }}
          key={fileInputKey}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 16 }}>
          {images.map((image, index) => (
            <div 
              key={image.url} 
              style={{
                border: `2px solid ${image.is_primary ? 'var(--black)' : 'var(--line)'}`, 
                borderRadius: 8, 
                overflow: 'hidden', 
                position: 'relative',
                padding: 8
              }}
            >
              <img src={image.url} alt="Product preview" style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 4 }} />
              {image.is_primary && (
                <span 
                  style={{
                    position: 'absolute', 
                    top: 4, 
                    right: 4, 
                    background: 'var(--black)', 
                    color: 'white', 
                    padding: '2px 6px', 
                    borderRadius: 4, 
                    fontSize: 10
                  }}
                >
                  PRIMARY
                </span>
              )}
              <button 
                type="button" 
                onClick={() => {
                  setImages(images.map((img, i) => ({
                    ...img,
                    is_primary: i === index
                  })));
                }}
                style={{
                  marginTop: 8, 
                  width: '100%', 
                  padding: '6px', 
                  background: image.is_primary ? 'var(--accent)' : 'var(--cream)', 
                  color: image.is_primary ? 'white' : 'var(--black)', 
                  border: 'none', 
                  borderRadius: 4, 
                  cursor: 'pointer',
                  fontSize: 11
                }}
              >
                Set as Primary
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setImages(images.filter((_, i) => i !== index));
                  setFileInputKey(prevKey => prevKey + 1);
                }}
                style={{
                  marginTop: 4, 
                  width: '100%', 
                  padding: '6px', 
                  background: '#f44336', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: 4, 
                  cursor: 'pointer',
                  fontSize: 11
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      <button 
        type="submit"
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
    </form>
  );
}

const fieldGroup: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 8 };
const labelStyle: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.05em' };
const inputStyle: React.CSSProperties = { padding: '12px', borderRadius: 6, border: '1px solid var(--line)', fontSize: 14, fontFamily: 'inherit' };

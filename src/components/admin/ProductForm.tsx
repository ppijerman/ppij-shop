'use client';

import { FitConfig, FitType } from '@/types';
import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { getCroppedFile } from '@/lib/image-utils';

interface ProductFormProps {
  initialData?: any;
  action: (formData: FormData) => Promise<void>;
}

const getFieldStyle = (isChanged: boolean, isEmpty = false) => ({
  ...inputStyle,
  borderColor: isEmpty ? '#ef4444' : isChanged ? 'var(--accent)' : 'var(--line)',
  backgroundColor: isEmpty ? '#fef2f2' : isChanged ? '#fff7ed' : 'white',
});

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export default function ProductForm({ initialData, action }: ProductFormProps) {
  const variants = initialData?.variants || [];
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    subtitle: initialData?.subtitle || '',
    category: initialData?.category || 'TSHIRT',
    tag: initialData?.tag || '',
    skuPrefix: initialData?.sku_prefix || '',
    weight: initialData?.weight_g ?? '',
    desc: initialData?.desc || ''
  });
  
  const [colors, setColors] = useState<{name: string, hex: string}[]>(
    Array.from(new Set(variants.map((v: any) => JSON.stringify({ name: v.color_name, hex: v.color_hex }))))
      .map(s => JSON.parse(s as string))
  );

  const [fits, setFits] = useState<Record<FitType, FitConfig>>(() => {
    const initialFits: Record<FitType, FitConfig> = {
      REGULAR: { enabled: variants.length === 0, price: 0, originalPrice: null, sizes: [], stock: {} },
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

  type ImageEntry =
    | { kind: 'existing'; id: string; url: string; is_primary: boolean }
    | { kind: 'new'; file: File; previewUrl: string; is_primary: boolean }

  const [images, setImages] = useState<ImageEntry[]>(() => {
    if (!initialData?.images?.length) return [];
    return (initialData.images as { id: string; url: string; is_primary: boolean }[]).map(img => ({
      kind: 'existing' as const,
      id: img.id,
      url: img.url,
      is_primary: img.is_primary,
    }));
  });
  const [fileInputKey, setFileInputKey] = useState(0);
  const [attempted, setAttempted] = useState(false);

  const [cropQueue, setCropQueue] = useState<{ src: string; name: string }[]>([]);
  const [cropQueueTotal, setCropQueueTotal] = useState(0);
  const [cropState, setCropState] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleCropConfirm = async () => {
    if (!croppedAreaPixels || cropQueue.length === 0) return;
    const current = cropQueue[0];
    let file: File;
    try {
      file = await getCroppedFile(current.src, croppedAreaPixels, current.name);
    } catch {
      alert('Failed to process image. Please try again.');
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setImages(prev => {
      const isPrimary = prev.length === 0;
      return [...prev, { kind: 'new', file, previewUrl, is_primary: isPrimary }];
    });
    URL.revokeObjectURL(current.src);
    setCropQueue(prev => prev.slice(1));
    setCropState({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const handleCropSkip = () => {
    if (cropQueue.length === 0) return;
    URL.revokeObjectURL(cropQueue[0].src);
    setCropQueue(prev => prev.slice(1));
    setCropState({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const isEmpty = (val: any) => val === '' || val === null || val === undefined;
  const enabledFits = (['REGULAR', 'OVERSIZED'] as FitType[]).filter(f => fits[f].enabled);
  const fitsValid = enabledFits.length > 0 && enabledFits.every(f => !isEmpty(fits[f].price) && fits[f].sizes.length > 0);
  const colorsValid = colors.length > 0 && colors.every(c => c.name.trim() !== '');

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAttempted(true);
    if (isEmpty(formData.name) || isEmpty(formData.skuPrefix) || isEmpty(formData.weight) || isEmpty(formData.desc) || !colorsValid || !fitsValid) {
      return;
    }
    const fd = new FormData(e.currentTarget);
    images.forEach((img, i) => {
      if (img.kind === 'existing') {
        fd.set(`image_existing_id_${i}`, img.id);
      } else {
        fd.set(`image_file_${i}`, img.file);
      }
    });
    fd.set('image_count', String(images.length));
    const primaryIdx = images.findIndex(img => img.is_primary);
    fd.set('image_primary', String(primaryIdx >= 0 ? primaryIdx : 0));
    fd.set('colors', JSON.stringify(colors));
    fd.set('fits', JSON.stringify(fits));
    await action(fd);
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: 'white', padding: 32, borderRadius: 12, border: '1px solid var(--line)', maxWidth: 800 }}>
      {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

      <div className="r-stack-768" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div style={fieldGroup}>
          <label style={labelStyle}>Product Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            style={getFieldStyle(formData.name !== (initialData?.name || ''), attempted && isEmpty(formData.name))}
            placeholder="e.g. Fang & Horn"
          />
          {attempted && isEmpty(formData.name) && <span style={errorText}>Required</span>}
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
            style={getFieldStyle(formData.skuPrefix !== (initialData?.sku_prefix || ''), attempted && isEmpty(formData.skuPrefix))}
            placeholder="e.g. FH-TEE"
          />
          {attempted && isEmpty(formData.skuPrefix) && <span style={errorText}>Required</span>}
        </div>
        <div style={fieldGroup}>
          <label style={labelStyle}>Weight (g)</label>
          <input
            name="weight"
            type="number"
            step="0.01"
            value={formData.weight}
            onChange={e => setFormData({...formData, weight: e.target.value})}
            style={getFieldStyle(String(formData.weight) !== String(initialData?.weight_g ?? ''), attempted && isEmpty(formData.weight))}
            placeholder="e.g. 250"
          />
          {attempted && isEmpty(formData.weight) && <span style={errorText}>Required</span>}
        </div>
      </div>

      <div style={{ ...fieldGroup, marginBottom: 24 }}>
        <label style={labelStyle}>Description</label>
        <textarea
          name="desc"
          value={formData.desc}
          onChange={e => setFormData({...formData, desc: e.target.value})}
          style={{ ...getFieldStyle(formData.desc !== (initialData?.desc || ''), attempted && isEmpty(formData.desc)), minHeight: 100, resize: 'vertical' }}
        />
        {attempted && isEmpty(formData.desc) && <span style={errorText}>Required</span>}
      </div>

      {formData.category !== 'TOTEBAG' && (
        <div  style={{ marginBottom: 32 }}>
          <label style={{ ...labelStyle, color: attempted && !fitsValid ? '#ef4444' : 'var(--muted)' }}>Enabled Fits</label>
          {attempted && !fitsValid && <span style={errorText}>{enabledFits.length === 0 ? 'Enable at least one fit' : 'Each enabled fit needs a price and at least one size'}</span>}
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
        <label style={{ ...labelStyle, color: attempted && !colorsValid ? '#ef4444' : 'var(--muted)' }}>Global Colors</label>
        {attempted && !colorsValid && <span style={errorText}>{colors.length === 0 ? 'Add at least one color' : 'All colors must have a name'}</span>}
        <div style={{ display: 'flex', gap: 12, flexDirection: 'column', marginTop: 8, borderRadius: 8, border: attempted && !colorsValid ? '1px solid #ef4444' : 'none', padding: attempted && !colorsValid ? 8 : 0 }}>
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

          <div className="r-stack-768" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            <div style={fieldGroup}>
              <label style={labelStyle}>{f} Price (€)</label>
              <input type="number" value={fits[f].price}
                onChange={e => handleUpdateFit(f, { price: e.target.value })}
                style={getFieldStyle(false, attempted && isEmpty(fits[f].price))} />
              {attempted && isEmpty(fits[f].price) && <span style={errorText}>Required</span>}
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
            <div className="admin-scroll-x" style={{ marginTop: 12, border: '1px solid var(--line)', borderRadius: 8, overflowX: 'auto', background: 'white' }}>
              <table style={{ width: '100%', minWidth: 420, borderCollapse: 'collapse', fontSize: 11 }}>
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
          onChange={(e) => {
            if (!e.target.files || e.target.files.length === 0) return;
            const queue = Array.from(e.target.files).map(file => ({
              src: URL.createObjectURL(file),
              name: file.name,
            }));
            setCropQueue(queue);
            setCropQueueTotal(queue.length);
            setCropState({ x: 0, y: 0 });
            setZoom(1);
            setCroppedAreaPixels(null);
            setFileInputKey(prevKey => prevKey + 1);
          }}
          style={{ marginTop: 3, marginBottom: 20, display: 'block' }}
          key={fileInputKey}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 16 }}>
          {images.map((image, index) => {
            const imgUrl = image.kind === 'existing' ? image.url : image.previewUrl;
            return (
            <div
              key={imgUrl}
              style={{
                border: `2px solid ${image.is_primary ? 'var(--black)' : 'var(--line)'}`,
                borderRadius: 8,
                overflow: 'hidden',
                position: 'relative',
                padding: 8
              }}
            >
              <img src={imgUrl} alt="Product preview" style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 4 }} />
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
            );
          })}
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

      {cropQueue.length > 0 && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          zIndex: 9999, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 0,
        }}>
          <div style={{
            background: 'var(--cream)', width: '100%', maxWidth: 540,
            borderRadius: 12, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
          }}>
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid var(--line)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Crop Image {cropQueueTotal > 1 ? `(${cropQueueTotal - cropQueue.length + 1} of ${cropQueueTotal})` : ''}
              </span>
              <button
                type="button"
                onClick={handleCropSkip}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', textDecoration: 'underline' }}
              >
                skip
              </button>
            </div>

            <div style={{ position: 'relative', width: '100%', height: 460, background: '#111' }}>
              <Cropper
                image={cropQueue[0].src}
                crop={cropState}
                zoom={zoom}
                aspect={4 / 5}
                onCropChange={setCropState}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', whiteSpace: 'nowrap' }}>ZOOM</span>
                <input
                  type="range" min={1} max={3} step={0.05}
                  value={zoom}
                  onChange={e => setZoom(Number(e.target.value))}
                  style={{ flex: 1 }}
                />
              </div>
              <button
                type="button"
                onClick={handleCropConfirm}
                style={{
                  padding: '10px 24px', background: 'var(--black)', color: 'var(--cream)',
                  border: 'none', borderRadius: 6, fontFamily: 'var(--font-mono)',
                  fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                CONFIRM CROP
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

const fieldGroup: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 8 };
const labelStyle: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.05em' };
const inputStyle: React.CSSProperties = { padding: '12px', borderRadius: 6, border: '1px solid var(--line)', fontSize: 14, fontFamily: 'inherit' };
const errorText: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 11, color: '#ef4444' };

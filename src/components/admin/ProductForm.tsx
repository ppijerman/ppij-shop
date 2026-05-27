'use client';

import { useState } from 'react';

interface ProductFormProps {
  initialData?: any;
  action: (formData: FormData) => Promise<void>;
}

const getFieldStyle = (isChanged: boolean) => ({
  ...inputStyle,
  borderColor: isChanged ? 'var(--orange)' : 'var(--line)',
  backgroundColor: isChanged ? '#fff7ed' : 'white',
});

export default function ProductForm({ initialData, action }: ProductFormProps) {
  const variants = initialData?.variants || [];
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    subtitle: initialData?.subtitle || '',
    category: initialData?.category || 'TSHIRT',
    fitType: initialData?.fit_type || 'REGULAR',
    tag: initialData?.tag || '',
    skuPrefix: initialData?.sku_prefix || '',
    price: variants[0]?.price || 0,
    weight: initialData?.weight_g || 0,
    originalPrice: variants[0]?.original_price || '',
    desc: initialData?.desc || ''
  });
  
  const [sizes, setSizes] = useState<string[]>(
    Array.from(new Set(variants.map((v: any) => v.size as string)))
  );
  
  const [colors, setColors] = useState<{name: string, hex: string}[]>(
    Array.from(new Set(variants.map((v: any) => JSON.stringify({ name: v.color_name, hex: v.color_hex }))))
      .map(s => JSON.parse(s as string))
  );

  const [stock, setStock] = useState<Record<string, Record<string, number>>>( () => {
    if (variants.length > 0) {
      return variants.reduce((acc: any, v: any) => {
        acc[v.color_name] = acc[v.color_name] || {};
        acc[v.color_name][v.size] = v.stock;
        return acc;
      }, {});
    }
    return {};
  });

  const [images, setImages] = useState<{ url: string; is_primary: boolean; }[]>(initialData?.images || []);
  const [fileInputKey, setFileInputKey] = useState(0);

  const handleStockChange = (colorName: string, size: string, value: number) => {
    setStock(prevStock => ({
      ...prevStock,
      [colorName]: {
        ...(prevStock[colorName] || {}),
        [size]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set('images', JSON.stringify(images));
    action(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: 'white', padding: 32, borderRadius: 12, border: '1px solid var(--line)', maxWidth: 800 }}>
      {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}
      <input type="hidden" name="sizes" value={JSON.stringify(sizes)} />
      <input type="hidden" name="colors" value={JSON.stringify(colors)} />
      <input type="hidden" name="stock" value={JSON.stringify(stock)} />

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
            onChange={e => setFormData({...formData, category: e.target.value})}
            style={{...getFieldStyle(formData.category !== (initialData?.category || 'TSHIRT')), height: '48px'}}
          >
            <option value="TSHIRT">TSHIRT</option>
            <option value="TOTEBAG">TOTE BAG</option>
          </select>
        </div>
        <div style={fieldGroup}>
          <label style={labelStyle}>Fit Type</label>
          <select 
            name="fitType" 
            value={formData.fitType} 
            onChange={e => setFormData({...formData, fitType: e.target.value})}
            style={{...getFieldStyle(formData.fitType !== (initialData?.fit_type || 'REGULAR')), height: '48px' }}
          >
            <option value="REGULAR">REGULAR</option>
            <option value="OVERSIZED">OVERSIZED</option>
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
          <label style={labelStyle}>Price (€)</label>
          <input 
            name="price" 
            type="number" 
            value={formData.price} 
            onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
            style={getFieldStyle(formData.price !== (initialData?.price || variants[0]?.price || 0))}
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
        <div style={fieldGroup}>
          <label style={labelStyle}>Original Price (€)</label>
          <input 
            name="originalPrice" 
            type="number" 
            value={formData.originalPrice} 
            onChange={e => setFormData({...formData, originalPrice: e.target.value})}
            style={getFieldStyle(formData.originalPrice !== (initialData?.original_price || variants[0]?.original_price || ''))}
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

      <div style={{ marginBottom: 32 }}>
        <label style={labelStyle}>Sizes</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {['S', 'M', 'L', 'XL', 'XXL', 'ONE SIZE'].map(s => (
            <button 
              type='button'
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
                type='button'
                onClick={() => setColors(colors.filter((_, idx) => idx !== i))}
                style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', fontSize: 20 }}
              >
                ×
              </button>
            </div>
          ))}
          <button 
            type='button'
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

      {(colors.length > 0 && sizes.length > 0) && (
        <div style={{ marginBottom: 32 }}>
          <label style={labelStyle}>Inventory & Stock</label>
          <div style={{ marginTop: 12, border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#f9f9f9', borderBottom: '1px solid var(--line)' }}>
                  <th style={{ padding: 12, textAlign: 'left', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>Color / Size</th>
                  {sizes.map(s => (
                    <th key={s} style={{ padding: 12, textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>{s}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {colors.map(c => (
                  <tr key={c.name} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: 12, fontWeight: 600 }}>{c.name}</td>
                    {sizes.map(s => (
                      <td key={s} style={{ padding: 8 }}>
                        <input 
                          type="number"
                          value={stock[c.name]?.[s] ?? 0}
                          placeholder="0"
                          onChange={(e) => handleStockChange(c.name, s, parseInt(e.target.value) || 0)}
                          style={{ 
                            width: '100%', 
                            padding: '6px', 
                            textAlign: 'center', 
                            border: '1px solid var(--line)', 
                            borderRadius: 4,
                            fontFamily: 'var(--font-mono)'
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                  background: image.is_primary ? 'var(--orange)' : 'var(--cream)', 
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

'use client';

import { useState } from 'react';

interface BundleFormProps {
  initialData?: any;
  products: any[];
  action: (formData: FormData) => Promise<void>;
}

const getFieldStyle = (isChanged: boolean) => ({
  ...inputStyle,
  borderColor: isChanged ? 'var(--orange)' : 'var(--line)',
  backgroundColor: isChanged ? '#fff7ed' : 'white',
});

export default function BundleForm({ initialData, products, action }: BundleFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.desc || '',
    price: initialData?.price || 0,
    originalPrice: initialData?.original_price || '',
    skuPrefix: initialData?.sku || ''
  });

  const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>(
    initialData?.items?.map((item: any) => item.variant_id) || []
  );

  const toggleProduct = (product: any) => {
    const productVariantIds = product.variants?.map((v: any) => v.id) || [];
    const isSelected = productVariantIds.every((id: string) => selectedVariantIds.includes(id));

    if (isSelected) {
      setSelectedVariantIds(selectedVariantIds.filter(id => !productVariantIds.includes(id)));
    } else {
      setSelectedVariantIds([...new Set([...selectedVariantIds, ...productVariantIds])]);
    }
  }

  const initialSelected = initialData?.items?.map((item: any) => item.variant_id) || [];
  const areProductsChanged = JSON.stringify(selectedVariantIds.sort()) !== JSON.stringify(initialSelected.sort());

  return (
    <form action={action} style={{ background: 'white', padding: 32, borderRadius: 12, border: '1px solid var(--line)', maxWidth: 800 }}>
      <input type="hidden" name="selectedVariantIds" value={JSON.stringify(selectedVariantIds)} />
      {initialData?.id && <input type="hidden" name="bundleId" value={initialData.id} />}
      
      <div style={fieldGroup}>
        <label style={labelStyle}>Bundle Name</label>
        <input 
          name="name" 
          value={formData.name} 
          onChange={e => setFormData({...formData, name: e.target.value})}
          style={getFieldStyle(formData.name !== (initialData?.name || ''))}
          placeholder="e.g. Tote Duo" 
        />
      </div>

      <div style={{ ...fieldGroup, marginTop: 24 }}>
        <label style={labelStyle}>Description</label>
        <textarea 
          name="description" 
          value={formData.description} 
          onChange={e => setFormData({...formData, description: e.target.value})}
          style={{ ...getFieldStyle(formData.description !== (initialData?.desc || '')), minHeight: 100 }} 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
        <div style={fieldGroup}>
          <label style={labelStyle}>Price (€)</label>
          <input 
            name="price" 
            type="number" 
            value={formData.price} 
            onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
            style={getFieldStyle(Number(formData.price) !== Number(initialData?.price || 0))} 
          />
        </div>
        <div style={fieldGroup}>
          <label style={labelStyle}>Original Price (€)</label>
          <input 
            name="originalPrice" 
            type="number" 
            value={formData.originalPrice} 
            onChange={e => setFormData({...formData, originalPrice: e.target.value})}
            style={getFieldStyle(String(formData.originalPrice) !== String(initialData?.original_price || ''))} 
            placeholder="Leave empty if no discount" 
          />
        </div>
      </div>

      <div style={{ ...fieldGroup, marginTop: 24, width: '33%' }}>
        <label style={labelStyle}>SKU Prefix</label>
        <input 
          name="skuPrefix" 
          value={formData.skuPrefix} 
          onChange={e => setFormData({...formData, skuPrefix: e.target.value})}
          style={getFieldStyle(formData.skuPrefix !== (initialData?.sku || ''))} 
          placeholder="e.g. BUNDLE-DUO" 
        />
      </div>

      <div style={{ marginTop: 32, marginBottom: 40 }}>
        <label style={{ ...labelStyle, color: areProductsChanged ? 'var(--orange)' : 'var(--muted)' }}>Included Products {areProductsChanged && '*'}</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          {products.map(product => {
            const isSelected = product.variants?.some((v: any) => selectedVariantIds.includes(v.id));
            return (
            <div 
              key={product.id} 
              onClick={() => toggleProduct(product)}
              style={{
                padding: '12px 16px',
                borderRadius: 8,
                border: '1px solid var(--line)',
                background: isSelected ? 'var(--cream-2)' : 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transition: 'all 0.15s'
              }}
            >
              <div style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                border: '2px solid var(--black)',
                background: isSelected ? 'var(--black)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 12
              }}>
                {isSelected && '✓'}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{product.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{product.category}</div>
              </div>
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
        {initialData ? 'SAVE CHANGES' : 'CREATE BUNDLE'}
      </button>
    </form>
  );
}

const fieldGroup: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 8 };
const labelStyle: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.05em' };
const inputStyle: React.CSSProperties = { padding: '12px', borderRadius: 6, border: '1px solid var(--line)', fontSize: 14, fontFamily: 'inherit' };

'use client';

import { useState } from 'react';

interface BundleFormProps {
  initialData?: any;
  products: any[];
  action: (formData: FormData) => Promise<void>;
}

const getFieldStyle = (isChanged: boolean, isEmpty = false) => ({
  ...inputStyle,
  borderColor: isEmpty ? '#ef4444' : isChanged ? 'var(--accent)' : 'var(--line)',
  backgroundColor: isEmpty ? '#fef2f2' : isChanged ? '#fff7ed' : 'white',
});

export default function BundleForm({ initialData, products, action }: BundleFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.desc || '',
    price: initialData?.price ?? '',
    originalPrice: initialData?.original_price || '',
    skuPrefix: initialData?.sku?.replace(/^BDL-/, '') || ''
  });

  const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>(
    initialData?.items?.map((item: any) => item.variant_id) || []
  );

  const [attempted, setAttempted] = useState(false);

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

  const isFieldEmpty = (val: any) => val === '' || val === null || val === undefined;
  const isPriceInvalid = () => {
    const op = parseFloat(String(formData.originalPrice));
    return !isNaN(op) && op <= formData.price;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setAttempted(true);
    const missing =
      isFieldEmpty(formData.name) ||
      isFieldEmpty(formData.description) ||
      isFieldEmpty(formData.price) ||
      isFieldEmpty(formData.skuPrefix) ||
      selectedVariantIds.length === 0;
    if (missing || isPriceInvalid()) {
      e.preventDefault();
    }
  };

  return (
    <form action={action} onSubmit={handleSubmit} style={{ background: 'white', padding: 32, borderRadius: 12, border: '1px solid var(--line)', maxWidth: 800 }}>
      <input type="hidden" name="selectedVariantIds" value={JSON.stringify(selectedVariantIds)} />
      {initialData?.id && <input type="hidden" name="bundleId" value={initialData.id} />}
      
      <div style={fieldGroup}>
        <label style={labelStyle}>Bundle Name</label>
        <input
          name="name"
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
          style={getFieldStyle(formData.name !== (initialData?.name || ''), attempted && isFieldEmpty(formData.name))}
          placeholder="e.g. Tote Duo"
        />
        {attempted && isFieldEmpty(formData.name) && <span style={errorText}>Required</span>}
      </div>

      <div style={{ ...fieldGroup, marginTop: 24 }}>
        <label style={labelStyle}>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={e => setFormData({...formData, description: e.target.value})}
          style={{ ...getFieldStyle(formData.description !== (initialData?.desc || ''), attempted && isFieldEmpty(formData.description)), minHeight: 100 }}
        />
        {attempted && isFieldEmpty(formData.description) && <span style={errorText}>Required</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
        <div style={fieldGroup}>
          <label style={labelStyle}>Price (€)</label>
          <input
            name="price"
            type="number"
            value={formData.price}
            onChange={e => setFormData({...formData, price: e.target.value})}
            style={getFieldStyle(String(formData.price) !== String(initialData?.price ?? ''), attempted && isFieldEmpty(formData.price))}
          />
          {attempted && isFieldEmpty(formData.price) && <span style={errorText}>Required</span>}
        </div>
        <div style={fieldGroup}>
          <label style={labelStyle}>Original Price (€)</label>
          <input
            name="originalPrice"
            type="number"
            value={formData.originalPrice}
            onChange={e => setFormData({...formData, originalPrice: e.target.value})}
            style={getFieldStyle(String(formData.originalPrice) !== String(initialData?.original_price || ''), attempted && isPriceInvalid())}
          />
          {attempted && isPriceInvalid() && <span style={errorText}>Must be greater than price</span>}
        </div>
      </div>

      <div style={{ ...fieldGroup, marginTop: 24, width: '33%' }}>
        <label style={labelStyle}>SKU Prefix</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          <span style={{ padding: '12px', background: '#f3f4f6', border: '1px solid var(--line)', borderRight: 'none', borderRadius: '6px 0 0 6px', fontSize: 14, color: 'var(--muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>BDL-</span>
          <input
            name="skuPrefix"
            value={formData.skuPrefix}
            onChange={e => setFormData({...formData, skuPrefix: e.target.value})}
            style={{ ...getFieldStyle(formData.skuPrefix !== (initialData?.sku?.replace(/^BDL-/, '') || ''), attempted && isFieldEmpty(formData.skuPrefix)), borderRadius: '0 6px 6px 0', flex: 1 }}
            placeholder="e.g. BUNDLE-DUO"
          />
        </div>
        {attempted && isFieldEmpty(formData.skuPrefix) && <span style={errorText}>Required</span>}
      </div>

      <div style={{ marginTop: 32, marginBottom: 40 }}>
        <label style={{ ...labelStyle, color: attempted && selectedVariantIds.length === 0 ? '#ef4444' : areProductsChanged ? 'var(--accent)' : 'var(--muted)' }}>
          Included Products {areProductsChanged && '*'}
        </label>
        {attempted && selectedVariantIds.length === 0 && <span style={errorText}>Select at least one product</span>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12, borderRadius: 8, border: attempted && selectedVariantIds.length === 0 ? '1px solid #ef4444' : 'none', padding: attempted && selectedVariantIds.length === 0 ? 8 : 0 }}>
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
const errorText: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 11, color: '#ef4444' };

'use client';

import { useState } from 'react';

interface BundleFormProps {
  initialData?: any;
  products: any[];
  action: (formData: FormData) => Promise<void>;
}

export default function BundleForm({ initialData, products, action }: BundleFormProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>(
    initialData?.items?.map((item: any) => item.product_id) || []
  );

  const toggleProduct = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  return (
    <form action={action} style={{ background: 'white', padding: 32, borderRadius: 12, border: '1px solid var(--line)', maxWidth: 800 }}>
      <input type="hidden" name="selectedProducts" value={JSON.stringify(selectedProducts)} />
      {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}
      
      <div style={fieldGroup}>
        <label style={labelStyle}>Bundle Name</label>
        <input name="name" defaultValue={initialData?.name || ''} style={inputStyle} placeholder="e.g. Tote Duo" />
      </div>

      <div style={{ ...fieldGroup, marginTop: 24 }}>
        <label style={labelStyle}>Description</label>
        <textarea name="description" defaultValue={initialData?.desc || ''} style={{ ...inputStyle, minHeight: 100 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
        <div style={fieldGroup}>
          <label style={labelStyle}>Price (€)</label>
          <input name="price" type="number" defaultValue={initialData?.price || 0} style={inputStyle} />
        </div>
        <div style={fieldGroup}>
          <label style={labelStyle}>Original Price (€)</label>
          <input name="originalPrice" type="number" defaultValue={initialData?.original_price || ''} style={inputStyle} placeholder="Leave empty if no discount" />
        </div>
      </div>

      <div style={{ ...fieldGroup, marginTop: 24, width: '33%' }}>
        <label style={labelStyle}>SKU Prefix</label>
        <input name="skuPrefix" defaultValue={initialData?.sku || ''} style={inputStyle} placeholder="e.g. BUNDLE-DUO" />
      </div>

      <div style={{ marginTop: 32, marginBottom: 40 }}>
        <label style={labelStyle}>Included Products</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          {products.map(product => (
            <div 
              key={product.id} 
              onClick={() => toggleProduct(product.id)}
              style={{
                padding: '12px 16px',
                borderRadius: 8,
                border: '1px solid var(--line)',
                background: selectedProducts.includes(product.id) ? 'var(--cream-2)' : 'white',
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
                background: selectedProducts.includes(product.id) ? 'var(--black)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 12
              }}>
                {selectedProducts.includes(product.id) && '✓'}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{product.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{product.category}</div>
              </div>
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
        {initialData ? 'SAVE CHANGES' : 'CREATE BUNDLE'}
      </button>
    </form>
  );
}

const fieldGroup: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 8 };
const labelStyle: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.05em' };
const inputStyle: React.CSSProperties = { padding: '12px', borderRadius: 6, border: '1px solid var(--line)', fontSize: 14, fontFamily: 'inherit' };

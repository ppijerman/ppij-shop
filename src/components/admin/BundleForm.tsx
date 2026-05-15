'use client';

import { useState } from 'react';
import { Bundle, Product } from '@/types';

interface BundleFormProps {
  initialData?: Bundle;
  products: Product[];
  onSubmit: (data: any) => void;
}

export default function BundleForm({ initialData, products, onSubmit }: BundleFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
  });

  const [selectedProducts, setSelectedProducts] = useState<number[]>(initialData?.productIds || []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleProduct = (productId: number) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  return (
    <div style={{ background: 'white', padding: 32, borderRadius: 12, border: '1px solid var(--line)', maxWidth: 800 }}>
      <div style={fieldGroup}>
        <label style={labelStyle}>Bundle Name</label>
        <input name="name" value={formData.name} onChange={handleChange} style={inputStyle} placeholder="e.g. Tote Duo" />
      </div>

      <div style={{ ...fieldGroup, marginTop: 24 }}>
        <label style={labelStyle}>Description</label>
        <textarea name="description" value={formData.description} onChange={handleChange} style={{ ...inputStyle, minHeight: 100 }} />
      </div>

      <div style={{ ...fieldGroup, marginTop: 24, width: '33%' }}>
        <label style={labelStyle}>Price (€)</label>
        <input name="price" type="number" value={formData.price} onChange={handleChange} style={inputStyle} />
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
        onClick={() => onSubmit({ ...formData, selectedProducts })}
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

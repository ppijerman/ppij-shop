'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { getCroppedFile } from '@/lib/image-utils';

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
  const [submitError, setSubmitError] = useState<string | null>(null);

  type ImageEntry =
    | { kind: 'new'; file: File; previewUrl: string }
    | { kind: 'existing'; id: string; url: string };

  const [image, setImage] = useState<ImageEntry | null>(() => {
    if (!initialData?.image_id) return null;
    return { kind: 'existing', id: initialData.image_id, url: initialData.image_url };
  });
  const [fileInputKey, setFileInputKey] = useState(0);
  const [cropSrc, setCropSrc] = useState<{ src: string; name: string } | null>(null);
  const [cropState, setCropState] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleCropConfirm = async () => {
    if (!croppedAreaPixels || !cropSrc) return;
    let file: File;
    try {
      file = await getCroppedFile(cropSrc.src, croppedAreaPixels, cropSrc.name);
    } catch {
      alert('Failed to process image. Please try again.');
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    if (image?.kind === 'new') URL.revokeObjectURL(image.previewUrl);
    setImage({ kind: 'new', file, previewUrl });
    URL.revokeObjectURL(cropSrc.src);
    setCropSrc(null);
    setCropState({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const handleCropSkip = () => {
    if (!cropSrc) return;
    URL.revokeObjectURL(cropSrc.src);
    setCropSrc(null);
    setCropState({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

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
  const areProductsChanged = JSON.stringify([...selectedVariantIds].sort()) !== JSON.stringify([...initialSelected].sort());

  const isFieldEmpty = (val: any) => val === '' || val === null || val === undefined;
  const isPriceInvalid = () => {
    const op = parseFloat(String(formData.originalPrice));
    return !isNaN(op) && op <= formData.price;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAttempted(true);
    setSubmitError(null);
    const missing =
      isFieldEmpty(formData.name) ||
      isFieldEmpty(formData.description) ||
      isFieldEmpty(formData.price) ||
      isFieldEmpty(formData.skuPrefix) ||
      selectedVariantIds.length === 0;
    if (missing || isPriceInvalid()) return;
    const fd = new FormData(e.currentTarget);
    if (image?.kind === 'new') {
      fd.set('bundle_image_file', image.file);
    } else if (image?.kind === 'existing') {
      fd.set('bundle_image_existing_id', image.id);
    }
    try {
      await action(fd);
    } catch (err) {
      // Re-throw Next.js redirect/not-found so the router can handle navigation
      if (err instanceof Error && 'digest' in err) throw err;
      setSubmitError('Something went wrong. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: 'white', padding: 32, borderRadius: 12, border: '1px solid var(--line)', maxWidth: 800 }}>
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

      <div className="r-stack-768" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
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
        <div className="r-stack-768" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12, borderRadius: 8, border: attempted && selectedVariantIds.length === 0 ? '1px solid #ef4444' : 'none', padding: attempted && selectedVariantIds.length === 0 ? 8 : 0 }}>
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

      <div style={{ marginBottom: 40 }}>
        <label style={labelStyle}>Bundle Image <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional — falls back to product images)</span></label>
        <input
          key={fileInputKey}
          type="file"
          accept="image/*"
          onChange={e => {
            const file = e.target.files?.[0];
            if (!file) return;
            setCropSrc({ src: URL.createObjectURL(file), name: file.name });
            setCropState({ x: 0, y: 0 });
            setZoom(1);
            setCroppedAreaPixels(null);
            setFileInputKey(k => k + 1);
          }}
          style={{ marginTop: 3, marginBottom: 20, display: 'block' }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 16 }}>
          {image && (() => {
            const imgUrl = image.kind === 'new' ? image.previewUrl : image.url;
            return (
              <div
                style={{
                  border: '2px solid var(--black)',
                  borderRadius: 8,
                  overflow: 'hidden',
                  position: 'relative',
                  padding: 8,
                }}
              >
                <img src={imgUrl} alt="Bundle preview" style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 4 }} />
                <span style={{ position: 'absolute', top: 4, right: 4, background: 'var(--black)', color: 'white', padding: '2px 6px', borderRadius: 4, fontSize: 10 }}>
                  IMAGE
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (image.kind === 'new') URL.revokeObjectURL(image.previewUrl);
                    setImage(null);
                    setFileInputKey(k => k + 1);
                  }}
                  style={{ marginTop: 8, width: '100%', padding: '6px', background: '#f44336', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}
                >
                  Delete
                </button>
              </div>
            );
          })()}
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
      {submitError && (
        <p style={{ marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 12, color: '#ef4444', textAlign: 'center' }}>
          {submitError}
        </p>
      )}

      {cropSrc && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          zIndex: 9999, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: 'var(--cream)', width: '100%', maxWidth: 540,
            borderRadius: 12, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
          }}>
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid var(--line)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Crop Bundle Image</span>
              <button
                type="button"
                onClick={handleCropSkip}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', textDecoration: 'underline' }}
              >
                cancel
              </button>
            </div>
            <div style={{ position: 'relative', width: '100%', height: 460, background: '#111' }}>
              <Cropper
                image={cropSrc.src}
                crop={cropState}
                zoom={zoom}
                aspect={2 / 1}
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

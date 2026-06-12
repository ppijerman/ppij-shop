interface ProductCropProps {
  src: string;
  height?: number | 'auto';
  scale?: number;
}

export default function ProductCrop({ src, height = 'auto' }: ProductCropProps) {
  return (
    <div style={{
      width: '100%', 
      height: height === 'auto' ? '100%' : height,
      backgroundImage: `url(${src})`,
      backgroundSize: '100%',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundColor: 'var(--cream-2)',
      position: 'relative',
    }} />
  );
}

interface ProductCropProps {
  src: string;
  height?: number | 'auto';
  scale?: number;
}

export default function ProductCrop({ src, height = 'auto', scale = 2.2 }: ProductCropProps) {
  return (
    <div style={{
      width: '100%', 
      height: height === 'auto' ? '100%' : height,
      backgroundImage: `url(${src})`,
      backgroundSize: `${scale * 100}%`,
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundColor: 'var(--cream-2)',
      position: 'relative',
    }} />
  );
}

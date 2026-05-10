interface ProductCropProps {
  src: string;
  pos: { x: number; y: number };
  height?: number;
  scale?: number;
}

export default function ProductCrop({ src, pos, height = 380, scale = 2.2 }: ProductCropProps) {
  return (
    <div style={{
      width: '100%', height,
      backgroundImage: `url(${src})`,
      backgroundSize: `${scale * 100}%`,
      backgroundPosition: `${pos.x}% ${pos.y}%`,
      backgroundRepeat: 'no-repeat',
      backgroundColor: 'var(--cream-2)',
      position: 'relative',
    }} />
  );
}

'use client';

import type { Area } from 'react-easy-crop';

export async function getCroppedFile(src: string, crop: Area, originalName: string): Promise<File> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
  const MAX = 1600;
  const scale = Math.min(1, MAX / Math.max(crop.width, crop.height));
  const outW = Math.round(crop.width * scale);
  const outH = Math.round(crop.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, outW, outH);
  return new Promise<File>((resolve, reject) =>
    canvas.toBlob(blob => {
      if (!blob) { reject(new Error('Failed to generate cropped image')); return; }
      resolve(new File([blob], originalName, { type: 'image/webp' }));
    }, 'image/webp', 0.85)
  );
}
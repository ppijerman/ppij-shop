'use client';

import { useToast } from '@/context/ToastContext';

export default function Toast() {
  const { toast } = useToast();
  if (!toast) return null;
  return <div className="toast">{toast}</div>;
}

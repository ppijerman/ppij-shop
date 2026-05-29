import AdminShell from '@/components/admin/AdminShell';
import type React from 'react';
import { getCurrentDbUserOrThrow } from "@/lib/users";
import { redirect, notFound } from "next/navigation";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;
  
  if (role !== 'it' && role !== 'kk') {
    notFound();
  }

  const user = await getCurrentDbUserOrThrow();

  // Validate that the user role matches the URL path
  const expectedRole = role === 'it' ? 'ADMIN_IT' : 'ADMIN_KK';
  
  if (user.role !== expectedRole) {
    redirect('/');
  }

  return <AdminShell>{children}</AdminShell>;
}

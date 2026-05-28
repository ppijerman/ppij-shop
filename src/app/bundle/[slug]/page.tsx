import { getBundleBySlug } from "@/lib/dal/bundles";
import BundleDetailClient from "@/components/bundle/BundleDetailClient"
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function BundlePage({ params }: { params: Promise<{ slug: string}>}) {
  const { slug } = await params;
  const bundle = await getBundleBySlug(slug);

  if (!bundle) {
    notFound();
  }

  return (
    <main style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      {/* Breadcrumbs */}
      <div style={{ 
        maxWidth: 1440, 
        margin: '0 auto', 
        padding: '120px 28px 0', 
        display: 'flex', 
        gap: 8, 
        fontFamily: 'var(--font-mono)', 
        fontSize: 10, 
        textTransform: 'uppercase', 
        letterSpacing: '0.2em',
        color: 'var(--muted)'
      }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>home</Link>
        <span>/</span>
        <Link href="/catalog" style={{ textDecoration: 'none', color: 'inherit' }}>shop</Link>
        <span>/</span>
        <span style={{ color: 'var(--black)' }}>bundles</span>
      </div>

      <BundleDetailClient bundle={bundle}/>
    </main>
  );
}

import { getBundleBySlug } from "@/lib/dal/bundles";
import BundleDetailClient from "@/components/bundle/BundleDetailClient"
import { notFound } from "next/navigation";

export default async function BundlePage({ params }: { params: Promise<{ slug: string}>}) {
  const { slug } = await params;
  const bundle = await getBundleBySlug(slug);

  if (!bundle) {
    notFound();
  }

  return <BundleDetailClient bundle={bundle}/>
}
/* Pre-generated local WebP variants work identically on Workers and Next, without an image-proxy dependency. */
/* eslint-disable @next/next/no-img-element */
import { readerImageSources } from "@/lib/media-policy";
export function RecordImage({ src, alt, priority = false, sizes = "(max-width: 760px) 90vw, 50vw" }: { src: string; alt: string; priority?: boolean; sizes?: string }) {
  const projected = readerImageSources(src);
  return <img {...projected} sizes={projected.srcSet ? sizes : undefined} alt={alt} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} decoding="async" />;
}

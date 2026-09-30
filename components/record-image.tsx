/* Pre-generated local WebP variants work identically on Workers and Next, without an image-proxy dependency. */
/* eslint-disable @next/next/no-img-element */
const dimensions: Record<string, readonly [number, number]> = {"/fedex-705.webp": [1280, 853], "/wirecard.webp": [1800, 1199], "/goiania-source.webp": [1403, 1174], "/lake-nyos.webp": [532, 402], "/therac-25.webp": [850, 1138]};
export function RecordImage({ src, alt, priority = false, sizes = "(max-width: 760px) 90vw, 50vw" }: { src: string; alt: string; priority?: boolean; sizes?: string }) {
  const [width, height] = dimensions[src] || [];
  const variants = width ? [`${src.replace(".webp", "-480.webp")} 480w`, ...(width > 960 ? [`${src.replace(".webp", "-960.webp")} 960w`] : []), `${src} ${width}w`].join(", ") : undefined;
  return <img src={src} srcSet={variants} sizes={variants ? sizes : undefined} alt={alt} width={width} height={height} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} decoding="async" />;
}

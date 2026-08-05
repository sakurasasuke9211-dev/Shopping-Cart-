import { useEffect, useState } from "react";

const FALLBACK = "/placeholder-product.svg";

type ProductImageProps = {
  src?: string | null;
  /** Alternate URLs tried in order before the local placeholder. */
  altSrcs?: string[];
  alt: string;
  className?: string;
};

function buildSources(src?: string | null, altSrcs?: string[]): string[] {
  const list = [src, ...(altSrcs ?? [])]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));
  return [...new Set([...list, FALLBACK])];
}

/** Product photo that walks through alternates, then a local SVG placeholder. */
export function ProductImage({ src, altSrcs, alt, className }: ProductImageProps) {
  const [sources, setSources] = useState(() => buildSources(src, altSrcs));
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setSources(buildSources(src, altSrcs));
    setIndex(0);
  }, [src, altSrcs?.join("|")]);

  return (
    <img
      className={className}
      src={sources[index] ?? FALLBACK}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => {
        setIndex((current) =>
          current < sources.length - 1 ? current + 1 : current,
        );
      }}
    />
  );
}

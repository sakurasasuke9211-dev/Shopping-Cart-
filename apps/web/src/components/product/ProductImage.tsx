import { useEffect, useState } from "react";

const FALLBACK = "/placeholder-product.svg";

type ProductImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
};

/** Product photo with local SVG fallback when the remote URL fails or is missing. */
export function ProductImage({ src, alt, className }: ProductImageProps) {
  const [current, setCurrent] = useState(src?.trim() || FALLBACK);

  useEffect(() => {
    setCurrent(src?.trim() || FALLBACK);
  }, [src]);

  return (
    <img
      className={className}
      src={current}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => {
        if (current !== FALLBACK) setCurrent(FALLBACK);
      }}
    />
  );
}

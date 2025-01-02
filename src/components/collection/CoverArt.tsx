import { SyntheticEvent, useEffect, useState } from 'react';

interface AlbumArtProps {
  className?: string
  src: string
  fallbackSrc: string
  alt: string
  style?: React.CSSProperties | undefined
}

export default function CoverArt({ className = '', src, fallbackSrc, alt, style }: AlbumArtProps) {
  const [imageSrc, setImageSrc] = useState(src);

  const handleImageError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    e.preventDefault();
    console.log("Error loading image", e);
    setImageSrc(fallbackSrc);
    return true
  };

  useEffect(() => {
    console.log("Loading image", src);
    setImageSrc(src);
  }, [src]);

  return (
    <>
      <img className={className} src={imageSrc} alt={alt} onError={(e) => handleImageError(e)} style={style} />
    </>
  )
}
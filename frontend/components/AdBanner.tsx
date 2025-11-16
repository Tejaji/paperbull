'use client'
import { useEffect } from 'react';

interface AdBannerProps {
  dataAdSlot: string;
  dataAdFormat?: string;
  style?: React.CSSProperties;
}

export default function AdBanner({ dataAdSlot, dataAdFormat = "auto", style }: AdBannerProps) {
  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (err) {
      console.log(err);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{
        display: 'block',
        ...style
      }}
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
      data-ad-slot={dataAdSlot}
      data-ad-format={dataAdFormat}
    />
  );
}

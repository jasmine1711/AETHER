import React, { forwardRef } from "react";

/**
 * ProductMedia
 * Props:
 *   - product: object containing thumbnail and images[]
 *   - alt: string (default: "Product")
 *   - className: string
 *   - fallback: string (default: "/images/default.jpg")
 *   - controls: boolean (for video playback, default false)
 *   - ...rest: any other props for <img> or <video>
 */
const ProductImage = forwardRef(
  (
    {
      product,
      alt = "Product",
      className = "",
      fallback = "/images/default.jpg",
      controls = false,
      ...rest
    },
    ref
  ) => {
    const getBestMedia = () => {
      if (!product) return fallback;
      return product?.thumbnail || product?.images?.[0] || fallback;
    };

    const mediaUrl = getBestMedia();

    const isVideo = (url) => url?.match(/\.(mp4|avi|webm)$/i);

    const handleError = (e) => {
      if (e.currentTarget.tagName === "IMG" && e.currentTarget.src !== fallback) {
        e.currentTarget.src = fallback;
      }
    };

    // If it's a video
    if (isVideo(mediaUrl)) {
      return (
        <video
          ref={ref}
          src={mediaUrl}
          className={className}
          controls={controls}
          {...rest}
        />
      );
    }

    // Otherwise it's an image
    return (
      <img
        ref={ref}
        src={mediaUrl}
        alt={alt}
        className={className}
        onError={handleError}
        loading="lazy"
        {...rest}
      />
    );
  }
);

export default ProductImage;

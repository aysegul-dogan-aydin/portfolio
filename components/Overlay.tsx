import React, { useEffect, useRef, useState } from "react";
import { Youtube } from "lucide-react";

interface OverlayProps {
  src: string;
  isVideo: boolean;
  onClose: () => void;
  description: string;
  technical: string;
  youtubeUrl?: string;
}

const Overlay: React.FC<OverlayProps> = ({ src, isVideo, onClose, description, technical, youtubeUrl }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement>(null);
  const [dimensions, setDimensions] = useState({ width: "100%", height: "100%" });
  const [actualWidth, setActualWidth] = useState("100%");

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current && contentRef.current && mediaRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        const content = contentRef.current;
        const media = mediaRef.current;

        // Set initial dimensions to fill the container
        content.style.width = "100%";
        content.style.height = "100%";

        // Get the natural size of the content
        const contentWidth = content.offsetWidth;
        const contentHeight = content.offsetHeight;

        // Calculate the aspect ratio of the container
        const containerAspectRatio = contentWidth / contentHeight;

        // Calculate padding based on screen size
        const padding = Math.min(clientWidth, clientHeight) * 0.1; // 10% of the smaller dimension

        let newWidth, newHeight;

        if ((clientWidth - padding * 2) / (clientHeight - padding * 2) > containerAspectRatio) {
          // Container is wider than content
          newHeight = clientHeight - padding * 2;
          newWidth = newHeight * containerAspectRatio;
        } else {
          // Container is taller than content
          newWidth = clientWidth - padding * 2;
          newHeight = newWidth / containerAspectRatio;
        }

        setDimensions({ width: `${newWidth}px`, height: `${newHeight}px` });

        // Calculate the actual displayed width of the image/video
        let mediaWidth, mediaHeight;
        if (isVideo && media instanceof HTMLVideoElement) {
          mediaWidth = media.videoWidth;
          mediaHeight = media.videoHeight;
        } else if (!isVideo && media instanceof HTMLImageElement) {
          mediaWidth = media.naturalWidth;
          mediaHeight = media.naturalHeight;
        } else {
          return; // Exit if we can't determine media dimensions
        }

        const mediaAspectRatio = mediaWidth / mediaHeight;
        let actualDisplayedWidth;

        if (newWidth / newHeight > mediaAspectRatio) {
          // Height is the limiting factor
          actualDisplayedWidth = newHeight * mediaAspectRatio;
        } else {
          // Width is the limiting factor
          actualDisplayedWidth = newWidth;
        }

        setActualWidth(`${actualDisplayedWidth}px`);
      }
    };

    const handleMediaLoad = () => {
      updateDimensions();
    };

    if (mediaRef.current) {
      if (isVideo && mediaRef.current instanceof HTMLVideoElement) {
        mediaRef.current.addEventListener("loadedmetadata", handleMediaLoad);
      } else if (!isVideo && mediaRef.current instanceof HTMLImageElement) {
        mediaRef.current.addEventListener("load", handleMediaLoad);
      }
    }

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
      if (mediaRef.current) {
        if (isVideo && mediaRef.current instanceof HTMLVideoElement) {
          mediaRef.current.removeEventListener("loadedmetadata", handleMediaLoad);
        } else if (!isVideo && mediaRef.current instanceof HTMLImageElement) {
          mediaRef.current.removeEventListener("load", handleMediaLoad);
        }
      }
    };
  }, [isVideo]);

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div ref={containerRef} className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 sm:p-4 md:p-6 lg:p-8" onClick={onClose}>
      <div
        ref={contentRef}
        className="relative flex flex-col items-center"
        style={{ width: dimensions.width, maxWidth: "100%", maxHeight: "100%" }}
        onClick={handleContentClick}
      >
        <div className="relative" style={{ width: dimensions.width, height: dimensions.height }}>
          {isVideo ? (
            <video ref={mediaRef as React.RefObject<HTMLVideoElement>} src={src} autoPlay loop playsInline className="w-full h-full object-contain" />
          ) : (
            <img ref={mediaRef as React.RefObject<HTMLImageElement>} src={src} alt="Enlarged view" className="w-full h-full object-contain" />
          )}
          <button
            className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-2 touch-manipulation"
            onClick={onClose}
            aria-label="Close overlay"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          {youtubeUrl && (
            <button
              className="absolute top-12 right-2 mt-4 bg-black bg-opacity-50 text-white rounded-full p-2 touch-manipulation"
              onClick={() => window.open(youtubeUrl, "_blank")}
              aria-label="Open in youtube"
            >
              <Youtube size={24} />
            </button>
          )}
        </div>
        <div className="mt-4 space-y-2 text-left" style={{ width: actualWidth }}>
          <p className="text-sm font-normal text-white">{description}</p>
          <p className="text-sm font-normal text-white opacity-75">{technical}</p>
        </div>
      </div>
    </div>
  );
};

export default Overlay;

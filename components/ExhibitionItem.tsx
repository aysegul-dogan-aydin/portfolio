"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface Props {
  className?: string;
  src: string;
  title: string;
  isVideo: boolean;
  onClick: () => void;
}

export default function ExhibitionItem({ className, src, title, isVideo, onClick }: Props) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const mediaRef = useRef<HTMLVideoElement | HTMLImageElement>(null);

  console.log(isVideo);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);

    if (isVideo && mediaRef.current instanceof HTMLVideoElement) {
      const videoElement = mediaRef.current;
      videoElement.muted = true;

      const handleLoadedMetadata = () => {
        setIsLoaded(true);
      };

      const handleError = (e: Event) => {
        console.error("Error loading video:", e);
        setHasError(true);
      };

      videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
      videoElement.addEventListener("error", handleError);

      // Ensure the video is properly loaded
      videoElement.load();

      return () => {
        videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
        videoElement.removeEventListener("error", handleError);
      };
    }
  }, [isVideo, src]);

  const handleImageError = () => {
    console.error("Error loading image");
    setHasError(true);
  };

  return (
    <div
      className={cn("flex flex-col items-center justify-center cursor-pointer", "group", className)}
      style={{ width: "300px", height: "300px" }}
      onClick={onClick}
    >
      <div className="relative w-full h-full overflow-hidden">
        {isVideo ? (
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={src}
            autoPlay
            loop
            playsInline
            className={cn(
              "w-full h-full object-cover border-2 border-white shadow-xl",
              "transition-all duration-300 ease-in-out",
              "filter grayscale group-hover:filter-none",
              !isLoaded && "invisible"
            )}
            onLoadedData={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <Image
            ref={mediaRef as React.RefObject<HTMLImageElement>}
            src={src}
            alt={`An Image About ${title}`}
            layout="fill"
            objectFit="cover"
            className={cn(
              "border-2 border-white shadow-xl",
              "transition-all duration-300 ease-in-out",
              "filter grayscale group-hover:filter-none",
              !isLoaded && "invisible"
            )}
            onLoadingComplete={() => setIsLoaded(true)}
            onError={handleImageError}
          />
        )}
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <p className="text-gray-500">Loading...</p>
          </div>
        )}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <p className="text-red-500">Error loading media</p>
          </div>
        )}
        <div className="absolute inset-0 bg-black opacity-35 group-hover:opacity-0 transition-opacity duration-300 ease-in-out" />
      </div>
    </div>
  );
}

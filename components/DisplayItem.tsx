"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

interface Props {
  className?: string;
  src: string;
  title?: string;
  description: string;
  technical: string;
  isVideo: boolean;
  youtubeUrl?: string;
  onClick?: () => void;
}

export default function DisplayItem({ className, src, title, description, technical, isVideo, youtubeUrl, onClick }: Props) {
  const [dimensions, setDimensions] = useState({ width: 480, height: 720 });
  const [isLoaded, setIsLoaded] = useState(false);
  const mediaRef = useRef<HTMLVideoElement | HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const calculateDimensions = (naturalWidth: number, naturalHeight: number) => {
    if (!containerRef.current) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const maxWidth = Math.min(1080, viewportWidth * 0.9);
    const maxHeight = viewportHeight * 0.9;

    let newWidth = maxWidth;
    let newHeight = (newWidth / naturalWidth) * naturalHeight;

    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = (newHeight / naturalHeight) * naturalWidth;
    }

    setDimensions({ width: Math.round(newWidth), height: Math.round(newHeight) });
    setIsLoaded(true);
  };

  useEffect(() => {
    const handleResize = () => {
      if (mediaRef.current) {
        if (isVideo && mediaRef.current instanceof HTMLVideoElement) {
          calculateDimensions(mediaRef.current.videoWidth, mediaRef.current.videoHeight);
        } else if (!isVideo && mediaRef.current instanceof HTMLImageElement) {
          calculateDimensions(mediaRef.current.naturalWidth, mediaRef.current.naturalHeight);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isVideo]);

  useEffect(() => {
    setIsLoaded(false);
    if (isVideo && mediaRef.current instanceof HTMLVideoElement) {
      const videoElement = mediaRef.current;

      const handleLoadedMetadata = () => {
        calculateDimensions(videoElement.videoWidth, videoElement.videoHeight);
      };

      videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
      videoElement.load(); // Force reload

      return () => {
        videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
      };
    }
  }, [isVideo, src]);

  const handleMouseEnter = () => {
    if (isVideo && mediaRef.current instanceof HTMLVideoElement) {
      mediaRef.current.muted = false;
    }
  };

  const handleMouseLeave = () => {
    if (isVideo && mediaRef.current instanceof HTMLVideoElement) {
      mediaRef.current.muted = true;
    }
  };

  return (
    <div ref={containerRef} className={cn("flex flex-col lg:flex-row items-start lg:items-center justify-center gap-6 lg:gap-6", className)}>
      <div onClick={onClick} className="cursor-pointer relative mx-auto lg:mx-0" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {isVideo ? (
          <div style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }}>
            <video
              ref={mediaRef as React.RefObject<HTMLVideoElement>}
              src={src}
              autoPlay
              loop
              playsInline
              className={cn("w-full h-full object-contain border-2 border-white shadow-xl", !isLoaded && "invisible")}
              onLoadedMetadata={(e) => {
                const video = e.target as HTMLVideoElement;
                calculateDimensions(video.videoWidth, video.videoHeight);
              }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        ) : (
          <div style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }}>
            <Image
              ref={mediaRef as React.RefObject<HTMLImageElement>}
              src={src}
              alt={`An Image About ${title}`}
              layout="fill"
              objectFit="contain"
              className={cn("border-2 border-white shadow-xl", !isLoaded && "invisible")}
              onLoadingComplete={({ naturalWidth, naturalHeight }) => calculateDimensions(naturalWidth, naturalHeight)}
            />
          </div>
        )}
        {!isLoaded && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-gray-200"
            style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }}
          >
            <p className="text-gray-500">Loading...</p>
          </div>
        )}
      </div>
      <div className="p-4 text-white flex flex-col justify-center w-[400px]">
        {title && <h2 className="text-[13px] font-normal text-primary mb-3 uppercase">{title}</h2>}
        <p className="text-[13px] text-justify font-normal text-secondary mb-3">{description}</p>
        <p className="text-[13px] font-normal text-secondary opacity-75 mb-3">{technical}</p>
        {youtubeUrl && (
          <div className="flex flex-row justify-start items-center gap-1 group cursor-pointer" onClick={() => window.open(youtubeUrl, "_blank")}>
            <ExternalLink size={12} className="text-primary" />
            <p className="font-normal text-primary group-hover:underline text-xs text-center">Watch Full Content</p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect, useRef, useCallback } from "react";
import { Type } from "@/types";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Props {
  className?: string;
  src: string;
  title?: string;
  description: string;
  isVideo: boolean;
  id?: string | any; // Accept both string and Convex ID
  type?: Type;
}

export default function Component({ className, src, title, description, isVideo, id, type }: Props) {
  const [dimensions, setDimensions] = useState({ width: 320, height: 320 });
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMediaLoad = (naturalWidth: number, naturalHeight: number) => {
    const aspectRatio = naturalWidth / naturalHeight;
    if (isSmallScreen) {
      const fixedWidth = 320;
      setDimensions({ width: fixedWidth, height: fixedWidth / aspectRatio });
    } else {
      const fixedHeight = 320;
      setDimensions({ width: fixedHeight * aspectRatio, height: fixedHeight });
    }
  };

  useEffect(() => {
    if (isVideo && videoRef.current) {
      videoRef.current.addEventListener("loadedmetadata", () => {
        const video = videoRef.current;
        if (video) {
          handleMediaLoad(video.videoWidth, video.videoHeight);
        }
      });
    }
  }, [isVideo]);

  const handleClick = () => {
    if (id) {
      // Convert Convex ID to string if it's an object
      const nodeId = typeof id === 'string' ? id : id.toString();
      router.push(`/gallery/${type}/${nodeId}`);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (isVideo && videoRef.current) {
      videoRef.current.muted = false;
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (isVideo && videoRef.current) {
      videoRef.current.muted = true;
    }
  };

  const preventDownload = useCallback((e: React.SyntheticEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div
      className={cn("flex flex-col justify-start items-center cursor-pointer w-full mx-auto", className)}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onContextMenu={preventDownload}
    >
      <div
        className={cn("relative mb-2 md:mb-6 overflow-hidden", isSmallScreen ? "w-full h-auto" : "w-auto h-60")}
        style={{
          width: isSmallScreen ? "100%" : `${dimensions.width}px`,
          height: isSmallScreen ? `${dimensions.height}px` : "320px"
        }}
      >
        {isVideo ? (
          <video
            ref={videoRef}
            src={src}
            autoPlay
            loop
            playsInline
            controlsList="nodownload"
            onContextMenu={preventDownload}
            className={cn("object-cover border-2 border-white shadow-xl w-full h-full transition-all duration-300", !isHovered && "grayscale")}
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <Image
            src={src}
            alt={`An Image About ${title}`}
            className={cn("object-cover border-2 border-white shadow-xl transition-all duration-300", !isHovered && "grayscale")}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onLoadingComplete={({ naturalWidth, naturalHeight }) => handleMediaLoad(naturalWidth, naturalHeight)}
            onContextMenu={preventDownload}
            draggable={false}
            style={{ pointerEvents: "none" }}
          />
        )}
      </div>
      <div className={cn("flex flex-col justify-start items-start overflow-hidden w-full", isSmallScreen ? "gap-1" : "gap-4")}>
        <p className="w-full overflow-visible font-normal text-primary text-sm uppercase">{title}</p>
        <p className="w-full line-clamp-2 font-normal text-justify text-secondary text-sm">{description}</p>
      </div>
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface Props {
  src: string;
  isVisible: boolean;
  x: number;
  y: number;
  isVideo?: boolean;
}

export default function CustomCursor({ src, isVisible, x, y, isVideo = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // For video types, always try to show as video regardless of URL extension
  // since Convex storage URLs don't include file extensions
  const shouldShowVideo = isVideo && !videoError;

  useEffect(() => {
    if (shouldShowVideo && videoRef.current && isVisible) {
      const video = videoRef.current;
      console.log('Loading video:', src);
      video.load();
      
      // Try to seek to first frame to ensure thumbnail shows
      video.addEventListener('loadedmetadata', () => {
        console.log('Video metadata loaded, duration:', video.duration);
        video.currentTime = 0.1; // Seek to first frame
      });
    }
  }, [shouldShowVideo, isVisible, src]);

  const handleVideoError = (event: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.log('Video failed to load:', src);
    console.log('Error details:', event);
    setVideoError(true);
  };

  const handleVideoCanPlay = () => {
    console.log('Video can play, showing thumbnail:', src);
    setIsVideoLoaded(true);
  };

  const handleVideoLoadedData = () => {
    console.log('Video data loaded, thumbnail should be visible:', src);
  };

  return (
    <>
      <div
        className={cn("fixed pointer-events-none z-50 transition-opacity duration-300", isVisible ? "opacity-100" : "opacity-0")}
        style={{
          left: `${x + 80}px`,
          top: `${y + 120}px`,
          transform: "translate(-50%, -50%)"
        }}
      >
        <div className="animate-rotate-3d">
          {shouldShowVideo ? (
            <video 
              ref={videoRef}
              src={src} 
              width={100} 
              height={156} 
              muted 
              playsInline
              preload="metadata"
              poster=""
              className="object-cover rounded"
              style={{ width: '100px', height: '156px' }}
              onError={handleVideoError}
              onCanPlay={handleVideoCanPlay}
              onLoadedData={handleVideoLoadedData}
              onLoadStart={() => console.log('Video loading started:', src)}
            />
          ) : src ? (
            <Image src={src} alt="" width={100} height={156} />
          ) : (
            <div 
              className="bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs"
              style={{ width: '100px', height: '156px' }}
            >
              No Preview
            </div>
          )}
        </div>
      </div>
      <style jsx global>{`
        @keyframes rotate3d {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(360deg);
          }
        }
        .animate-rotate-3d {
          animation: rotate3d 2.5s linear infinite;
        }
      `}</style>
    </>
  );
}

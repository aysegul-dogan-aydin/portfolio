"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

interface Props {
  src: string;
  isVisible: boolean;
  x: number;
  y: number;
}

export default function CustomCursor({ src, isVisible, x, y }: Props) {
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
          <Image src={src} alt="" width={100} height={156} />
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

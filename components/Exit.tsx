"use client";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Image from "next/image";
import settings from "@/data/settings";

interface Props {
  className?: string;
  text: string;
  width?: number;
  height?: number;
  overridenPath?: string;
}

export default function Exit({ className, text, width = 120, height = 200, overridenPath }: Props) {
  const router = useRouter();

  const handleClick = () => {
    if (overridenPath) {
      router.push(overridenPath);
    } else {
      router.back();
    }
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 group cursor-pointer", className)} onClick={handleClick}>
      <div className="relative" style={{ width: `${width + 60}px`, height: `${height - 80}px` }}>
        <Image src={settings.signature} alt="" fill style={{ objectFit: "contain" }} sizes={`${Math.max(width, height)}px`} />
      </div>
      <p className="font-normal text-primary group-hover:underline text-base text-center uppercase">{text}</p>
    </div>
  );
}

"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import staticSettings from "@/data/settings";
import AnimatedText from "@/components/AnimatedText";

export default function Page() {
  const portfolioImages = useQuery(api.nodes.getPortfolioImages);
  console.log(portfolioImages);

  // Show loading state while data is being fetched
  if (!portfolioImages) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-l font-normal text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-row justify-center items-center bg-background relative">
      <div className="absolute inset-0 lg:hidden">
        <Image className="w-full h-full object-contain opacity-20" src={staticSettings.signature || ""} alt="Background signature" layout="fill" />
      </div>
      <div className="relative w-full h-[70%] hidden lg:block">
        <Image className="object-contain hidden lg:block" src={staticSettings.signature || ""} alt="Background signature" layout="fill" />
      </div>
      <div className="w-full h-fit flex flex-col justify-center items-start gap-0 p-4 md:p-12 relative z-10">
        <AnimatedText
          image={portfolioImages.photo || ""}
          title="PHOTOGRAPHY"
          href="/gallery/photo"
          variant="variant1"
        />
        <AnimatedText
          image={portfolioImages.video || ""}
          title="VIDEOGRAPHY"
          href="/gallery/video"
          variant="variant1"
          isVideo={true}
        />
        <AnimatedText
          image={portfolioImages.audio || ""}
          title="AUDIO"
          variant="variant1"
          href="/gallery/audio"
        />
        <AnimatedText
          image={portfolioImages.performance || ""}
          title="PERFORMANCE"
          variant="variant1"
          href="/gallery/performance"
          isVideo={true}
        />
        <AnimatedText
          image={portfolioImages.installation || ""}
          title="INSTALLATION"
          variant="variant1"
          href="/gallery/installation"
          isVideo={true}
        />
        <AnimatedText
          image={portfolioImages.drawing || ""}
          title="DRAWING"
          href="/gallery/drawing"
          variant="variant1"
        />
        <AnimatedText
          image={portfolioImages.oil || ""}
          title="OIL PAINTING"
          variant="variant1"
          href="/gallery/oil"
        />
        <AnimatedText
          image={portfolioImages.abstract || ""}
          title="ABSTRACT PAINTING"
          href="/gallery/abstract"
          variant="variant1"
        />
        <AnimatedText
          image={portfolioImages.digital || ""}
          title="DIGITAL PAINTING"
          variant="variant1"
          href="/gallery/digital"
        />
        <AnimatedText
          image={portfolioImages.sculpture || ""}
          title="SCULPTURE"
          variant="variant1"
          href="/gallery/sculpture"
        />
        <AnimatedText title="HOME" variant="variant1" href="/home" />
      </div>
    </div>
  );
}


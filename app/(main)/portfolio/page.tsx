import { convex, api } from "@/lib/convex-server";
import Image from "next/image";
import staticSettings from "@/data/settings";
import AnimatedText from "@/components/AnimatedText";

async function Page() {
  const portfolioImages = await convex.query(api.nodes.getPortfolioImages);

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
        />
        <AnimatedText
          image={portfolioImages.installation || ""}
          title="INSTALLATION"
          variant="variant1"
          href="/gallery/installation"
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

export default Page;

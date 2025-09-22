import { convex, api } from "@/lib/convex-server";
import Image from "next/image";
import staticSettings from "@/data/settings";
import AnimatedText from "@/components/AnimatedText";

async function Page() {
  const settings = await convex.query(api.settings.getSettings);
  if (!settings) return null;

  const recentNodes = await convex.query(api.nodes.getRecentNodesWithExtras);
  // Don't return null if no recent nodes, just pass empty array

  return (
    <div className="h-full flex flex-row justify-center items-center bg-background relative">
      <div className="absolute inset-0 lg:hidden">
        <Image className="w-full h-full object-contain opacity-20" src={staticSettings.signature || ""} alt="Background signature" layout="fill" />
      </div>
      <div className="relative w-full h-[70%] hidden lg:block">
        <Image className="object-contain hidden lg:block" src={staticSettings.signature || ""} alt="Background signature" layout="fill" />
      </div>
      <div className="w-full h-fit flex flex-col justify-center items-start gap-0 p-4 md:p-12 relative z-10">
        <AnimatedText title="RECENT WORKS" variant="variant1" href="/gallery/recent" nodes={recentNodes} isSetNodes />
        <AnimatedText title="PORTFOLIO" variant="variant1" href="/portfolio" />
        <AnimatedText title="STATEMENT" variant="variant1" href="/" />
        <AnimatedText title="LANGUAGE" variant="variant3" settings={settings} />
        <AnimatedText title="CONTACT" variant="variant2" settings={settings} />
      </div>
    </div>
  );
}

export default Page;

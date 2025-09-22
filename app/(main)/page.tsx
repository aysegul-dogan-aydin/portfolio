import Exit from "@/components/Exit";
import Image from "next/image";
import { convex, api } from "@/lib/convex-server";

export default async function Page() {
  const settings = await convex.query(api.settings.getSettings);
  if (!settings) return null;

  return (
    <div className="h-full flex flex-row justify-start items-center gap-2.5">
      <div className="w-full xl:w-3/5 h-full flex flex-col justify-center items-center px-1 xl:px-[20px] py-6">
        <div className="w-fit flex flex-col justify-center items-center gap-4 p-[36px]">
          <p className="w-full font-semibold text-primary text-[20px] uppercase">{settings.statement_title}</p>
          <p className="w-full font-normal text-secondary text-[18px] line-clamp-[16] text-justify">{settings.statement_description}</p>
        </div>
        <Exit text="Go To Home" overridenPath="/home" width={40} />
      </div>
      <Image className="hidden xl:block w-2/5 h-full object-contain" src={settings.statement_image_url ?? ""} alt="" width={300} height={500} />
    </div>
  );
}

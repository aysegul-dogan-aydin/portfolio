"use client";

import { ExtendedNode, Settings } from "@/types";
import AnimatedText from "./AnimatedText";
import { useState } from "react";

interface Props {
  nodes: ExtendedNode[];
  setttings: Settings;
}

function HomeMenu({ nodes, setttings }: Props) {
  const [selected, setSelected] = useState(false);

  return (
    <div className="w-full h-fit flex flex-col justify-center items-start gap-0 p-4 md:p-12 relative z-10">
      {!selected && (
        <>
          <AnimatedText title="RECENT WORKS" variant="variant1" href="/gallery/recent" nodes={nodes} />
          <AnimatedText title="PORTFOLIO" variant="variant1" nodes={nodes} handleClick={() => setSelected(true)} />
          <AnimatedText title="STATEMENT" variant="variant1" href="/" nodes={nodes} />
          <AnimatedText title="LANGUAGE" variant="variant3" settings={setttings} />
          <AnimatedText title="CONTACT" variant="variant2" settings={setttings} />
        </>
      )}
      {selected && (
        <>
          <AnimatedText
            image={
              nodes
                .filter((item) => item.type == "photo" && !item.is_video)
                .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
                .at(0)?.image_url || ""
            }
            title="PHOTOGRAHY"
            href="/gallery/photo"
            variant="variant1"
            nodes={nodes}
          />
          <AnimatedText
            image={
              nodes
                .filter((item) => item.type == "video" && !item.is_video)
                .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
                .at(0)?.image_url || ""
            }
            title="VIDEOGRAHY"
            href="/gallery/video"
            variant="variant1"
            nodes={nodes}
          />
          <AnimatedText
            image={
              nodes
                .filter((item) => item.type == "audio" && !item.is_video)
                .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
                .at(0)?.image_url || ""
            }
            title="AUDIO"
            variant="variant1"
            href="/gallery/audio"
            nodes={nodes}
          />
          <AnimatedText
            image={
              nodes
                .filter((item) => item.type == "performance" && !item.is_video)
                .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
                .at(0)?.image_url || ""
            }
            title="PERFORMANCE"
            variant="variant1"
            href="/gallery/performance"
            nodes={nodes}
          />
          <AnimatedText
            image={
              nodes
                .filter((item) => item.type == "installation" && !item.is_video)
                .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
                .at(0)?.image_url || ""
            }
            title="INSTALLATION"
            variant="variant1"
            href="/gallery/installation"
            nodes={nodes}
          />
          <AnimatedText
            image={
              nodes
                .filter((item) => item.type == "drawing" && !item.is_video)
                .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
                .at(0)?.image_url || ""
            }
            title="DRAWING"
            href="/gallery/drawing"
            variant="variant1"
            nodes={nodes}
          />
          <AnimatedText
            image={
              nodes
                .filter((item) => item.type == "oil" && !item.is_video)
                .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
                .at(0)?.image_url || ""
            }
            title="OIL PAINTING"
            variant="variant1"
            href="/gallery/oil"
            nodes={nodes}
          />
          <AnimatedText
            image={
              nodes
                .filter((item) => item.type == "abstract" && !item.is_video)
                .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
                .at(0)?.image_url || ""
            }
            title="ABSTRACT PAINTING"
            href="/gallery/abstract"
            variant="variant1"
            nodes={nodes}
          />
          <AnimatedText
            image={
              nodes
                .filter((item) => item.type == "digital" && !item.is_video)
                .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
                .at(0)?.image_url || ""
            }
            title="DIGITAL PAINTING"
            variant="variant1"
            href="/gallery/digital"
            nodes={nodes}
          />
          <AnimatedText
            image={
              nodes
                .filter((item) => item.type == "sculpture" && !item.is_video)
                .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
                .at(0)?.image_url || ""
            }
            title="SCULPTURE"
            variant="variant1"
            href="/gallery/sculpture"
            nodes={nodes}
            isSetNodes={true}
          />
          <AnimatedText title="HOME" variant="variant1" nodes={nodes} handleClick={() => setSelected(false)} />
        </>
      )}
    </div>
  );
}

export default HomeMenu;

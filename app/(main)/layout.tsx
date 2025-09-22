"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set isClient to true once the component has mounted on the client
    setIsClient(true);

    if (isClient) {
      const mediaQuery = window.matchMedia("(max-width: 768px)"); // Mobile screen width

      if (mediaQuery.matches) {
        // Navigate to /home if on mobile
        router.push("/home");
      }
    }
  }, [isClient, router]);

  return <div className="bg-background h-full pointer-events-auto touch-none select-none">{children}</div>;
}

export default Layout;

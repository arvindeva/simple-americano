"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={pathname === "/create" ? { y: "100%" } : { opacity: 0 }}
        animate={pathname === "/create" ? { y: 0 } : { opacity: 1 }}
        exit={pathname === "/create" ? { y: "-100%" } : { opacity: 0 }}
        transition={{
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1], // Smoother easing
          type: "tween",
        }}
        className="relative w-full min-h-screen"
        style={{
          backgroundColor: "var(--background)",
          ...(pathname === "/create" && {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 100,
          })
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
"use client";
import React, {useEffect, useState} from "react";

import {motion} from "framer-motion";

import {cn} from "@/lib/utils";

export default function MorphCard({
  children,
  containerClassName,
  className,
}: {
  children: React.ReactNode;
  containerClassName?: string;
  className?: string;
}) {
  const [, setMousePosition] = useState({x: 0, y: 0});
  const [isHovering, setIsHovering] = useState(false);
  const [blobPosition, setBlobPosition] = useState({x: 50, y: 50});

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    const {clientX, clientY} = event;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    setMousePosition({x, y});
    setBlobPosition(prev => ({
      x: prev.x + (x - prev.x) * 0.1,
      y: prev.y + (y - prev.y) * 0.1,
    }));
  };

  useEffect(() => {
    if (!isHovering) {
      const interval = setInterval(() => {
        setBlobPosition(prev => ({
          x: prev.x + Math.sin(Date.now() / 2000) * 2,
          y: prev.y + Math.cos(Date.now() / 2000) * 2,
        }));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isHovering]);

  return (
    <motion.section
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={cn(
        "relative mx-auto w-full overflow-hidden rounded-2xl",
        containerClassName
      )}
    >
      <div className="border-primary bg-primary relative h-full overflow-hidden rounded-2xl border">
        <div
          className="absolute inset-0 blur-xl transition-all duration-700"
          style={{
            background:
              "linear-gradient(to right, var(--background-brand) 0%, var(--text-brand-secondary) 50%, var(--background-brand-hover) 100%)",
            opacity: 0.01,
            transform: `translate(${blobPosition.x / 5 - 10}%, ${blobPosition.y / 5 - 10}%)`,
          }}
        />
        <div
          className="absolute h-full w-full transition-all duration-300"
          style={{
            background: `radial-gradient(circle at ${blobPosition.x}% ${blobPosition.y}%, var(--text-brand-secondary) 0%, var(--background-brand) 50%, transparent 80%)`,
            opacity: "var(--morph-glow-opacity)",
          }}
        />
        <div className={cn("relative z-10 h-full", className)}>{children}</div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(var(--border-primary) 1px, transparent 1px), linear-gradient(90deg, var(--border-primary) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            opacity: 0.05,
          }}
        />
      </div>
    </motion.section>
  );
}

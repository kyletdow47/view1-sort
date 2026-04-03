"use client";

import React from "react";

interface TextColorProps {
  words: string[];
  className?: string;
}

export function TextColor({ words, className = "" }: TextColorProps) {
  return (
    <h2
      className={`tracking-tighter flex select-none flex-col text-center text-5xl font-bold leading-none sm:text-6xl md:flex-row md:justify-center lg:text-[56px] ${className}`}
      style={{ fontFamily: "'Geist', system-ui, sans-serif", lineHeight: 1.1 }}
    >
      {words.map((word, i) => {
        const gradientClass = `gradient-foreground-${(i % 3) + 1}`;
        const bgClass = `gradient-background-${(i % 3) + 1}`;
        return (
          <span
            key={word}
            data-content={word}
            className={`before:animate-${bgClass} relative before:absolute before:bottom-0 before:left-0 before:top-0 before:z-0 before:w-full before:px-2 before:content-[attr(data-content)]`}
          >
            <span
              className={`from-gradient-${(i % 3) + 1}-start to-gradient-${(i % 3) + 1}-end animate-${gradientClass} bg-gradient-to-r bg-clip-text px-2 text-transparent sm:px-3`}
            >
              {word}
            </span>
          </span>
        );
      })}
    </h2>
  );
}

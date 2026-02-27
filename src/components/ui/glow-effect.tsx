"use client";
import { motion } from "motion/react";
import React from "react";

interface GlowEffectProps {
  colors?: string[];
  mode?: "rotate" | "pulse" | "breathe" | "colorShift" | "flowHorizontal" | "static";
  blur?: "softer" | "soft" | "medium" | "strong" | "stronger";
  duration?: number;
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function GlowEffect({
  colors = ["#FF5733", "#33FF57", "#3357FF", "#F1C40F"],
  mode = "rotate",
  blur = "medium",
  duration = 5,
  scale = 1,
  className = "",
  style,
}: GlowEffectProps) {
  const blurMap = {
    softer: "blur-[50px]",
    soft: "blur-[60px]",
    medium: "blur-[80px]",
    strong: "blur-[100px]",
    stronger: "blur-[120px]",
  };

  const getAnimation = () => {
    switch (mode) {
      case "rotate":
        return {
          rotate: [0, 360],
          scale: [scale, scale * 1.05, scale],
        };
      case "pulse":
        return {
          scale: [scale, scale * 1.15, scale],
          opacity: [0.6, 0.9, 0.6],
        };
      case "breathe":
        return {
          scale: [scale, scale * 1.08, scale],
          opacity: [0.5, 0.8, 0.5],
        };
      case "colorShift":
        return {
          rotate: [0, 180, 360],
          scale: [scale, scale * 1.02, scale],
        };
      case "flowHorizontal":
        return {
          x: ["-25%", "25%", "-25%"],
        };
      case "static":
      default:
        return {};
    }
  };

  const gradientStyle = `conic-gradient(from 0deg, ${colors.join(", ")})`;

  return (
    <motion.div
      className={`absolute inset-0 ${blurMap[blur]} ${className}`}
      style={{
        background: gradientStyle,
        ...style,
      }}
      animate={getAnimation()}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "linear",
        ...(mode === "pulse" || mode === "breathe"
          ? { ease: "easeInOut" }
          : {}),
      }}
    />
  );
}

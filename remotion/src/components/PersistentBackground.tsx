import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export const PersistentBackground = () => {
  const frame = useCurrentFrame();
  const hueShift = interpolate(frame, [0, 750], [0, 15]);
  const y = interpolate(frame, [0, 750], [0, -80]);

  return (
    <AbsoluteFill>
      <div
        style={{
          width: "100%",
          height: "100%",
          background: `linear-gradient(135deg, hsl(${152 + hueShift}, 45%, 12%) 0%, hsl(${160 + hueShift}, 30%, 6%) 50%, hsl(${145 + hueShift}, 40%, 8%) 100%)`,
        }}
      />
      {/* Subtle grid pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.04,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          transform: `translateY(${y}px)`,
        }}
      />
      {/* Gold accent orb */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, hsla(38, 80%, 55%, 0.12) 0%, transparent 70%)",
          top: "20%",
          right: "-5%",
          transform: `translateY(${Math.sin(frame * 0.02) * 30}px)`,
        }}
      />
      {/* Green accent orb */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, hsla(152, 45%, 30%, 0.15) 0%, transparent 70%)",
          bottom: "10%",
          left: "-5%",
          transform: `translateY(${Math.cos(frame * 0.015) * 25}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadBody } from "@remotion/google-fonts/DMSans";

const { fontFamily: displayFont } = loadFont("normal", { weights: ["700"], subsets: ["latin"] });
const { fontFamily: bodyFont } = loadBody("normal", { weights: ["400", "600"], subsets: ["latin"] });

const painPoints = [
  "Endless searching with no results",
  "Unverified listings & scam risks",
  "No protection for your deposits",
];

export const Scene2Problem = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headingSpring = spring({ frame, fps, config: { damping: 20 } });
  const headingX = interpolate(headingSpring, [0, 1], [-80, 0]);
  const headingOpacity = interpolate(headingSpring, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ justifyContent: "center", padding: "0 140px" }}>
      {/* Left side - big text */}
      <div style={{ display: "flex", gap: 100, alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: displayFont,
            fontSize: 64,
            fontWeight: 700,
            color: "hsl(40, 33%, 97%)",
            lineHeight: 1.15,
            transform: `translateX(${headingX}px)`,
            opacity: headingOpacity,
          }}>
            Finding property
            <br />
            in Nigeria is
            <br />
            <span style={{ color: "hsl(38, 80%, 55%)" }}>broken.</span>
          </div>
        </div>

        {/* Right side - pain points */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 30 }}>
          {painPoints.map((point, i) => {
            const delay = 25 + i * 20;
            const s = spring({ frame: frame - delay, fps, config: { damping: 18 } });
            const x = interpolate(s, [0, 1], [60, 0]);
            const opacity = interpolate(s, [0, 1], [0, 1]);

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  transform: `translateX(${x}px)`,
                  opacity,
                }}
              >
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "hsl(0, 70%, 55%)",
                  flexShrink: 0,
                }} />
                <div style={{
                  fontFamily: bodyFont,
                  fontSize: 26,
                  color: "hsla(40, 33%, 97%, 0.8)",
                  fontWeight: 400,
                }}>
                  {point}
                </div>
              </div>
            );
          })}

          {/* Strike-through animation */}
          {(() => {
            const strikeWidth = interpolate(frame, [90, 120], [0, 100], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div style={{
                position: "absolute",
                top: "50%",
                right: 0,
                width: `${strikeWidth}%`,
                height: 3,
                background: "linear-gradient(90deg, transparent, hsl(0, 70%, 55%), hsl(0, 70%, 55%))",
                transform: "translateY(-50%)",
                opacity: 0.5,
              }} />
            );
          })()}
        </div>
      </div>

      {/* Bottom text */}
      {(() => {
        const s = spring({ frame: frame - 100, fps, config: { damping: 20 } });
        const opacity = interpolate(s, [0, 1], [0, 1]);
        const y = interpolate(s, [0, 1], [30, 0]);
        return (
          <div style={{
            position: "absolute",
            bottom: 100,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: displayFont,
            fontSize: 42,
            fontWeight: 700,
            color: "hsl(152, 45%, 45%)",
            opacity,
            transform: `translateY(${y}px)`,
          }}>
            Until now.
          </div>
        );
      })()}
    </AbsoluteFill>
  );
};

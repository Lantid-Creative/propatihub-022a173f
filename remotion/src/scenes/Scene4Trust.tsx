import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadBody } from "@remotion/google-fonts/DMSans";

const { fontFamily: displayFont } = loadFont("normal", { weights: ["700"], subsets: ["latin"] });
const { fontFamily: bodyFont } = loadBody("normal", { weights: ["500", "700"], subsets: ["latin"] });

const stats = [
  { value: "36+", label: "States Covered" },
  { value: "24/7", label: "Dispute Resolution" },
  { value: "100%", label: "Verified Agents" },
];

export const Scene4Trust = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headSpring = spring({ frame, fps, config: { damping: 20 } });
  const headOpacity = interpolate(headSpring, [0, 1], [0, 1]);
  const headScale = interpolate(headSpring, [0, 1], [0.9, 1]);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* Large gold accent circle behind */}
      <div style={{
        position: "absolute",
        width: 700,
        height: 700,
        borderRadius: "50%",
        border: "1px solid hsla(38, 80%, 55%, 0.12)",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%) scale(${interpolate(frame, [0, 150], [0.8, 1.1], { extrapolateRight: "clamp" })})`,
      }} />
      <div style={{
        position: "absolute",
        width: 500,
        height: 500,
        borderRadius: "50%",
        border: "1px solid hsla(152, 45%, 40%, 0.1)",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%) scale(${interpolate(frame, [0, 150], [0.9, 1.15], { extrapolateRight: "clamp" })})`,
      }} />

      <div style={{ textAlign: "center", zIndex: 1 }}>
        <div style={{
          fontFamily: displayFont,
          fontSize: 60,
          fontWeight: 700,
          color: "hsl(40, 33%, 97%)",
          opacity: headOpacity,
          transform: `scale(${headScale})`,
          marginBottom: 15,
        }}>
          Built on <span style={{ color: "hsl(38, 80%, 55%)" }}>Trust</span>
        </div>

        <div style={{
          fontFamily: bodyFont,
          fontSize: 22,
          color: "hsla(40, 33%, 97%, 0.55)",
          opacity: headOpacity,
          marginBottom: 80,
          fontWeight: 500,
        }}>
          KYC verification • Escrow protection • Legal contracts
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 100, justifyContent: "center" }}>
          {stats.map((stat, i) => {
            const delay = 30 + i * 20;
            const s = spring({ frame: frame - delay, fps, config: { damping: 12 } });
            const scale = interpolate(s, [0, 1], [0.5, 1]);
            const opacity = interpolate(s, [0, 1], [0, 1]);

            return (
              <div key={i} style={{ textAlign: "center", transform: `scale(${scale})`, opacity }}>
                <div style={{
                  fontFamily: displayFont,
                  fontSize: 72,
                  fontWeight: 700,
                  color: "hsl(38, 80%, 55%)",
                  lineHeight: 1,
                  marginBottom: 10,
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontFamily: bodyFont,
                  fontSize: 18,
                  color: "hsla(40, 33%, 97%, 0.6)",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                }}>
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

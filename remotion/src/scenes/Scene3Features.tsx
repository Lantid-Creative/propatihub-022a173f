import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadBody } from "@remotion/google-fonts/DMSans";

const { fontFamily: displayFont } = loadFont("normal", { weights: ["700"], subsets: ["latin"] });
const { fontFamily: bodyFont } = loadBody("normal", { weights: ["400", "600"], subsets: ["latin"] });

const features = [
  { icon: "🏠", title: "Buy & Rent", desc: "Verified properties across all 36 states + FCT" },
  { icon: "🔒", title: "Escrow Protection", desc: "Your caution fees secured until move-in" },
  { icon: "📋", title: "Legal Contracts", desc: "AI-generated tenancy agreements" },
  { icon: "💬", title: "Direct Messaging", desc: "Chat with agents & landlords instantly" },
];

export const Scene3Features = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headSpring = spring({ frame, fps, config: { damping: 20 } });
  const headY = interpolate(headSpring, [0, 1], [-40, 0]);
  const headOpacity = interpolate(headSpring, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 120px" }}>
      {/* Heading */}
      <div style={{
        fontFamily: displayFont,
        fontSize: 56,
        fontWeight: 700,
        color: "hsl(40, 33%, 97%)",
        textAlign: "center",
        marginBottom: 70,
        transform: `translateY(${headY}px)`,
        opacity: headOpacity,
      }}>
        Everything you need,{" "}
        <span style={{ color: "hsl(38, 80%, 55%)" }}>one platform</span>
      </div>

      {/* Feature cards grid */}
      <div style={{ display: "flex", gap: 35, width: "100%" }}>
        {features.map((feat, i) => {
          const delay = 20 + i * 18;
          const s = spring({ frame: frame - delay, fps, config: { damping: 15, stiffness: 80 } });
          const scale = interpolate(s, [0, 1], [0.7, 1]);
          const opacity = interpolate(s, [0, 1], [0, 1]);
          const y = interpolate(s, [0, 1], [40, 0]);
          const float = Math.sin((frame + i * 20) * 0.03) * 4;

          return (
            <div
              key={i}
              style={{
                flex: 1,
                background: "linear-gradient(160deg, hsla(152, 45%, 22%, 0.6) 0%, hsla(160, 30%, 12%, 0.8) 100%)",
                border: "1px solid hsla(152, 45%, 40%, 0.2)",
                borderRadius: 20,
                padding: "45px 30px",
                textAlign: "center",
                transform: `scale(${scale}) translateY(${y + float}px)`,
                opacity,
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 20 }}>{feat.icon}</div>
              <div style={{
                fontFamily: displayFont,
                fontSize: 24,
                fontWeight: 700,
                color: "hsl(38, 80%, 55%)",
                marginBottom: 12,
              }}>
                {feat.title}
              </div>
              <div style={{
                fontFamily: bodyFont,
                fontSize: 17,
                color: "hsla(40, 33%, 97%, 0.65)",
                lineHeight: 1.5,
              }}>
                {feat.desc}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";
import { C, fade, slideUp } from "../lib";

const { fontFamily: heading } = loadFont();
const { fontFamily: body } = loadBody();

export const Scene9Trust = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isP = height > width;
  const titleSp = spring({ frame: frame - 5, fps, config: { damping: 15 } });

  const stats = [
    { value: "36+", label: "States Covered", icon: "🗺️" },
    { value: "24/7", label: "Dispute Resolution", icon: "⚖️" },
    { value: "100%", label: "KYC Verified Agents", icon: "🛡️" },
    { value: "0%", label: "Tolerance for Fraud", icon: "🔒" },
  ];

  const securityFeatures = [
    { title: "BVN/NIN Verification", desc: "Every agent verified with government-issued identity" },
    { title: "Escrow Protection", desc: "Caution fees held securely until all conditions are met" },
    { title: "PII-Filtered Messaging", desc: "Smart chat system blocks personal info sharing until verified" },
    { title: "Dispute Mediation", desc: "Structured filing with admin review and evidence tracking" },
  ];

  return (
    <AbsoluteFill style={{ padding: isP ? 40 : 70 }}>
      <div style={{ opacity: titleSp, transform: `translateY(${interpolate(titleSp, [0, 1], [30, 0])}px)` }}>
        <div style={{ fontFamily: heading, fontSize: isP ? 32 : 42, fontWeight: 800, color: C.gold }}>
          Built on Trust & Security
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: isP ? 12 : 20, marginTop: isP ? 25 : 35 }}>
        {stats.map((s, i) => {
          const scale = spring({ frame: frame - (30 + i * 15), fps, config: { damping: 12 } });
          return (
            <div key={i} style={{
              transform: `scale(${scale})`,
              background: C.darkCard, borderRadius: 14, padding: isP ? '16px 20px' : '20px 28px',
              flex: isP ? '1 1 45%' : 1, textAlign: 'center', border: `1px solid ${C.green}30`,
            }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontFamily: heading, fontSize: isP ? 26 : 32, fontWeight: 800, color: C.gold }}>{s.value}</div>
              <div style={{ fontFamily: body, fontSize: 11, color: C.gray, marginTop: 2 }}>{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Security features */}
      <div style={{ display: 'flex', flexDirection: isP ? 'column' : 'row', flexWrap: 'wrap', gap: isP ? 10 : 14, marginTop: isP ? 20 : 30 }}>
        {securityFeatures.map((f, i) => {
          const op = fade(frame, 120 + i * 20);
          const y = slideUp(frame, 120 + i * 20, 18, 20);
          return (
            <div key={i} style={{
              opacity: op, transform: `translateY(${y}px)`,
              flex: isP ? '1' : '1 1 45%', background: C.darkCard, borderRadius: 10,
              padding: '12px 16px', borderLeft: `3px solid ${C.green}`,
            }}>
              <div style={{ fontFamily: heading, fontSize: 13, fontWeight: 700, color: C.white }}>{f.title}</div>
              <div style={{ fontFamily: body, fontSize: 11, color: C.gray, marginTop: 3 }}>{f.desc}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

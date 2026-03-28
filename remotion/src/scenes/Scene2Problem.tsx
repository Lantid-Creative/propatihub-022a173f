import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";
import { C, fade, slideUp } from "../lib";

const { fontFamily: heading } = loadFont();
const { fontFamily: body } = loadBody();

const problems = [
  { title: "Unverified Listings", desc: "Over 60% of online listings are inaccurate or outright scams" },
  { title: "No Deposit Protection", desc: "Tenants lose billions in caution fees with zero recourse" },
  { title: "No Legal Framework", desc: "Most tenancies operate without proper contracts" },
  { title: "Fragmented Market", desc: "Property data scattered across WhatsApp and classifieds" },
  { title: "Zero Transparency", desc: "No structured dispute resolution when things go wrong" },
];

export const Scene2Problem = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isP = height > width;
  const titleSpring = spring({ frame: frame - 5, fps, config: { damping: 15 } });

  return (
    <AbsoluteFill style={{ padding: isP ? 50 : 80 }}>
      <div style={{ opacity: titleSpring, transform: `translateY(${interpolate(titleSpring, [0, 1], [30, 0])}px)` }}>
        <div style={{ fontFamily: heading, fontSize: isP ? 38 : 46, fontWeight: 800, color: C.gold }}>The Challenge</div>
        <div style={{ fontFamily: body, fontSize: isP ? 15 : 17, color: C.gray, marginTop: 8, maxWidth: 600 }}>
          Nigeria's real estate market is plagued by fraud, opacity, and broken trust.
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: isP ? 'column' : 'row', flexWrap: 'wrap', gap: isP ? 14 : 20, marginTop: isP ? 30 : 50 }}>
        {problems.map((p, i) => {
          const delay = 40 + i * 30;
          const op = fade(frame, delay, 25);
          const x = slideUp(frame, delay, 25, 30);
          return (
            <div key={i} style={{
              opacity: op, transform: `translateY(${x}px)`,
              background: C.darkCard, borderLeft: `3px solid ${C.red}`, borderRadius: 8,
              padding: isP ? '14px 18px' : '18px 24px', width: isP ? '100%' : 'calc(50% - 10px)',
            }}>
              <div style={{ fontFamily: heading, fontSize: isP ? 15 : 17, fontWeight: 700, color: C.white, marginBottom: 4 }}>{p.title}</div>
              <div style={{ fontFamily: body, fontSize: isP ? 12 : 13, color: C.gray }}>{p.desc}</div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: isP ? 30 : 60, marginTop: isP ? 20 : 40, justifyContent: isP ? 'center' : 'flex-start' }}>
        {[{ v: "₦2.5T", l: "Market Value" }, { v: "17M", l: "Housing Deficit" }, { v: "60%", l: "Fake Listings" }].map((s, i) => (
          <div key={i} style={{ opacity: fade(frame, 200 + i * 20), textAlign: 'center' }}>
            <div style={{ fontFamily: heading, fontSize: isP ? 24 : 30, fontWeight: 800, color: C.gold }}>{s.v}</div>
            <div style={{ fontFamily: body, fontSize: 11, color: C.gray }}>{s.l}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

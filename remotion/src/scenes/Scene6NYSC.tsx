import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";
import { C, fade, slideUp } from "../lib";

const { fontFamily: heading } = loadFont();
const { fontFamily: body } = loadBody();

export const Scene6NYSC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isP = height > width;

  const titleSp = spring({ frame: frame - 5, fps, config: { damping: 15 } });

  const features = [
    { icon: "📍", title: "Location-Based Search", desc: "Find housing near orientation camps, NYSC secretariats & CDS venues" },
    { icon: "💰", title: "Budget-Friendly", desc: "Curated affordable listings perfect for corps member allowees" },
    { icon: "✅", title: "Verified & Safe", desc: "All listings verified — no scams targeting new corps members" },
    { icon: "🏘️", title: "Shared Accommodation", desc: "Find compatible roommates to split costs during service year" },
  ];

  const states = ["Lagos", "Abuja", "Kano", "Rivers", "Oyo", "Enugu"];
  
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.greenDark}, ${C.green})`, padding: isP ? 40 : 70 }}>
      <div style={{ opacity: titleSp, transform: `translateY(${interpolate(titleSp, [0, 1], [30, 0])}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: C.gold, borderRadius: 10, padding: '8px 14px' }}>
            <span style={{ fontFamily: heading, fontSize: 14, fontWeight: 800, color: C.dark }}>NYSC</span>
          </div>
          <div style={{ fontFamily: heading, fontSize: isP ? 32 : 42, fontWeight: 800, color: C.white }}>
            Corps Member Housing
          </div>
        </div>
        <div style={{ fontFamily: body, fontSize: isP ? 13 : 15, color: C.goldLight, marginTop: 8 }}>
          Dedicated housing solution for National Youth Service Corps members across Nigeria
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: isP ? 'column' : 'row', gap: isP ? 16 : 24, marginTop: isP ? 25 : 40 }}>
        {features.map((f, i) => {
          const op = fade(frame, 40 + i * 25);
          const y = slideUp(frame, 40 + i * 25, 22, 25);
          return (
            <div key={i} style={{
              flex: 1, opacity: op, transform: `translateY(${y}px)`,
              background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: isP ? 16 : 20,
              backdropFilter: 'none',
            }}>
              <div style={{ fontSize: isP ? 24 : 28, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontFamily: heading, fontSize: isP ? 14 : 16, fontWeight: 700, color: C.white, marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontFamily: body, fontSize: isP ? 11 : 12, color: C.grayLight }}>{f.desc}</div>
            </div>
          );
        })}
      </div>

      {/* State badges */}
      <div style={{ marginTop: isP ? 20 : 35, opacity: fade(frame, 160) }}>
        <div style={{ fontFamily: body, fontSize: 12, color: C.goldLight, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 2 }}>Available Across All 36 States + FCT</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {states.map((s, i) => {
            const op = fade(frame, 180 + i * 10);
            return (
              <div key={i} style={{ opacity: op, background: C.gold + '25', border: `1px solid ${C.gold}50`, borderRadius: 20, padding: '5px 14px' }}>
                <span style={{ fontFamily: body, fontSize: 11, color: C.goldLight, fontWeight: 600 }}>{s}</span>
              </div>
            );
          })}
          <div style={{ opacity: fade(frame, 240), background: C.gold, borderRadius: 20, padding: '5px 14px' }}>
            <span style={{ fontFamily: body, fontSize: 11, color: C.dark, fontWeight: 700 }}>+ 30 more</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

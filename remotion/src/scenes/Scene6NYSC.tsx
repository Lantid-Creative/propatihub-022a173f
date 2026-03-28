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
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.greenDark}, ${C.green})`, padding: isP ? 60 : 70 }}>
      <div style={{ opacity: titleSp, transform: `translateY(${interpolate(titleSp, [0, 1], [30, 0])}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ background: C.gold, borderRadius: 10, padding: isP ? '10px 18px' : '8px 14px' }}>
            <span style={{ fontFamily: heading, fontSize: isP ? 22 : 14, fontWeight: 800, color: C.dark }}>NYSC</span>
          </div>
          <div style={{ fontFamily: heading, fontSize: isP ? 52 : 42, fontWeight: 800, color: C.white }}>
            Corps Member Housing
          </div>
        </div>
        <div style={{ fontFamily: body, fontSize: isP ? 24 : 15, color: C.goldLight, marginTop: 10 }}>
          Dedicated housing solution for National Youth Service Corps members across Nigeria
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: isP ? 'column' : 'row', gap: isP ? 18 : 24, marginTop: isP ? 30 : 40 }}>
        {features.map((f, i) => {
          const op = fade(frame, 40 + i * 25);
          const y = slideUp(frame, 40 + i * 25, 22, 25);
          return (
            <div key={i} style={{
              flex: 1, opacity: op, transform: `translateY(${y}px)`,
              background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: isP ? 22 : 20,
              backdropFilter: 'none',
            }}>
              <div style={{ fontSize: isP ? 36 : 28, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontFamily: heading, fontSize: isP ? 24 : 16, fontWeight: 700, color: C.white, marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontFamily: body, fontSize: isP ? 18 : 12, color: C.grayLight }}>{f.desc}</div>
            </div>
          );
        })}
      </div>

      {/* State badges */}
      <div style={{ marginTop: isP ? 30 : 35, opacity: fade(frame, 160) }}>
        <div style={{ fontFamily: body, fontSize: isP ? 18 : 12, color: C.goldLight, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 2 }}>Available Across All 36 States + FCT</div>
        <div style={{ display: 'flex', gap: isP ? 10 : 8, flexWrap: 'wrap' }}>
          {states.map((s, i) => {
            const op = fade(frame, 180 + i * 10);
            return (
              <div key={i} style={{ opacity: op, background: C.gold + '25', border: `1px solid ${C.gold}50`, borderRadius: 20, padding: isP ? '8px 18px' : '5px 14px' }}>
                <span style={{ fontFamily: body, fontSize: isP ? 18 : 11, color: C.goldLight, fontWeight: 600 }}>{s}</span>
              </div>
            );
          })}
          <div style={{ opacity: fade(frame, 240), background: C.gold, borderRadius: 20, padding: isP ? '8px 18px' : '5px 14px' }}>
            <span style={{ fontFamily: body, fontSize: isP ? 18 : 11, color: C.dark, fontWeight: 700 }}>+ 30 more</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { C, fade, slideUp } from "../lib";

const { fontFamily: heading } = loadFont();
const { fontFamily: body } = loadBody();
const { fontFamily: mono } = loadMono();

const codeLines = [
  { text: 'GET /api/v1/properties', color: C.gold },
  { text: '  ?state=Lagos', color: C.grayLight },
  { text: '  &type=apartment', color: C.grayLight },
  { text: '  &min_price=2000000', color: C.grayLight },
  { text: '', color: '' },
  { text: '// Response: 200 OK', color: C.greenLight },
  { text: '{', color: C.white },
  { text: '  "data": [', color: C.white },
  { text: '    {', color: C.white },
  { text: '      "title": "3 Bed Lekki Phase 1",', color: C.goldLight },
  { text: '      "price": 3500000,', color: C.goldLight },
  { text: '      "verified": true', color: C.greenLight },
  { text: '    }', color: C.white },
  { text: '  ],', color: C.white },
  { text: '  "count": 142', color: C.grayLight },
  { text: '}', color: C.white },
];

export const Scene8API = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isP = height > width;
  const titleSp = spring({ frame: frame - 5, fps, config: { damping: 15 } });

  const visibleLines = Math.min(Math.floor(interpolate(frame, [40, 220], [0, codeLines.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })), codeLines.length);

  const useCases = [
    { title: "Agency Integration", desc: "Populate your own platform with verified PropatiHub listings" },
    { title: "Market Data", desc: "Access pricing trends and property data by state and LGA" },
    { title: "Developer Tools", desc: "Build custom property search experiences with our REST API" },
  ];

  return (
    <AbsoluteFill style={{ padding: isP ? 60 : 70 }}>
      <div style={{ opacity: titleSp, transform: `translateY(${interpolate(titleSp, [0, 1], [30, 0])}px)` }}>
        <div style={{ fontFamily: heading, fontSize: isP ? 52 : 42, fontWeight: 800, color: C.gold }}>
          Property Data API
        </div>
        <div style={{ fontFamily: body, fontSize: isP ? 24 : 15, color: C.gray, marginTop: 8 }}>
          Programmatic access to verified property data — for agencies, agents & developers
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: isP ? 'column' : 'row', gap: isP ? 24 : 30, marginTop: isP ? 25 : 35 }}>
        {/* Code block */}
        <div style={{
          flex: isP ? 'none' : 1,
          background: '#0D1117', borderRadius: 12, padding: isP ? 22 : 20,
          border: '1px solid #30363D', opacity: fade(frame, 25),
        }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            <div style={{ width: isP ? 14 : 10, height: isP ? 14 : 10, borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: isP ? 14 : 10, height: isP ? 14 : 10, borderRadius: '50%', background: '#febc2e' }} />
            <div style={{ width: isP ? 14 : 10, height: isP ? 14 : 10, borderRadius: '50%', background: '#28c840' }} />
          </div>
          {codeLines.slice(0, visibleLines).map((line, i) => (
            <div key={i} style={{ fontFamily: mono, fontSize: isP ? 18 : 12, color: line.color || C.white, lineHeight: 1.7 }}>
              {line.text || '\u00A0'}
            </div>
          ))}
          <span style={{ fontFamily: mono, fontSize: isP ? 18 : 12, color: C.gold, opacity: Math.sin(frame * 0.15) > 0 ? 1 : 0 }}>▌</span>
        </div>

        {/* Use cases + pricing */}
        <div style={{ flex: 1 }}>
          {useCases.map((uc, i) => {
            const op = fade(frame, 100 + i * 30);
            const y = slideUp(frame, 100 + i * 30, 20, 20);
            return (
              <div key={i} style={{
                opacity: op, transform: `translateY(${y}px)`,
                background: C.darkCard, borderRadius: 10, padding: isP ? '18px 22px' : '14px 18px',
                marginBottom: isP ? 14 : 10, borderLeft: `3px solid ${C.gold}`,
              }}>
                <div style={{ fontFamily: heading, fontSize: isP ? 22 : 14, fontWeight: 700, color: C.white }}>{uc.title}</div>
                <div style={{ fontFamily: body, fontSize: isP ? 18 : 11, color: C.gray, marginTop: 4 }}>{uc.desc}</div>
              </div>
            );
          })}

          <div style={{
            opacity: fade(frame, 220),
            background: C.gold + '20', border: `1px solid ${C.gold}`, borderRadius: 10,
            padding: isP ? '18px 22px' : '14px 18px', marginTop: 18,
          }}>
            <div style={{ fontFamily: heading, fontSize: isP ? 22 : 14, fontWeight: 700, color: C.gold }}>API Pricing</div>
            <div style={{ fontFamily: body, fontSize: isP ? 18 : 12, color: C.grayLight, marginTop: 4 }}>₦10,000/month per LGA — access verified property data programmatically</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
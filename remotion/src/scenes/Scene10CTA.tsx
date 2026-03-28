import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";
import { C, fade } from "../lib";

const { fontFamily: heading } = loadFont();
const { fontFamily: body } = loadBody();

export const Scene10CTA = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isP = height > width;

  const logoScale = spring({ frame: frame - 10, fps, config: { damping: 10, stiffness: 100 } });
  const tagSp = spring({ frame: frame - 40, fps, config: { damping: 15 } });
  const urlSp = spring({ frame: frame - 60, fps, config: { damping: 12 } });
  const featureOp = fade(frame, 100);
  const float = Math.sin(frame * 0.04) * 3;

  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.dark}, ${C.greenDark})`, justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, ${C.green}20, transparent)`, top: -150, right: -100 }} />
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${C.gold}15, transparent)`, bottom: -100, left: -80 }} />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transform: `translateY(${float}px)` }}>
        <svg width={isP ? 80 : 50} height={isP ? 80 : 50} viewBox="0 0 24 24" fill={C.gold} style={{ transform: `scale(${logoScale})`, marginBottom: 20 }}>
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>

        <div style={{ fontFamily: heading, fontSize: isP ? 90 : 72, fontWeight: 800, color: C.white, letterSpacing: -3, transform: `scale(${logoScale})` }}>
          PropatiHub
        </div>

        <div style={{ fontFamily: body, fontSize: isP ? 32 : 22, color: C.goldLight, marginTop: 14, opacity: tagSp, transform: `translateY(${interpolate(tagSp, [0, 1], [20, 0])}px)` }}>
          Your Property Journey Starts Here
        </div>

        <div style={{ width: interpolate(frame, [50, 90], [0, isP ? 280 : 200], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), height: 3, background: C.gold, marginTop: 28, marginBottom: 28 }} />

        <div style={{ fontFamily: heading, fontSize: isP ? 44 : 36, fontWeight: 700, color: C.gold, opacity: urlSp, transform: `scale(${urlSp})`, letterSpacing: 2 }}>
          propatihub.com
        </div>

        <div style={{ display: 'flex', gap: isP ? 14 : 20, marginTop: 34, flexWrap: 'wrap', justifyContent: 'center', opacity: featureOp }}>
          {['Buy', 'Rent', 'Bid', 'Manage', 'Protect'].map((f, i) => (
            <div key={i} style={{
              opacity: fade(frame, 110 + i * 12),
              background: C.green + '40', border: `1px solid ${C.green}80`, borderRadius: 20,
              padding: isP ? '10px 22px' : '6px 16px',
            }}>
              <span style={{ fontFamily: body, fontSize: isP ? 20 : 12, color: C.white, fontWeight: 600 }}>{f}</span>
            </div>
          ))}
        </div>

        <div style={{ fontFamily: body, fontSize: isP ? 20 : 13, color: C.gray, marginTop: 34, opacity: fade(frame, 160) }}>
          Available on Web • Coming to iOS & Android
        </div>
      </div>
    </AbsoluteFill>
  );
};
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";
import { C, fade, slideUp } from "../lib";

const { fontFamily: heading } = loadFont();
const { fontFamily: body } = loadBody();

export const Scene1Hook = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isP = height > width;

  const iconScale = spring({ frame: frame - 15, fps, config: { damping: 12 } });
  const titleSpring = spring({ frame: frame - 30, fps, config: { damping: 15 } });
  const titleY = interpolate(titleSpring, [0, 1], [60, 0]);
  const tagOp = fade(frame, 60);
  const tagY = slideUp(frame, 60);
  const urlOp = fade(frame, 90);
  const lineW = interpolate(frame, [0, 50], [0, isP ? 300 : 350], { extrapolateRight: 'clamp' });
  const float = Math.sin(frame * 0.03) * 5;
  const gridOp = fade(frame, 20, 40);

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: isP ? 'center' : 'flex-start', padding: isP ? 60 : 80 }}>
      <div style={{ position: 'absolute', inset: 0, opacity: gridOp * 0.06, backgroundImage: 'repeating-linear-gradient(0deg, #D4942A 0 1px, transparent 1px 60px), repeating-linear-gradient(90deg, #D4942A 0 1px, transparent 1px 60px)' }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: isP ? 'center' : 'flex-start', textAlign: isP ? 'center' : 'left', marginLeft: isP ? 0 : 80 }}>
        <div style={{ width: lineW, height: 3, background: C.gold, marginBottom: 30 }} />
        <svg width={isP ? 90 : 56} height={isP ? 90 : 56} viewBox="0 0 24 24" fill={C.gold} style={{ transform: `scale(${iconScale}) translateY(${float}px)`, marginBottom: 15 }}>
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
        <div style={{ fontFamily: heading, fontSize: isP ? 96 : 82, fontWeight: 800, color: C.white, letterSpacing: -3, opacity: titleSpring, transform: `translateY(${titleY}px)` }}>
          PropatiHub
        </div>
        <div style={{ fontFamily: body, fontSize: isP ? 36 : 24, color: C.goldLight, opacity: tagOp, transform: `translateY(${tagY}px)`, marginTop: 12 }}>
          Nigeria's Trusted Property Platform
        </div>
        <div style={{ fontFamily: body, fontSize: isP ? 22 : 15, color: C.gold, opacity: urlOp, marginTop: 30, letterSpacing: 3, textTransform: 'uppercase' }}>
          propatihub.com
        </div>
      </div>
    </AbsoluteFill>
  );
};
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadBody } from "@remotion/google-fonts/DMSans";

const { fontFamily: displayFont } = loadFont("normal", { weights: ["700"], subsets: ["latin"] });
const { fontFamily: bodyFont } = loadBody("normal", { weights: ["400", "500"], subsets: ["latin"] });

export const Scene1Hook = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo mark animation
  const logoScale = spring({ frame, fps, config: { damping: 15, stiffness: 80 } });
  const logoRotate = interpolate(logoScale, [0, 1], [90, 0]);

  // Title reveal
  const titleSpring = spring({ frame: frame - 20, fps, config: { damping: 20, stiffness: 100 } });
  const titleY = interpolate(titleSpring, [0, 1], [60, 0]);
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1]);

  // Tagline
  const tagSpring = spring({ frame: frame - 45, fps, config: { damping: 25 } });
  const tagOpacity = interpolate(tagSpring, [0, 1], [0, 1]);
  const tagY = interpolate(tagSpring, [0, 1], [30, 0]);

  // Gold line
  const lineWidth = interpolate(frame, [30, 70], [0, 300], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Floating house icon shapes
  const shape1Y = Math.sin(frame * 0.04) * 12;
  const shape2Y = Math.cos(frame * 0.03) * 15;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* Decorative shapes */}
      <div style={{
        position: "absolute", top: 180, left: 200,
        width: 80, height: 80,
        border: "2px solid hsla(38, 80%, 55%, 0.25)",
        transform: `translateY(${shape1Y}px) rotate(45deg)`,
      }} />
      <div style={{
        position: "absolute", bottom: 200, right: 250,
        width: 60, height: 60,
        background: "hsla(152, 45%, 30%, 0.15)",
        borderRadius: 12,
        transform: `translateY(${shape2Y}px) rotate(12deg)`,
      }} />
      <div style={{
        position: "absolute", top: 300, right: 350,
        width: 40, height: 40,
        borderRadius: "50%",
        border: "2px solid hsla(38, 80%, 55%, 0.2)",
        transform: `translateY(${shape2Y * -1}px)`,
      }} />

      {/* Logo mark - house icon */}
      <div style={{
        transform: `scale(${logoScale}) rotate(${logoRotate}deg)`,
        marginBottom: 30,
      }}>
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
          <path d="M50 10 L90 45 L90 90 L10 90 L10 45 Z" stroke="hsl(38, 80%, 55%)" strokeWidth="3" fill="hsla(38, 80%, 55%, 0.1)" />
          <rect x="38" y="55" width="24" height="35" rx="3" stroke="hsl(38, 80%, 55%)" strokeWidth="2.5" fill="none" />
          <circle cx="50" cy="30" r="8" stroke="hsl(152, 45%, 40%)" strokeWidth="2" fill="hsla(152, 45%, 40%, 0.2)" />
        </svg>
      </div>

      {/* Title */}
      <div style={{
        fontFamily: displayFont,
        fontSize: 90,
        fontWeight: 700,
        color: "hsl(40, 33%, 97%)",
        transform: `translateY(${titleY}px)`,
        opacity: titleOpacity,
        letterSpacing: -2,
      }}>
        Propati<span style={{ color: "hsl(38, 80%, 55%)" }}>Hub</span>
      </div>

      {/* Gold line */}
      <div style={{
        width: lineWidth,
        height: 3,
        background: "linear-gradient(90deg, transparent, hsl(38, 80%, 55%), transparent)",
        marginTop: 15,
        marginBottom: 20,
        borderRadius: 2,
      }} />

      {/* Tagline */}
      <div style={{
        fontFamily: bodyFont,
        fontSize: 28,
        color: "hsla(40, 33%, 97%, 0.7)",
        transform: `translateY(${tagY}px)`,
        opacity: tagOpacity,
        fontWeight: 400,
        letterSpacing: 4,
        textTransform: "uppercase",
      }}>
        Nigeria's Trusted Property Platform
      </div>
    </AbsoluteFill>
  );
};

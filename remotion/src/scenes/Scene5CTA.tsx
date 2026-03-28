import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadBody } from "@remotion/google-fonts/DMSans";

const { fontFamily: displayFont } = loadFont("normal", { weights: ["700"], subsets: ["latin"] });
const { fontFamily: bodyFont } = loadBody("normal", { weights: ["500", "600"], subsets: ["latin"] });

export const Scene5CTA = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo entrance
  const logoSpring = spring({ frame, fps, config: { damping: 12, stiffness: 60 } });
  const logoScale = interpolate(logoSpring, [0, 1], [0.3, 1]);
  const logoOpacity = interpolate(logoSpring, [0, 1], [0, 1]);

  // URL text
  const urlSpring = spring({ frame: frame - 30, fps, config: { damping: 20 } });
  const urlY = interpolate(urlSpring, [0, 1], [40, 0]);
  const urlOpacity = interpolate(urlSpring, [0, 1], [0, 1]);

  // Tagline
  const tagSpring = spring({ frame: frame - 50, fps, config: { damping: 25 } });
  const tagOpacity = interpolate(tagSpring, [0, 1], [0, 1]);

  // Pulsing glow
  const pulseOpacity = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.15, 0.35]);

  // Bottom bar
  const barWidth = interpolate(frame, [60, 110], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* Pulsing gold glow */}
      <div style={{
        position: "absolute",
        width: 800,
        height: 800,
        borderRadius: "50%",
        background: "radial-gradient(circle, hsla(38, 80%, 55%, 0.2) 0%, transparent 60%)",
        opacity: pulseOpacity,
      }} />

      {/* Logo */}
      <div style={{
        transform: `scale(${logoScale})`,
        opacity: logoOpacity,
        marginBottom: 25,
      }}>
        <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
          <path d="M50 10 L90 45 L90 90 L10 90 L10 45 Z" stroke="hsl(38, 80%, 55%)" strokeWidth="3" fill="hsla(38, 80%, 55%, 0.15)" />
          <rect x="38" y="55" width="24" height="35" rx="3" stroke="hsl(38, 80%, 55%)" strokeWidth="2.5" fill="none" />
        </svg>
      </div>

      {/* Brand name */}
      <div style={{
        fontFamily: displayFont,
        fontSize: 80,
        fontWeight: 700,
        color: "hsl(40, 33%, 97%)",
        transform: `scale(${logoScale})`,
        opacity: logoOpacity,
        letterSpacing: -2,
      }}>
        Propati<span style={{ color: "hsl(38, 80%, 55%)" }}>Hub</span>
      </div>

      {/* Gold divider */}
      <div style={{
        width: `${barWidth}%`,
        maxWidth: 250,
        height: 2,
        background: "linear-gradient(90deg, transparent, hsl(38, 80%, 55%), transparent)",
        marginTop: 20,
        marginBottom: 25,
      }} />

      {/* URL */}
      <div style={{
        fontFamily: bodyFont,
        fontSize: 38,
        fontWeight: 600,
        color: "hsl(38, 80%, 55%)",
        transform: `translateY(${urlY}px)`,
        opacity: urlOpacity,
        letterSpacing: 1,
      }}>
        propatihub.com
      </div>

      {/* Tagline */}
      <div style={{
        fontFamily: bodyFont,
        fontSize: 22,
        color: "hsla(40, 33%, 97%, 0.55)",
        opacity: tagOpacity,
        marginTop: 18,
        fontWeight: 500,
        letterSpacing: 3,
        textTransform: "uppercase",
      }}>
        Find your home today
      </div>
    </AbsoluteFill>
  );
};

import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";
import { C, fade, slideUp } from "../lib";

const { fontFamily: heading } = loadFont();
const { fontFamily: body } = loadBody();

const roles = [
  {
    title: "For Buyers & Renters",
    color: C.green,
    icon: "🏠",
    features: ["Search verified listings by location, type & budget", "Compare properties with detailed specs & photos", "Connect directly with KYC-verified agents", "Save searches & get alerts for new listings"],
  },
  {
    title: "For Agents",
    color: C.greenLight,
    icon: "👤",
    features: ["List unlimited properties with rich media", "Manage inquiries & track lead pipeline", "Performance analytics & listing insights", "Get verified badge with KYC completion"],
  },
  {
    title: "For Agencies",
    color: '#2D8B5F',
    icon: "🏢",
    features: ["Manage your team of agents in one dashboard", "Agency-wide analytics & performance tracking", "Centralized billing & subscription management", "Brand your agency profile & showcase listings"],
  },
  {
    title: "For Home Owners",
    color: C.gold,
    icon: "🔑",
    features: ["List properties for sale or rent", "Invite & manage tenants digitally", "Collect rent & track payment history", "Generate legal contracts with AI"],
  },
];

export const Scene4Roles = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isP = height > width;

  // Each role gets 150 frames
  const sectionDur = 150;
  const currentSection = Math.min(Math.floor(frame / sectionDur), 3);
  const sectionFrame = frame - currentSection * sectionDur;

  // Progress dots
  const dotOp = fade(frame, 10);

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.cream}, #F0EDE6)`, padding: isP ? 40 : 70 }}>
      {/* Section indicator dots */}
      <div style={{ position: 'absolute', top: isP ? 30 : 25, right: isP ? 30 : 70, display: 'flex', gap: 8, opacity: dotOp }}>
        {roles.map((_, i) => (
          <div key={i} style={{
            width: i === currentSection ? 24 : 8, height: 8, borderRadius: 4,
            background: i === currentSection ? C.green : C.grayLight,
            transition: 'none',
          }} />
        ))}
      </div>

      {roles.map((role, ri) => {
        if (ri !== currentSection) return null;
        const titleSp = spring({ frame: sectionFrame - 5, fps, config: { damping: 15 } });

        return (
          <div key={ri} style={{ opacity: titleSp }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: isP ? 15 : 20 }}>
              <div style={{ width: isP ? 44 : 52, height: isP ? 44 : 52, borderRadius: 12, background: role.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isP ? 22 : 26 }}>
                {role.icon}
              </div>
              <div style={{ fontFamily: heading, fontSize: isP ? 30 : 40, fontWeight: 800, color: C.greenDark, transform: `translateY(${interpolate(titleSp, [0, 1], [20, 0])}px)` }}>
                {role.title}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: isP ? 12 : 16, marginLeft: isP ? 0 : 64 }}>
              {role.features.map((feat, fi) => {
                const fOp = fade(sectionFrame, 20 + fi * 18);
                const fY = slideUp(sectionFrame, 20 + fi * 18, 18, 25);
                return (
                  <div key={fi} style={{
                    opacity: fOp, transform: `translateY(${fY}px)`,
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: C.white, borderRadius: 10, padding: isP ? '14px 18px' : '18px 24px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderLeft: `3px solid ${role.color}`,
                  }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: role.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: C.white, fontFamily: heading, fontSize: 13, fontWeight: 700 }}>{fi + 1}</span>
                    </div>
                    <span style={{ fontFamily: body, fontSize: isP ? 13 : 15, color: '#444' }}>{feat}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export const PersistentBackground = () => {
  const frame = useCurrentFrame();
  const hue = interpolate(frame, [0, 3675], [152, 165]);
  const orbX = Math.sin(frame * 0.008) * 200;
  const orbY = Math.cos(frame * 0.006) * 150;
  const orb2X = Math.cos(frame * 0.01) * 250;
  const orb2Y = Math.sin(frame * 0.007) * 180;

  return (
    <AbsoluteFill style={{ background: `hsl(${hue}, 45%, 8%)` }}>
      <div style={{
        position: 'absolute', width: 600, height: 600, borderRadius: '50%',
        background: `radial-gradient(circle, hsla(${hue}, 40%, 18%, 0.4), transparent)`,
        top: `calc(30% + ${orbY}px)`, left: `calc(60% + ${orbX}px)`,
        transform: 'translate(-50%, -50%)',
      }} />
      <div style={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: `radial-gradient(circle, hsla(38, 60%, 40%, 0.15), transparent)`,
        top: `calc(70% + ${orb2Y}px)`, left: `calc(20% + ${orb2X}px)`,
        transform: 'translate(-50%, -50%)',
      }} />
    </AbsoluteFill>
  );
};

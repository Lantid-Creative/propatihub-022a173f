import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";
import { C, fade, slideUp } from "../lib";

const { fontFamily: heading } = loadFont();
const { fontFamily: body } = loadBody();

const BrowserMockup = ({ frame, fps, isP }: { frame: number; fps: number; isP: boolean }) => {
  const scale = spring({ frame: frame - 40, fps, config: { damping: 18 } });
  const w = isP ? 380 : 700;
  const h = isP ? 500 : 380;

  const cards = [
    { title: "3 Bed Apartment, Lekki", price: "₦3.5M/yr", beds: "3", type: "Apartment" },
    { title: "4 Bed Duplex, Ikoyi", price: "₦85M", beds: "4", type: "House" },
    { title: "2 Bed Flat, Abuja", price: "₦2.2M/yr", beds: "2", type: "Apartment" },
  ];

  return (
    <div style={{ transform: `scale(${scale})`, width: w, borderRadius: 12, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', background: C.cream }}>
      {/* Browser chrome */}
      <div style={{ background: '#2A3A30', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
        <div style={{ flex: 1, background: '#1A2E22', borderRadius: 4, padding: '4px 10px', marginLeft: 10 }}>
          <span style={{ fontFamily: body, fontSize: 10, color: C.gray }}>propatihub.com</span>
        </div>
      </div>
      
      {/* Navbar */}
      <div style={{ background: C.green, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: heading, fontSize: 14, fontWeight: 700, color: C.white }}>PropatiHub</span>
        <div style={{ display: 'flex', gap: 12 }}>
          {['Buy', 'Rent', 'Bid', 'NYSC'].map(t => (
            <span key={t} style={{ fontFamily: body, fontSize: 10, color: C.goldLight }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Search bar */}
      <div style={{ padding: '12px 16px', background: '#E8EDED' }}>
        <div style={{ background: C.white, borderRadius: 6, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: C.gray }}>🔍</span>
          <span style={{ fontFamily: body, fontSize: 11, color: C.gray }}>Search by location, type, budget...</span>
        </div>
      </div>

      {/* Property cards */}
      <div style={{ padding: isP ? 12 : 16, display: 'flex', flexDirection: isP ? 'column' : 'row', gap: 10 }}>
        {cards.map((c, i) => {
          const cardOp = fade(frame, 100 + i * 25);
          const cardY = slideUp(frame, 100 + i * 25, 20, 20);
          return (
            <div key={i} style={{ flex: 1, background: C.white, borderRadius: 6, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', opacity: cardOp, transform: `translateY(${cardY}px)` }}>
              <div style={{ height: isP ? 60 : 70, background: `hsl(${152 + i * 20}, 30%, ${30 + i * 10}%)` }} />
              <div style={{ padding: 8 }}>
                <div style={{ fontFamily: heading, fontSize: 9, fontWeight: 600, color: '#333' }}>{c.title}</div>
                <div style={{ fontFamily: body, fontSize: 11, fontWeight: 700, color: C.green, marginTop: 2 }}>{c.price}</div>
                <div style={{ fontFamily: body, fontSize: 8, color: C.gray, marginTop: 2 }}>{c.beds} Beds • {c.type}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Scene3Platform = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isP = height > width;
  const titleSpring = spring({ frame: frame - 5, fps, config: { damping: 15 } });

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.cream}, #E8EDED)`, padding: isP ? 40 : 60, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ opacity: titleSpring, transform: `translateY(${interpolate(titleSpring, [0, 1], [30, 0])}px)`, textAlign: 'center' }}>
        <div style={{ fontFamily: heading, fontSize: isP ? 34 : 42, fontWeight: 800, color: C.green }}>Meet PropatiHub</div>
        <div style={{ fontFamily: body, fontSize: isP ? 14 : 16, color: '#666', marginTop: 6 }}>
          End-to-end property platform built to restore trust in Nigerian real estate
        </div>
      </div>
      <div style={{ marginTop: isP ? 20 : 30, display: 'flex', justifyContent: 'center' }}>
        <BrowserMockup frame={frame} fps={fps} isP={isP} />
      </div>

      {/* Feature pills */}
      <div style={{ display: 'flex', gap: 10, marginTop: isP ? 15 : 25, flexWrap: 'wrap', justifyContent: 'center' }}>
        {['Verified Listings', 'Escrow Protection', 'AI Contracts', 'Live Bidding', 'NYSC Housing'].map((f, i) => {
          const op = fade(frame, 200 + i * 15);
          return (
            <div key={i} style={{ opacity: op, background: C.green, borderRadius: 20, padding: '6px 14px' }}>
              <span style={{ fontFamily: body, fontSize: 11, color: C.white, fontWeight: 600 }}>{f}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";
import { C, fade, slideUp } from "../lib";

const { fontFamily: heading } = loadFont();
const { fontFamily: body } = loadBody();

export const Scene5Bidding = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isP = height > width;

  const titleSp = spring({ frame: frame - 5, fps, config: { damping: 15 } });

  // Animated bid amount
  const bidBase = 45000000;
  const bidIncrease = interpolate(frame, [80, 280], [0, 12000000], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const currentBid = Math.round((bidBase + bidIncrease) / 100000) * 100000;
  const bidStr = `₦${(currentBid / 1000000).toFixed(1)}M`;

  // Timer
  const timerSecs = Math.max(0, Math.floor(interpolate(frame, [80, 380], [3600, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })));
  const timerMin = Math.floor(timerSecs / 60);
  const timerSec = timerSecs % 60;

  // Bid count
  const bidCount = Math.min(Math.floor(interpolate(frame, [60, 300], [0, 23], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })), 23);

  const tiers = [
    { name: "Free", bids: "2 active bids", price: "₦0" },
    { name: "Basic", bids: "10 active bids", price: "₦5,000/mo" },
    { name: "Pro", bids: "Unlimited bids", price: "₦15,000/mo" },
    { name: "Enterprise", bids: "Early access", price: "₦50,000/mo" },
  ];

  return (
    <AbsoluteFill style={{ padding: isP ? 40 : 70 }}>
      <div style={{ opacity: titleSp, transform: `translateY(${interpolate(titleSp, [0, 1], [30, 0])}px)` }}>
        <div style={{ fontFamily: heading, fontSize: isP ? 34 : 44, fontWeight: 800, color: C.gold }}>
          Transparent Property Bidding
        </div>
        <div style={{ fontFamily: body, fontSize: isP ? 13 : 15, color: C.gray, marginTop: 6 }}>
          Copart-style auction system for Nigerian real estate — fair, transparent, protected
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: isP ? 'column' : 'row', gap: isP ? 20 : 40, marginTop: isP ? 25 : 40 }}>
        {/* Auction card */}
        <div style={{
          opacity: fade(frame, 50), transform: `translateY(${slideUp(frame, 50)}px)`,
          background: C.darkCard, borderRadius: 16, padding: isP ? 20 : 28, flex: 1,
          border: `1px solid ${C.green}40`,
        }}>
          {/* Property image placeholder */}
          <div style={{ height: isP ? 100 : 120, borderRadius: 10, background: `linear-gradient(135deg, ${C.greenDark}, ${C.green})`, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: heading, fontSize: 18, color: C.goldLight }}>4 Bed Duplex — Victoria Island</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: body, fontSize: 11, color: C.gray, textTransform: 'uppercase', letterSpacing: 1 }}>Current Bid</div>
              <div style={{ fontFamily: heading, fontSize: isP ? 28 : 34, fontWeight: 800, color: C.gold }}>{bidStr}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: body, fontSize: 11, color: C.gray, textTransform: 'uppercase', letterSpacing: 1 }}>Time Left</div>
              <div style={{ fontFamily: heading, fontSize: isP ? 22 : 28, fontWeight: 700, color: timerSecs < 600 ? C.red : C.white }}>
                {timerMin}:{String(timerSec).padStart(2, '0')}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <div style={{ background: C.green, borderRadius: 8, padding: '6px 12px' }}>
              <span style={{ fontFamily: body, fontSize: 11, color: C.white }}>{bidCount} Bids</span>
            </div>
            <div style={{ background: C.gold + '30', border: `1px solid ${C.gold}`, borderRadius: 8, padding: '6px 12px' }}>
              <span style={{ fontFamily: body, fontSize: 11, color: C.gold }}>5% Deposit Protected</span>
            </div>
          </div>
        </div>

        {/* Tiers */}
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: heading, fontSize: isP ? 16 : 18, fontWeight: 700, color: C.white, marginBottom: 12, opacity: fade(frame, 180) }}>
            Subscription Tiers
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tiers.map((t, i) => {
              const op = fade(frame, 200 + i * 20);
              const y = slideUp(frame, 200 + i * 20, 18, 20);
              return (
                <div key={i} style={{
                  opacity: op, transform: `translateY(${y}px)`,
                  background: C.darkCard, borderRadius: 10, padding: '12px 16px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  border: i === 2 ? `1px solid ${C.gold}` : `1px solid ${C.green}30`,
                }}>
                  <div>
                    <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 700, color: i === 2 ? C.gold : C.white }}>{t.name}</div>
                    <div style={{ fontFamily: body, fontSize: 11, color: C.gray }}>{t.bids}</div>
                  </div>
                  <div style={{ fontFamily: heading, fontSize: 13, fontWeight: 700, color: C.goldLight }}>{t.price}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

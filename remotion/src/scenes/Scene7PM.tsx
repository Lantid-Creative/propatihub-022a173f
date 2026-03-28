import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";
import { C, fade, slideUp } from "../lib";

const { fontFamily: heading } = loadFont();
const { fontFamily: body } = loadBody();

export const Scene7PM = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isP = height > width;

  const titleSp = spring({ frame: frame - 5, fps, config: { damping: 15 } });

  const phase = frame < 240 ? 0 : 1;
  const phaseFrame = phase === 0 ? frame : frame - 240;

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.cream}, #E8E3DA)`, padding: isP ? 60 : 70 }}>
      <div style={{ opacity: titleSp, transform: `translateY(${interpolate(titleSp, [0, 1], [30, 0])}px)`, marginBottom: isP ? 20 : 25 }}>
        <div style={{ fontFamily: heading, fontSize: isP ? 52 : 42, fontWeight: 800, color: C.green }}>
          {phase === 0 ? 'Property Management Suite' : 'Escrow & Legal Protection'}
        </div>
        <div style={{ fontFamily: body, fontSize: isP ? 22 : 15, color: '#666', marginTop: 8 }}>
          {phase === 0 ? 'Everything landlords need to manage properties and tenants digitally' : 'Built-in financial protection and AI-powered legal contracts'}
        </div>
      </div>

      {phase === 0 ? (
        <div style={{ display: 'flex', flexDirection: isP ? 'column' : 'row', gap: isP ? 16 : 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: isP ? 12 : 10, flex: 1 }}>
            {[
              { label: 'Active Tenancies', value: '12', icon: '👥', color: C.green },
              { label: 'Monthly Revenue', value: '₦8.2M', icon: '💰', color: C.gold },
              { label: 'Maintenance Requests', value: '3 Open', icon: '🔧', color: '#E67E22' },
              { label: 'Disputes', value: '0 Active', icon: '⚖️', color: C.greenLight },
            ].map((card, i) => {
              const op = fade(phaseFrame, 20 + i * 20);
              const x = slideUp(phaseFrame, 20 + i * 20, 18, 20);
              return (
                <div key={i} style={{
                  opacity: op, transform: `translateY(${x}px)`,
                  background: C.white, borderRadius: 10, padding: isP ? '18px 22px' : '14px 18px',
                  display: 'flex', alignItems: 'center', gap: 14,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderLeft: `3px solid ${card.color}`,
                }}>
                  <span style={{ fontSize: isP ? 30 : 22 }}>{card.icon}</span>
                  <div>
                    <div style={{ fontFamily: body, fontSize: isP ? 18 : 11, color: '#888' }}>{card.label}</div>
                    <div style={{ fontFamily: heading, fontSize: isP ? 28 : 18, fontWeight: 700, color: C.greenDark }}>{card.value}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ flex: 1 }}>
            {[
              'Invite tenants via email to create digital records',
              'Track 40+ data fields per tenant profile',
              'Automated rent payment tracking & reminders',
              'Maintenance request filing & status tracking',
              '24/7 dispute management with resolution dashboard',
            ].map((feat, i) => {
              const op = fade(phaseFrame, 60 + i * 18);
              return (
                <div key={i} style={{ opacity: op, display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: isP ? 16 : 12 }}>
                  <div style={{ width: isP ? 26 : 20, height: isP ? 26 : 20, borderRadius: '50%', background: C.green, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                    <span style={{ color: C.white, fontSize: isP ? 14 : 11 }}>✓</span>
                  </div>
                  <span style={{ fontFamily: body, fontSize: isP ? 22 : 14, color: '#444' }}>{feat}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: isP ? 'column' : 'row', gap: isP ? 24 : 30 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: heading, fontSize: isP ? 28 : 18, fontWeight: 700, color: C.greenDark, marginBottom: 20, opacity: fade(phaseFrame, 10) }}>
              Escrow Protection Flow
            </div>
            {[
              { step: '1', label: 'Tenant Pays Caution Fee', desc: 'Payment captured via Paystack' },
              { step: '2', label: 'Held in Escrow', desc: 'Funds secured until move-in verification' },
              { step: '3', label: 'Conditions Verified', desc: 'Both parties confirm satisfactory handover' },
              { step: '4', label: 'Auto-Release', desc: 'Funds released to landlord after verification period' },
            ].map((s, i) => {
              const op = fade(phaseFrame, 20 + i * 22);
              const y = slideUp(phaseFrame, 20 + i * 22, 18, 20);
              return (
                <div key={i} style={{ opacity: op, transform: `translateY(${y}px)`, display: 'flex', gap: 14, marginBottom: isP ? 18 : 14 }}>
                  <div style={{ width: isP ? 40 : 32, height: isP ? 40 : 32, borderRadius: '50%', background: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: heading, fontSize: isP ? 20 : 14, fontWeight: 800, color: C.dark }}>{s.step}</span>
                  </div>
                  <div>
                    <div style={{ fontFamily: heading, fontSize: isP ? 22 : 14, fontWeight: 700, color: C.greenDark }}>{s.label}</div>
                    <div style={{ fontFamily: body, fontSize: isP ? 18 : 11, color: '#888' }}>{s.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: heading, fontSize: isP ? 28 : 18, fontWeight: 700, color: C.greenDark, marginBottom: 20, opacity: fade(phaseFrame, 80) }}>
              AI-Powered Legal Contracts
            </div>
            <div style={{
              opacity: fade(phaseFrame, 100),
              background: C.white, borderRadius: 12, padding: isP ? 24 : 20,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: `1px solid ${C.grayLight}`,
            }}>
              <div style={{ fontFamily: heading, fontSize: isP ? 22 : 14, fontWeight: 700, color: C.green, marginBottom: 12 }}>
                📄 Tenancy Agreement
              </div>
              <div style={{ fontFamily: body, fontSize: isP ? 18 : 11, color: '#666', lineHeight: 1.6 }}>
                AI generates professional Nigerian Tenancy Agreements including rent terms, maintenance obligations, dispute clauses, and termination conditions.
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                {['Generate', 'Review', 'Sign', 'Share'].map((a, i) => (
                  <div key={i} style={{ opacity: fade(phaseFrame, 130 + i * 15), background: i === 0 ? C.green : C.grayLight, borderRadius: 6, padding: isP ? '8px 14px' : '5px 10px' }}>
                    <span style={{ fontFamily: body, fontSize: isP ? 16 : 10, color: i === 0 ? C.white : '#555', fontWeight: 600 }}>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
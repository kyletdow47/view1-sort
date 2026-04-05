/**
 * View1 Sort — Social Post Template System
 *
 * 6 template types matching the dark editorial aesthetic from V1 test.pen:
 *   1. Big Statement   — full-bleed headline, single bold claim
 *   2. Stat Card       — large number + context copy
 *   3. Hot Take        — opinion / quotation format
 *   4. Before / After  — two-panel workflow comparison
 *   5. Build Log       — "just shipped" founder update
 *   6. Feature Card    — product feature reveal
 *
 * Usage:
 *   • Select a template type from the sidebar
 *   • Edit the copy fields on the right
 *   • Screenshot the 1080×1080 canvas to export
 *
 * Stack: React + Tailwind (inline styles where Tailwind can't reach exact values)
 */

import { useState } from "react";

// ─── Brand tokens ────────────────────────────────────────────────────────────
const BRAND = {
  bg: "#030305",
  bgCard: "#0e0e12",
  accent: "#A78BFA",    // purple — section labels
  green: "#34D399",     // positive
  white: "#FFFFFF",
  dim: "rgba(255,255,255,0.55)",
  dimmer: "rgba(255,255,255,0.3)",
  border: "rgba(255,255,255,0.08)",
  gradientBorder: "linear-gradient(135deg, #F59E0BA0, #3B82F690, #A855F790, #EC489990)",
};

const MESH = `radial-gradient(ellipse at 20% 50%, rgba(167,139,250,0.15) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.12) 0%, transparent 50%),
              radial-gradient(ellipse at 60% 80%, rgba(236,72,153,0.10) 0%, transparent 50%)`;

// ─── Template definitions ─────────────────────────────────────────────────────
const TEMPLATES = {
  statement: {
    label: "Big Statement",
    emoji: "💬",
    defaults: {
      eyebrow: "",
      headline: "You shoot the photos.\nWe'll handle the rest.",
      sub: "",
    },
  },
  stat: {
    label: "Stat Card",
    emoji: "📊",
    defaults: {
      eyebrow: "THE REALITY",
      stat: "6–12 hrs",
      headline: "spent sorting after a single shoot",
      sub: "Time that doesn't bill. We fixed that.",
    },
  },
  take: {
    label: "Hot Take",
    emoji: "🔥",
    defaults: {
      eyebrow: "UNPOPULAR OPINION",
      headline: "Most AI photo tools are built by engineers who don't shoot.",
      sub: "We built this one differently.",
    },
  },
  beforeafter: {
    label: "Before / After",
    emoji: "↔️",
    defaults: {
      eyebrow: "THE WORKFLOW SHIFT",
      before: "Edit in Lightroom → export → upload to Drive → send SwissTransfer link → chase invoice → repeat",
      after: "Upload → AI sorts → one gallery link → invoice handled. Done.",
    },
  },
  buildlog: {
    label: "Build Log",
    emoji: "🛠️",
    defaults: {
      eyebrow: "JUST SHIPPED",
      feature: "AI Sorting by Prompt",
      headline: "Describe your shoot. The AI builds the sort from your words.",
      sub: "No sliders. No menus. Just talk to it.",
      date: "April 2026",
    },
  },
  feature: {
    label: "Feature Card",
    emoji: "✨",
    defaults: {
      eyebrow: "VIEW1 SORT",
      headline: "Tell the AI how you see.\nIt learns.",
      bullets: [
        "Zero manual tagging",
        "Sorts by story & emotion, not just pixels",
        "Runs in browser — photos never leave",
        "Presets built from conversations",
      ],
      cta: "view1sort.com",
    },
  },
};

// ─── Canvas components ────────────────────────────────────────────────────────

function CanvasShell({ children, size = 1080 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: BRAND.bg,
        backgroundImage: MESH,
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Geist', 'Inter', system-ui, sans-serif",
        flexShrink: 0,
      }}
    >
      {/* Gradient border */}
      <div style={{
        position: "absolute", inset: 0,
        border: "2px solid transparent",
        borderRadius: 0,
        background: `${BRAND.bg} padding-box, ${BRAND.gradientBorder} border-box`,
        pointerEvents: "none", zIndex: 10,
      }} />
      {children}
      {/* Wordmark */}
      <div style={{
        position: "absolute", bottom: 40, left: 48,
        color: BRAND.dimmer,
        fontSize: 18, fontWeight: 600, letterSpacing: 0.5,
        fontFamily: "'Geist', system-ui, sans-serif",
      }}>
        View1 Sort
      </div>
      {/* URL */}
      <div style={{
        position: "absolute", bottom: 40, right: 48,
        color: BRAND.dimmer, fontSize: 15,
      }}>
        view1sort.com
      </div>
    </div>
  );
}

function Eyebrow({ text, color = BRAND.accent }) {
  if (!text) return null;
  return (
    <div style={{
      color, fontSize: 13, fontWeight: 600,
      letterSpacing: 2.5, textTransform: "uppercase",
      fontFamily: "'Inter', system-ui, sans-serif",
      marginBottom: 20,
    }}>
      {text}
    </div>
  );
}

// Template 1 — Big Statement
function StatementTemplate({ data }) {
  const lines = data.headline.split("\n");
  return (
    <CanvasShell>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "80px 64px",
        textAlign: "center",
      }}>
        {data.eyebrow && <Eyebrow text={data.eyebrow} />}
        <div style={{
          color: BRAND.white,
          fontSize: lines.join("").length > 30 ? 80 : 96,
          fontWeight: 700,
          lineHeight: 1.05,
          letterSpacing: -2,
          fontFamily: "'Geist', system-ui, sans-serif",
        }}>
          {lines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
        {data.sub && (
          <div style={{
            marginTop: 32, color: BRAND.dim,
            fontSize: 22, lineHeight: 1.6,
            fontFamily: "'Inter', system-ui, sans-serif",
            maxWidth: 560,
          }}>
            {data.sub}
          </div>
        )}
      </div>
    </CanvasShell>
  );
}

// Template 2 — Stat Card
function StatTemplate({ data }) {
  return (
    <CanvasShell>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "80px 72px",
      }}>
        <Eyebrow text={data.eyebrow} />
        <div style={{
          color: BRAND.white,
          fontSize: 112, fontWeight: 700,
          lineHeight: 1, letterSpacing: -4,
          fontFamily: "'Geist', system-ui, sans-serif",
        }}>
          {data.stat}
        </div>
        <div style={{
          marginTop: 24, color: BRAND.dim,
          fontSize: 28, lineHeight: 1.4,
          fontFamily: "'Inter', system-ui, sans-serif",
          maxWidth: 560,
        }}>
          {data.headline}
        </div>
        {data.sub && (
          <>
            <div style={{
              width: 64, height: 2,
              background: BRAND.accent,
              margin: "40px 0",
            }} />
            <div style={{
              color: BRAND.dimmer, fontSize: 20,
              fontFamily: "'Inter', system-ui, sans-serif",
            }}>
              {data.sub}
            </div>
          </>
        )}
      </div>
    </CanvasShell>
  );
}

// Template 3 — Hot Take
function TakeTemplate({ data }) {
  return (
    <CanvasShell>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "80px 72px",
      }}>
        <Eyebrow text={data.eyebrow} />
        {/* Giant quote mark */}
        <div style={{
          color: BRAND.accent, fontSize: 140, lineHeight: 0.8,
          fontFamily: "Georgia, serif", marginBottom: 24,
          opacity: 0.6,
        }}>
          "
        </div>
        <div style={{
          color: BRAND.white,
          fontSize: data.headline.length > 60 ? 42 : 52,
          fontWeight: 700, lineHeight: 1.15,
          letterSpacing: -1,
          fontFamily: "'Geist', system-ui, sans-serif",
          maxWidth: 820,
        }}>
          {data.headline}
        </div>
        {data.sub && (
          <div style={{
            marginTop: 36, color: BRAND.accent,
            fontSize: 18, fontWeight: 500,
            fontFamily: "'Inter', system-ui, sans-serif",
          }}>
            — {data.sub}
          </div>
        )}
      </div>
    </CanvasShell>
  );
}

// Template 4 — Before / After
function BeforeAfterTemplate({ data }) {
  return (
    <CanvasShell>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        padding: "72px 64px",
      }}>
        <Eyebrow text={data.eyebrow} />
        <div style={{ display: "flex", gap: 24, flex: 1 }}>
          {/* Before */}
          <div style={{
            flex: 1, background: "rgba(239,68,68,0.06)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 12, padding: 40,
            display: "flex", flexDirection: "column",
          }}>
            <div style={{
              color: "#EF4444", fontSize: 11, fontWeight: 600,
              letterSpacing: 2, textTransform: "uppercase",
              fontFamily: "'Inter', system-ui, sans-serif",
              marginBottom: 20,
            }}>
              BEFORE
            </div>
            <div style={{
              color: BRAND.dim, fontSize: 22, lineHeight: 1.7,
              fontFamily: "'Inter', system-ui, sans-serif",
            }}>
              {data.before}
            </div>
          </div>
          {/* After */}
          <div style={{
            flex: 1, background: "rgba(52,211,153,0.06)",
            border: "1px solid rgba(52,211,153,0.2)",
            borderRadius: 12, padding: 40,
            display: "flex", flexDirection: "column",
          }}>
            <div style={{
              color: BRAND.green, fontSize: 11, fontWeight: 600,
              letterSpacing: 2, textTransform: "uppercase",
              fontFamily: "'Inter', system-ui, sans-serif",
              marginBottom: 20,
            }}>
              VIEW1 SORT
            </div>
            <div style={{
              color: BRAND.white, fontSize: 22, lineHeight: 1.7,
              fontFamily: "'Inter', system-ui, sans-serif",
            }}>
              {data.after}
            </div>
          </div>
        </div>
      </div>
    </CanvasShell>
  );
}

// Template 5 — Build Log
function BuildLogTemplate({ data }) {
  return (
    <CanvasShell>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "80px 72px",
      }}>
        <Eyebrow text={data.eyebrow} />
        {/* Feature name — massive */}
        <div style={{
          color: BRAND.accent,
          fontSize: data.feature.length > 20 ? 56 : 72,
          fontWeight: 700, lineHeight: 1.05,
          letterSpacing: -2,
          fontFamily: "'Geist', system-ui, sans-serif",
          marginBottom: 32,
        }}>
          {data.feature}
        </div>
        <div style={{
          width: 48, height: 2,
          background: `linear-gradient(90deg, ${BRAND.accent}, transparent)`,
          marginBottom: 32,
        }} />
        <div style={{
          color: BRAND.white,
          fontSize: 30, fontWeight: 600, lineHeight: 1.3,
          fontFamily: "'Geist', system-ui, sans-serif",
          marginBottom: 16,
        }}>
          {data.headline}
        </div>
        <div style={{
          color: BRAND.dim, fontSize: 20, lineHeight: 1.6,
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          {data.sub}
        </div>
        <div style={{
          position: "absolute", top: 72, right: 72,
          color: BRAND.dimmer, fontSize: 14,
          fontFamily: "'Geist Mono', monospace",
        }}>
          {data.date}
        </div>
      </div>
    </CanvasShell>
  );
}

// Template 6 — Feature Card
function FeatureTemplate({ data }) {
  return (
    <CanvasShell>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "80px 72px",
      }}>
        <Eyebrow text={data.eyebrow} color={BRAND.green} />
        <div style={{
          color: BRAND.white,
          fontSize: data.headline.includes("\n") ? 60 : 68,
          fontWeight: 700, lineHeight: 1.1,
          letterSpacing: -2,
          fontFamily: "'Geist', system-ui, sans-serif",
          marginBottom: 48,
        }}>
          {data.headline.split("\n").map((l, i) => <div key={i}>{l}</div>)}
        </div>
        {/* Bullet list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {data.bullets.map((b, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: BRAND.accent, flexShrink: 0,
              }} />
              <div style={{
                color: BRAND.dim, fontSize: 20,
                fontFamily: "'Inter', system-ui, sans-serif",
              }}>
                {b}
              </div>
            </div>
          ))}
        </div>
      </div>
    </CanvasShell>
  );
}

// ─── Template renderer ────────────────────────────────────────────────────────
function renderTemplate(type, data) {
  switch (type) {
    case "statement":   return <StatementTemplate data={data} />;
    case "stat":        return <StatTemplate data={data} />;
    case "take":        return <TakeTemplate data={data} />;
    case "beforeafter": return <BeforeAfterTemplate data={data} />;
    case "buildlog":    return <BuildLogTemplate data={data} />;
    case "feature":     return <FeatureTemplate data={data} />;
    default:            return null;
  }
}

// ─── Editor panel ─────────────────────────────────────────────────────────────
function Field({ label, value, onChange, multiline = false, rows = 3 }) {
  const shared = {
    width: "100%", background: "#0e0e12",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8, color: "#fff",
    padding: "10px 14px", fontSize: 14,
    fontFamily: "'Inter', system-ui, sans-serif",
    outline: "none", boxSizing: "border-box",
    resize: multiline ? "vertical" : "none",
  };
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>
        {label}
      </div>
      {multiline
        ? <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)} style={shared} />
        : <input value={value} onChange={e => onChange(e.target.value)} style={shared} />
      }
    </div>
  );
}

function EditorPanel({ type, data, onChange }) {
  const set = (key) => (val) => onChange({ ...data, [key]: val });
  const setBullet = (i, val) => {
    const next = [...data.bullets];
    next[i] = val;
    onChange({ ...data, bullets: next });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {data.eyebrow !== undefined && <Field label="Eyebrow" value={data.eyebrow} onChange={set("eyebrow")} />}
      {data.headline !== undefined && <Field label="Headline" value={data.headline} onChange={set("headline")} multiline rows={4} />}
      {data.sub !== undefined && <Field label="Subtext" value={data.sub} onChange={set("sub")} multiline />}
      {data.stat !== undefined && <Field label="Stat" value={data.stat} onChange={set("stat")} />}
      {data.before !== undefined && <Field label="Before" value={data.before} onChange={set("before")} multiline />}
      {data.after !== undefined && <Field label="After (View1 Sort)" value={data.after} onChange={set("after")} multiline />}
      {data.feature !== undefined && <Field label="Feature Name" value={data.feature} onChange={set("feature")} />}
      {data.date !== undefined && <Field label="Date" value={data.date} onChange={set("date")} />}
      {data.bullets !== undefined && data.bullets.map((b, i) => (
        <Field key={i} label={`Bullet ${i + 1}`} value={b} onChange={(v) => setBullet(i, v)} />
      ))}
      {data.cta !== undefined && <Field label="CTA / URL" value={data.cta} onChange={set("cta")} />}
    </div>
  );
}

// ─── Main app ─────────────────────────────────────────────────────────────────
export default function SocialTemplates() {
  const [activeType, setActiveType] = useState("statement");
  const [templateData, setTemplateData] = useState(
    Object.fromEntries(
      Object.entries(TEMPLATES).map(([k, v]) => [k, { ...v.defaults }])
    )
  );
  const [scale, setScale] = useState(0.45);

  const data = templateData[activeType];
  const setData = (d) => setTemplateData(prev => ({ ...prev, [activeType]: d }));

  return (
    <div style={{
      display: "flex", height: "100vh", background: "#030305",
      color: "#fff", fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Sidebar — template picker */}
      <div style={{
        width: 200, borderRight: "1px solid rgba(255,255,255,0.08)",
        padding: "24px 0", display: "flex", flexDirection: "column", gap: 4,
        flexShrink: 0,
      }}>
        <div style={{ padding: "0 16px 20px", color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase" }}>
          Templates
        </div>
        {Object.entries(TEMPLATES).map(([key, t]) => (
          <button
            key={key}
            onClick={() => setActiveType(key)}
            style={{
              background: activeType === key ? "rgba(167,139,250,0.12)" : "transparent",
              border: "none",
              borderLeft: activeType === key ? "2px solid #A78BFA" : "2px solid transparent",
              color: activeType === key ? "#fff" : "rgba(255,255,255,0.5)",
              padding: "10px 16px",
              textAlign: "left", cursor: "pointer",
              fontSize: 13, fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            <span>{t.emoji}</span>
            <span>{t.label}</span>
          </button>
        ))}

        {/* Scale control */}
        <div style={{ marginTop: "auto", padding: "20px 16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>
            Preview
          </div>
          {[0.35, 0.45, 0.55].map(s => (
            <button
              key={s}
              onClick={() => setScale(s)}
              style={{
                display: "block", width: "100%",
                background: scale === s ? "rgba(167,139,250,0.12)" : "transparent",
                border: "1px solid rgba(255,255,255,0.08)",
                color: scale === s ? "#A78BFA" : "rgba(255,255,255,0.4)",
                borderRadius: 6, padding: "6px 0",
                cursor: "pointer", fontSize: 12,
                fontFamily: "inherit", marginBottom: 4,
              }}
            >
              {Math.round(s * 100)}%
            </button>
          ))}
        </div>
      </div>

      {/* Canvas preview */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center",
        justifyContent: "center", background: "#08080c",
        overflow: "hidden",
      }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}>
          {renderTemplate(activeType, data)}
        </div>
      </div>

      {/* Right panel — editor */}
      <div style={{
        width: 320, borderLeft: "1px solid rgba(255,255,255,0.08)",
        padding: 24, overflowY: "auto",
      }}>
        <div style={{ marginBottom: 20, color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase" }}>
          Edit Copy
        </div>
        <EditorPanel type={activeType} data={data} onChange={setData} />

        <div style={{ marginTop: 24, padding: 16, background: "rgba(167,139,250,0.08)", borderRadius: 8, border: "1px solid rgba(167,139,250,0.2)" }}>
          <div style={{ color: "#A78BFA", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>To export:</div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, lineHeight: 1.6 }}>
            Set preview to 100% → screenshot the canvas (1080×1080) → save as PNG for Instagram / LinkedIn / X.
          </div>
        </div>
      </div>
    </div>
  );
}

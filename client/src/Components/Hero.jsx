import React, { useEffect, useRef } from "react";
import { FastForward, Globe, LockIcon } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  // Refs for animation
  const leftColumnRef = useRef(null);
  const rightPanelRef = useRef(null);
  const badgeRef = useRef(null);
  const headingRef = useRef(null);
  const descriptionRef = useRef(null);
  const buttonsRef = useRef(null);
  const trustRef = useRef(null);

  useEffect(() => {
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      { threshold: 0.1, triggerOnce: true },
    );

    // Observe all animated elements
    const elements = [
      leftColumnRef.current,
      rightPanelRef.current,
      badgeRef.current,
      headingRef.current,
      descriptionRef.current,
      buttonsRef.current,
      trustRef.current,
    ];
    elements.forEach((el) => el && observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section
      style={{
        fontFamily: "'Inter', sans-serif",
        background: "#090B10",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        marginTop: '20px',
      }}
    >
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

        .hero-grid-overlay {
          position: absolute; inset: 0; pointer-events: none;
          background-image: linear-gradient(rgba(34,197,94,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.04) 1px, transparent 1px);
          background-size: 52px 52px;
          mask-image: radial-gradient(ellipse 80% 70% at 70% 40%, black 30%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 80% 70% at 70% 40%, black 30%, transparent 100%);
        }

        .hero-badge-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #22C55E;
          box-shadow: 0 0 8px rgba(34,197,94,0.6);
          animation: hero-pulse-dot 2s ease-in-out infinite;
          flex-shrink: 0;
        }

        .live-dot {
          width: 5px; height: 5px; background: #22C55E;
          border-radius: 50%;
          animation: hero-pulse-dot 1.5s ease-in-out infinite;
        }

        @keyframes hero-pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }

        .hero-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: #22C55E; color: #052E16; font-weight: 700; font-size: 14px;
          padding: 13px 24px; border-radius: 8px; border: none; cursor: pointer;
          letter-spacing: 0.01em; transition: all 0.2s ease; font-family: 'Inter', sans-serif;
        }
        .hero-btn-primary:hover {
          background: #16A34A;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(34,197,94,0.25);
        }
        .hero-btn-primary:hover .btn-arrow { transform: translateX(3px); }
        .btn-arrow { transition: transform 0.2s ease; }

        .hero-btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent; color: #C8D4E0; font-weight: 500; font-size: 14px;
          padding: 13px 24px; border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.12); cursor: pointer;
          transition: all 0.2s ease; font-family: 'Inter', sans-serif;
        }
        .hero-btn-ghost:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.25);
        }

        .hero-country-row {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 10px;
          background: #0A0D13; border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.04);
          transition: all 0.3s ease;
          transform: translateX(0);
        }
        .hero-country-row:hover {
          transform: translateX(4px);
          border-color: rgba(34,197,94,0.2);
          background: rgba(34,197,94,0.02);
        }

        @media (max-width: 900px) {
          .hero-inner { grid-template-columns: 1fr !important; padding: 48px 24px 56px !important; }
          .hero-right-panel { display: block !important; }
          .hero-h1 { font-size: 38px !important; }
        }

        /* Professional Animations */
        @keyframes fadeSlideUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeSlideRight {
          0% { opacity: 0; transform: translateX(-30px); }
          100% { opacity: 1; transform: translateX(0); }
        }

        @keyframes fadeSlideLeft {
          0% { opacity: 0; transform: translateX(30px); }
          100% { opacity: 1; transform: translateX(0); }
        }

        @keyframes scaleIn {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes badgePulse {
          0% { opacity: 0; transform: scale(0.9); }
          50% { transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        /* Animation Classes */
        .animate-fade-slide-up {
          animation: fadeSlideUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-fade-slide-right {
          animation: fadeSlideRight 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-fade-slide-left {
          animation: fadeSlideLeft 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-scale-in {
          animation: scaleIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-badge {
          animation: badgePulse 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        /* Initial hidden states */
        .init-hidden {
          opacity: 0;
        }

        .animate-in.animate-fade-slide-up,
        .animate-in.animate-fade-slide-right,
        .animate-in.animate-fade-slide-left,
        .animate-in.animate-scale-in,
        .animate-in.animate-badge {
          animation-play-state: running;
        }

        /* Delays */
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
        .delay-5 { animation-delay: 0.5s; }

        /* Floating animation for orbs */
        .floating-orb-1 {
          animation: float 6s ease-in-out infinite;
        }
        .floating-orb-2 {
          animation: float 8s ease-in-out infinite reverse;
        }

        /* Shimmer effect on cards */
        .shimmer {
          position: relative;
          overflow: hidden;
        }
        .shimmer::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
          animation: shimmer 3s infinite;
        }

        /* Staggered children animation */
        .stagger-children > * {
          opacity: 0;
          animation: fadeSlideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .stagger-children > *:nth-child(1) { animation-delay: 0.1s; }
        .stagger-children > *:nth-child(2) { animation-delay: 0.2s; }
        .stagger-children > *:nth-child(3) { animation-delay: 0.3s; }
        .stagger-children > *:nth-child(4) { animation-delay: 0.4s; }

        /* Hover animations for metric cards */
        .metric-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .metric-card:hover {
          transform: translateY(-2px);
          border-color: rgba(34,197,94,0.3);
          box-shadow: 0 8px 24px rgba(34,197,94,0.1);
        }
      `}</style>

      {/* Grid overlay */}
      <div className="hero-grid-overlay" />

      {/* Ambient orbs with floating animation */}
      <div
        className="floating-orb-1"
        style={{
          position: "absolute",
          top: -80,
          right: -40,
          width: 420,
          height: 420,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        className="floating-orb-2"
        style={{
          position: "absolute",
          bottom: -120,
          left: -80,
          width: 380,
          height: 380,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(56,189,248,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Main content */}
      <div
        className="hero-inner"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "12px 48px 80px",
          display: "grid",
          gridTemplateColumns: "1fr 420px",
          gap: 40,
          alignItems: "center",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* ── LEFT COLUMN ── */}
        <div
          ref={leftColumnRef}
          className="init-hidden animate-fade-slide-right"
        >
          {/* Badge */}
          <div
            ref={badgeRef}
            className="init-hidden animate-badge delay-1"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.2)",
              borderRadius: 100,
              padding: "6px 14px 6px 10px",
              marginBottom: 32,
            }}
          >
            <div className="hero-badge-dot" />
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 500,
                color: "#86EFAC",
                letterSpacing: "0.02em",
              }}
            >
              Global Digital Communications Platform
            </span>
          </div>

          {/* Headline */}
          <h1
            ref={headingRef}
            className="hero-h1 init-hidden animate-fade-slide-up delay-2"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(38px, 4vw, 60px)",
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              color: "#F0F4F8",
              margin: "0 0 24px",
            }}
          >
            Virtual numbers.
            <br />
            <span style={{ color: "#8B98A8", fontWeight: 300 }}>Real</span>{" "}
            <span
              style={{
                color: "#22C55E",
                display: "inline-block",
                animation: "glowPulse 2s ease-in-out infinite",
              }}
            >
              security.
            </span>
            <br />
            Worldwide reach.
          </h1>

          {/* Description */}
          <p
            ref={descriptionRef}
            className="init-hidden animate-fade-slide-up delay-3"
            style={{
              fontSize: 15.5,
              lineHeight: 1.72,
              color: "#8B98A8",
              maxWidth: 520,
              marginBottom: 40,
            }}
          >
            OTP verification, virtual numbers for{" "}
            <strong style={{ color: "#C8D4E0", fontWeight: 500 }}>
              WhatsApp, Instagram & Facebook
            </strong>
            , and social media growth — unified. Built for brands, agencies, and
            developers operating at global scale.
          </p>

          {/* CTA buttons */}
          <div
            ref={buttonsRef}
            className="init-hidden animate-scale-in delay-4"
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              marginBottom: 56,
              flexWrap: "wrap",
            }}
          >
            <Link to='/login'> <button className="hero-btn-primary">
              Get started free
              <svg
                className="btn-arrow"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
              >
                <path
                  d="M2 7h10M8 3l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button></Link>
           
            <Link to='/register'> <button className="hero-btn-ghost">Sign up</button></Link>
           
          </div>

          {/* Trust row */}
          <div
            ref={trustRef}
            className="init-hidden animate-fade-slide-up delay-5"
            style={{ display: "flex", alignItems: "center", gap: 20 }}
          >
            <div style={{ display: "flex" }}>
              {["AK", "MO", "TR", "SL", "+"].map((initials, i) => (
                <div
                  key={i}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    border: "2px solid #090B10",
                    background:
                      "linear-gradient(135deg, #1A3A2A 0%, #22C55E 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 600,
                    color: "#86EFAC",
                    marginLeft: i === 0 ? 0 : -8,
                    transition: "all 0.3s ease",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.1)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  {initials}
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12.5, color: "#6B7689", margin: 0 }}>
              <strong style={{ color: "#C8D4E0", fontWeight: 500 }}>
                12,000+ businesses
              </strong>{" "}
              verifying globally every month
            </p>
          </div>

          <div  className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-500">
            <span className="inline-flex items-center gap-2">
              <LockIcon size={16} className="text-green-500 shrink-0" />
              <span>Secured & Private</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <FastForward size={16} className="text-green-500 shrink-0" />
              <span>Fast Delivery</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <Globe size={16} className="text-green-500 shrink-0" />
              <span>Built for All</span>
            </span>
          </div>
        </div>

        {/* ── RIGHT COLUMN — Terminal Card ── */}
        <div
          ref={rightPanelRef}
          className="hero-right-panel init-hidden animate-fade-slide-left delay-2"
        >
          <div
            style={{
              background: "#0D1017",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow:
                "0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(34,197,94,0.05)",
              transition: "transform 0.4s ease, box-shadow 0.4s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow =
                "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(34,197,94,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(34,197,94,0.05)";
            }}
          >
            {/* Title bar */}
            <div
              style={{
                background: "#161B24",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {[
                { color: "#FF5F56" },
                { color: "#FFBD2E" },
                { color: "#27C93F" },
              ].map((dot, i) => (
                <div
                  key={i}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: dot.color,
                  }}
                />
              ))}
              <span
                style={{
                  fontSize: 11.5,
                  color: "#6B7689",
                  marginLeft: "auto",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                ZENOSMS · live session
              </span>
            </div>

            {/* Body */}
            <div
              style={{
                padding: 20,
                fontFamily: "'SF Mono', 'Monaco', monospace",
                fontSize: 12.5,
                lineHeight: 1.7,
              }}
            >
              {/* Live tag */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  background: "rgba(34,197,94,0.08)",
                  border: "1px solid rgba(34,197,94,0.15)",
                  borderRadius: 6,
                  padding: "4px 10px",
                  marginBottom: 12,
                }}
              >
                <div className="live-dot" />
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 600,
                    color: "#4ADE80",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Live
                </span>
              </div>

              {/* Divider */}
              <div
                style={{
                  height: 1,
                  background: "rgba(255,255,255,0.05)",
                  margin: "14px 0",
                }}
              />

              {/* Metrics grid */}
              <div
                className="stagger-children"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                {[
                  {
                    label: "Numbers active",
                    value: "48k",
                    unit: "+",
                    change: "↑ 12% this week",
                    changeColor: "#22C55E",
                  },
                  {
                    label: "OTPs sent today",
                    value: "2.1",
                    unit: "M",
                    change: "99.8% delivered",
                    changeColor: "#60A5FA",
                  },
                  {
                    label: "Avg. response",
                    value: "0.3",
                    unit: "s",
                    change: "↑ Fastest month",
                    changeColor: "#22C55E",
                  },
                  {
                    label: "Countries",
                    value: "80",
                    unit: "+",
                    change: "All regions",
                    changeColor: "#60A5FA",
                  },
                ].map((m, i) => (
                  <div
                    key={i}
                    className="metric-card shimmer"
                    style={{
                      background: "#0A0D13",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 12,
                      padding: 16,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "#4B5668",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: 6,
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {m.label}
                    </div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        fontFamily: "'Space Grotesk', sans-serif",
                        color: "#F0F4F8",
                        lineHeight: 1,
                      }}
                    >
                      {m.value}
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 400,
                          color: "#6B7689",
                          marginLeft: 2,
                        }}
                      >
                        {m.unit}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 11.5,
                        marginTop: 5,
                        color: m.changeColor,
                      }}
                    >
                      {m.change}
                    </div>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div
                style={{
                  height: 1,
                  background: "rgba(255,255,255,0.05)",
                  margin: "14px 0",
                }}
              />

              {/* Country list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  {
                    flag: "🇳🇬",
                    name: "Nigeria · WhatsApp, Instagram",
                    pill: "Active",
                    pillGreen: true,
                  },
                  {
                    flag: "🇺🇸",
                    name: "United States · All services",
                    pill: "Active",
                    pillGreen: true,
                  },
                  {
                    flag: "🇬🇧",
                    name: "United Kingdom · Facebook, OTP",
                    pill: "Active",
                    pillGreen: true,
                  },
                ].map((c, i) => (
                  <div
                    key={i}
                    className="hero-country-row"
                    style={{
                      animation: `fadeSlideUp 0.5s ease-out ${i * 0.1}s forwards`,
                      opacity: 0,
                    }}
                  >
                    <span style={{ fontSize: 16, lineHeight: 1 }}>
                      {c.flag}
                    </span>
                    <span
                      style={{
                        fontSize: 12.5,
                        color: "#C8D4E0",
                        flex: 1,
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {c.name}
                    </span>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 600,
                        padding: "3px 8px",
                        borderRadius: 100,
                        background: c.pillGreen
                          ? "rgba(34,197,94,0.12)"
                          : "rgba(96,165,250,0.12)",
                        color: c.pillGreen ? "#4ADE80" : "#60A5FA",
                        border: c.pillGreen
                          ? "1px solid rgba(34,197,94,0.18)"
                          : "1px solid rgba(96,165,250,0.18)",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)";
                        e.currentTarget.style.background = c.pillGreen
                          ? "rgba(34,197,94,0.2)"
                          : "rgba(96,165,250,0.2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.background = c.pillGreen
                          ? "rgba(34,197,94,0.12)"
                          : "rgba(96,165,250,0.12)";
                      }}
                    >
                      {c.pill}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional glow keyframe */}
      <style>{`
        @keyframes glowPulse {
          0%, 100% {
            text-shadow: 0 0 5px rgba(34,197,94,0.3);
          }
          50% {
            text-shadow: 0 0 20px rgba(34,197,94,0.6), 0 0 30px rgba(34,197,94,0.3);
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
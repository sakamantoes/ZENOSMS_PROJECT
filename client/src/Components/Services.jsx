import React, { useEffect, useRef } from "react";
import { 
  Shield, 
  Zap, 
  Globe, 
  MessageCircle,   
  Smartphone,
  TrendingUp,
  Lock,
  Database,
  Cloud,
  Users,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { Link } from "react-router-dom";

const Services = () => {
  // Refs for animation
  const headerRef = useRef(null);
  const badgeRef = useRef(null);
  const cardsRef = useRef([]);
  const ctaRef = useRef(null);

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
      { threshold: 0.1, triggerOnce: true }
    );

    // Observe all animated elements
    const elements = [
      headerRef.current,
      badgeRef.current,
      ctaRef.current,
      ...cardsRef.current,
    ];
    elements.forEach((el) => el && observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const services = [
    {
      icon: <Smartphone className="w-6 h-6" />,
      number: '01',
      title: "Virtual Numbers or Boost",
      description: "Pick a virtual number for verification or choose a social boost package — Instagram, TikTok, Telegram, WhatsApp and more.",
      features: ["Instant activation", "Multiple countries", "24/7 support"],
      color: "green"
    },
     {
      icon: <TrendingUp className="w-6 h-6" />,
      number: '02',
      title: "Receive SMS or connect handle",
      description: "Use the issued number to receive your verification code instantly, or drop your social handle for the boost to begin.",
      features: ["Live metrics", "Custom reports", "Data export"],
      color: "green"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      number: '03',
      title: "Get verified. Get growing.",
      description: "Complete your sign-up in seconds, or watch your followers, likes and friends climb in real time.",
      features: ["Global coverage", "Instant delivery","Fast Verification"],
      color: "green"
    }
   
  ];

  const getGradient = (color) => {
    switch(color) {
      case 'green': return 'from-green-600/20 to-green-500/10';
      case 'blue': return 'from-blue-600/20 to-blue-500/10';
      case 'pink': return 'from-pink-600/20 to-pink-500/10';
      case 'purple': return 'from-purple-600/20 to-purple-500/10';
      default: return 'from-green-600/20 to-green-500/10';
    }
  };

  const getBorderColor = (color) => {
    switch(color) {
      case 'green': return 'hover:border-green-500/50';
      case 'blue': return 'hover:border-blue-500/50';
      case 'pink': return 'hover:border-pink-500/50';
      case 'purple': return 'hover:border-purple-500/50';
      default: return 'hover:border-green-500/50';
    }
  };

  const getIconBg = (color) => {
    switch(color) {
      case 'green': return 'bg-green-500/10 text-green-500';
      case 'blue': return 'bg-blue-500/10 text-blue-500';
      case 'pink': return 'bg-pink-500/10 text-pink-500';
      case 'purple': return 'bg-purple-500/10 text-purple-500';
      default: return 'bg-green-500/10 text-green-500';
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

        .services-grid-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image: linear-gradient(rgba(34,197,94,0.03) 1px, transparent 1px), 
                            linear-gradient(90deg, rgba(34,197,94,0.03) 1px, transparent 1px);
          background-size: 52px 52px;
          mask-image: radial-gradient(ellipse 80% 70% at 50% 30%, black 40%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 80% 70% at 50% 30%, black 40%, transparent 100%);
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(-5deg); }
        }

        @keyframes fadeSlideUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeSlideRight {
          0% { opacity: 0; transform: translateX(-30px); }
          100% { opacity: 1; transform: translateX(0); }
        }

        @keyframes scaleIn {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes badgePulse {
          0% { opacity: 0; transform: scale(0.9); }
          50% { transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes glowPulse {
          0%, 100% { text-shadow: 0 0 5px rgba(34,197,94,0.3); }
          50% { text-shadow: 0 0 20px rgba(34,197,94,0.6), 0 0 30px rgba(34,197,94,0.3); }
        }

        .animate-fade-slide-up {
          animation: fadeSlideUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-fade-slide-right {
          animation: fadeSlideRight 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-scale-in {
          animation: scaleIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-badge {
          animation: badgePulse 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .init-hidden {
          opacity: 0;
        }

        .animate-in.animate-fade-slide-up,
        .animate-in.animate-fade-slide-right,
        .animate-in.animate-scale-in,
        .animate-in.animate-badge {
          animation-play-state: running;
        }

        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
        .delay-5 { animation-delay: 0.5s; }
        .delay-6 { animation-delay: 0.6s; }

        .service-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .service-card:hover {
          transform: translateY(-8px);
        }

        .glow-text {
          animation: glowPulse 2s ease-in-out infinite;
          display: inline-block;
        }
      `}</style>

      {/* Grid overlay */}
      <div className="services-grid-overlay" />

      {/* Ambient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ animation: 'float-slow 8s ease-in-out infinite' }} />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/5 blur-3xl pointer-events-none" style={{ animation: 'float-fast 6s ease-in-out infinite' }} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-green-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        {/* Header Section */}
        <div className="text-center mb-16">
          {/* Badge */}
          <div 
            ref={badgeRef}
            className="init-hidden animate-badge inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 mb-6"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50 animate-pulse" />
            <span className="text-xs font-semibold text-green-400 tracking-wide uppercase">
              What We Offer
            </span>
          </div>

          {/* Heading */}
          <div ref={headerRef} className="init-hidden animate-fade-slide-up">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <span className="text-white">Comprehensive </span>
              <span className="text-green-500 glow-text">Digital Services</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
              Everything you need to scale your digital presence — from virtual numbers 
              to social media growth and advanced analytics.
            </p>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {services.map((service, index) => (
            <div
              key={index}
              ref={el => cardsRef.current[index] = el}
              className={`init-hidden animate-scale-in delay-${(index % 6) + 1} service-card bg-gradient-to-br ${getGradient(service.color)} backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 ${getBorderColor(service.color)}`}
            >
              {/* Icon and Number Row */}
              <div className="flex items-start justify-between mb-5">
                <div className={`w-12 h-12 rounded-xl ${getIconBg(service.color)} flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
                  {service.icon}
                </div>
                <div className="text-4xl md:text-5xl font-black text-white/5 select-none" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900 }}>
                  {service.number}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                {service.description}
              </p>

              {/* Features */}
              <div className="space-y-2">
                {service.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div 
          ref={ctaRef}
          className="init-hidden animate-fade-slide-right delay-5 relative bg-gradient-to-r from-green-600/10 via-transparent to-blue-600/10 rounded-3xl border border-white/10 p-8 md:p-12 overflow-hidden"
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent animate-pulse" />
          
          <div className="relative z-10 text-center md:text-left md:flex md:items-center md:justify-between gap-8">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Ready to scale your digital presence?
              </h3>
              <p className="text-gray-400">
                Join 12,000+ Users already growing with our platform
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to='/auth'> <button className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/25">
                Get Started Free
              </button></Link>
             
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          {[
            { label: "Available Service", value: "8K+", icon: <Database className="w-5 h-5" /> },
            { label: "Countries", value: "151", icon: <Globe className="w-5 h-5" /> },
            { label: "Rental Contries", value: "3", icon: <Users className="w-5 h-5" /> },
            { label: "99.9% Uptime", value: "99.9%", icon: <Cloud className="w-5 h-5" /> },
          ].map((stat, idx) => (
            <div key={idx} className="text-center p-4 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm">
              <div className="text-green-500 mb-2 flex justify-center">{stat.icon}</div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;    
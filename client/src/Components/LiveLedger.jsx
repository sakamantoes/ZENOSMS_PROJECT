import React, { useState, useEffect, useRef } from "react";
import { 
  TrendingUp, 
  Users, 
  Heart, 
  MessageCircle, 
  Eye,
  ThumbsUp,
  UserPlus,
  Smartphone,
  CheckCircle,
  Globe,
  Zap
} from "lucide-react";
import { 
  FaWhatsapp, 
  FaInstagram, 
  FaFacebook, 
  FaTwitter, 
  FaTiktok,
  FaTelegram,
  FaYoutube,
  FaSnapchat
} from "react-icons/fa";

const LiveLedger = () => {
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({
    totalGrowth: 0,
    activeUsers: 0,
    platforms: 0,
    otpReceived: 0
  });
  const [isLive, setIsLive] = useState(true);
  const ledgerRef = useRef(null);

  // Mock data for activities
  const platforms = [
    { name: "WhatsApp", icon: <FaWhatsapp className="w-4 h-4  " />, color: "#25D366", growthType: "followers" },
    { name: "Instagram", icon: <FaInstagram className="w-4 h-4 " />, color: "#E4405F", growthType: "followers" },
    { name: "Facebook", icon: <FaFacebook className="w-4 h-4 " />, color: "#1877F2", growthType: "likes" },
    { name: "TikTok", icon: <FaTiktok className="w-4 h-4 " />, color: "#000000", growthType: "followers" },
    { name: "Telegram", icon: <FaTelegram className="w-4 h-4 " />, color: "#26A5E4", growthType: "members" },
    { name: "YouTube", icon: <FaYoutube className="w-4 h-4 " />, color: "#FF0000", growthType: "subscribers" },
    { name: "Twitter", icon: <FaTwitter className="w-4 h-4 " />, color: "#1DA1F2", growthType: "followers" },
    { name: "Snapchat", icon: <FaSnapchat className="w-4 h-4 " />, color: "#FFFC00", growthType: "friends" },
  ];

  const usernames = [
    "@digital_marketer", "@brand_guru", "@influencer_life", "@business_coach",
    "@tech_startup", "@fashion_icon", "@fitness_trainer", "@travel_blogger",
    "@food_lover", "@music_producer", "@gaming_channel", "@crypto_trader"
  ];

  const actions = [
    { action: "gained", icon: <UserPlus className="w-3 h-3" />, color: "#22C55E" },
    { action: "received OTP for", icon: <Smartphone className="w-3 h-3" />, color: "#60A5FA" },
    { action: "verified with", icon: <CheckCircle className="w-3 h-3" />, color: "#10B981" },
  ];

  // Generate random activity
  const generateActivity = () => {
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const username = usernames[Math.floor(Math.random() * usernames.length)];
    const actionType = Math.random() > 0.7 ? actions[Math.floor(Math.random() * actions.length)] : actions[0];
    const amount = Math.floor(Math.random() * 50) + 1;
    const isOTP = actionType.action.includes("OTP");
    
    return {
      id: Date.now() + Math.random(),
      platform: platform.name,
      platformIcon: platform.icon,
      platformColor: platform.color,
      username: username,
      action: isOTP ? `received OTP for ${platform.name}` : `gained ${amount} new ${platform.growthType}`,
      amount: isOTP ? null : amount,
      growthType: isOTP ? "OTP" : platform.growthType,
      icon: isOTP ? <Smartphone className="w-3 h-3" /> : actionType.icon,
      timestamp: new Date(),
      isOTP: isOTP
    };
  };

  // Update stats based on activities
  const updateStats = (newActivity) => {
    setStats(prev => {
      const newStats = { ...prev };
      
      if (newActivity.isOTP) {
        newStats.otpReceived += 1;
      } else {
        newStats.totalGrowth += newActivity.amount || 0;
      }
      
      newStats.activeUsers = Math.floor(Math.random() * 500) + 100;
      newStats.platforms = platforms.length;
      
      return newStats;
    });
  };

  // Add new activity every 2-4 seconds
  useEffect(() => {
    const addActivity = () => {
      const newActivity = generateActivity();
      setActivities(prev => {
        const updated = [newActivity, ...prev].slice(0, 20); // Keep last 20 activities
        return updated;
      });
      updateStats(newActivity);
    };

    // Initial activities
    const initialActivities = [];
    for (let i = 0; i < 8; i++) {
      initialActivities.push(generateActivity());
    }
    setActivities(initialActivities);

    const interval = setInterval(() => {
      if (isLive) {
        addActivity();
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isLive]);

  // Auto-scroll to top when new activity arrives
  useEffect(() => {
    if (ledgerRef.current) {
      ledgerRef.current.scrollTop = 0;
    }
  }, [activities]);

  // Format timestamp
  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <section className="relative min-h-screen overflow-hidden" style={{ fontFamily: "'Inter', sans-serif", background: "#090B10" }}>
      {/* Google Fonts and Animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

        .ledger-grid-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image: linear-gradient(rgba(34,197,94,0.03) 1px, transparent 1px), 
                            linear-gradient(90deg, rgba(34,197,94,0.03) 1px, transparent 1px);
          background-size: 52px 52px;
          mask-image: radial-gradient(ellipse 80% 70% at 50% 30%, black 40%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 80% 70% at 50% 30%, black 40%, transparent 100%);
        }

        @keyframes fadeSlideUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideInLeft {
          0% { opacity: 0; transform: translateX(-30px); }
          100% { opacity: 1; transform: translateX(0); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        @keyframes glowPulse {
          0%, 100% { text-shadow: 0 0 5px rgba(34,197,94,0.3); }
          50% { text-shadow: 0 0 20px rgba(34,197,94,0.6), 0 0 30px rgba(34,197,94,0.3); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .animate-fade-slide-up {
          animation: fadeSlideUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-slide-in-left {
          animation: slideInLeft 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .activity-item {
          animation: slideInLeft 0.4s ease-out forwards;
        }

        .pulse-animation {
          animation: pulse 2s ease-in-out infinite;
        }

        .blink-animation {
          animation: blink 1.5s ease-in-out infinite;
        }

        .glow-text {
          animation: glowPulse 2s ease-in-out infinite;
          display: inline-block;
        }

        .init-hidden {
          opacity: 0;
        }

        .floating-orb {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      {/* Grid overlay */}
      <div className="ledger-grid-overlay" />

      {/* Ambient orbs */}
      <div className="floating-orb absolute top-20 right-10 w-96 h-96 rounded-full bg-gradient-to-r from-green-500/10 to-blue-500/5 blur-3xl pointer-events-none" />
      <div className="floating-orb absolute bottom-20 left-10 w-80 h-80 rounded-full bg-gradient-to-r from-green-500/5 to-transparent blur-3xl pointer-events-none" style={{ animationDelay: "2s" }} />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          {/* Live Badge */}
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 mb-6">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-500 animate-ping opacity-75" />
            </div>
            <span className="text-xs font-semibold text-green-400 tracking-wide uppercase">
              Live Feed • Real Time
            </span>
          </div>

          {/* Heading */}
          <div className="init-hidden animate-fade-slide-up">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <span className="text-white">Real growth, </span>
              <span className="text-green-500 glow-text">tracked in real time.</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
              A live ledger of users boosting their followers, friends, likes and subscribers 
              across every major platform and OTP received.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Growth", value: stats.totalGrowth.toLocaleString(), icon: <TrendingUp className="w-5 h-5" />, suffix: "+" },
            { label: "Active Users", value: stats.activeUsers, icon: <Users className="w-5 h-5" />, suffix: "" },
            { label: "Platforms", value: stats.platforms, icon: <Globe className="w-5 h-5" />, suffix: "" },
            { label: "OTP Received", value: stats.otpReceived.toLocaleString(), icon: <Smartphone className="w-5 h-5" />, suffix: "" },
          ].map((stat, idx) => (
            <div key={idx} className="text-center p-4 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm">
              <div className="text-green-500 mb-2 flex justify-center">{stat.icon}</div>
              <div className="text-2xl font-bold text-white">
                {stat.value}{stat.suffix}
              </div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Live Ledger Card */}
        <div className="relative bg-gradient-to-br from-gray-900/50 to-gray-950/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-green-600/20 via-transparent to-transparent border-b border-white/10 px-6 py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500 animate-ping opacity-75" />
                  </div>
                  <span className="text-sm font-semibold text-green-400 uppercase tracking-wider">Live Ledger</span>
                </div>
                <div className="h-4 w-px bg-white/10" />
                <span className="text-xs text-gray-500 font-mono">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4  text-green-500" />
                <span className="text-xs text-gray-400">Auto-updating every 2.5s</span>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div 
            ref={ledgerRef}
            className="h-[500px] overflow-y-auto p-4 space-y-3 custom-scrollbar"
          >
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                className="activity-item bg-gray-800/30 hover:bg-gray-800/50 rounded-xl p-4 transition-all duration-300 border border-white/5 hover:border-green-500/20"
              >
                <div className="flex items-start gap-3">
                  {/* Platform Icon */}
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${activity.platformColor}20` }}
                  >
                    <div style={{ color: activity.platformColor }}>
                      {activity.platformIcon}
                    </div>
                  </div>

                  {/* Activity Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold text-white">
                        {activity.username}
                      </span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-400">
                        {formatTime(activity.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-300">
                      {activity.action}
                      {activity.amount && (
                        <span className="inline-flex items-center gap-1 ml-1">
                          <span className="font-bold text-green-500">
                            +{activity.amount}
                          </span>
                          <span className="text-xs text-gray-500">
                            {activity.growthType}
                          </span>
                        </span>
                      )}
                    </p>
                    
                    {/* Platform Tag */}
                    <div className="flex items-center gap-2 mt-2">
                      <span 
                        className="text-xs px-2 py-1 rounded-full"
                        style={{ background: `${activity.platformColor}20`, color: activity.platformColor }}
                      >
                        {activity.platform}
                      </span>
                      {activity.isOTP && (
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                          OTP Verification
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Icon */}
                  <div className="shrink-0">
                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                      {activity.icon}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-white/10 px-6 py-3 bg-gray-900/30">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 blink-animation" />
                  <span className="text-gray-500">Live updates</span>
                </div>
                <span className="text-gray-600">•</span>
                <span className="text-gray-500">{activities.length} recent activities</span>
              </div>
              <button
                onClick={() => setIsLive(!isLive)}
                className={`px-3 py-1 rounded-lg transition-all duration-300 ${
                  isLive 
                    ? "bg-green-500/10 text-green-400 hover:bg-green-500/20" 
                    : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                }`}
              >
                {isLive ? "● Live" : "○ Paused"}
              </button>
            </div>
          </div>
        </div>

        {/* Custom Scrollbar Styles */}
        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 3px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(34, 197, 94, 0.3);
            border-radius: 3px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(34, 197, 94, 0.5);
          }
        `}</style>
      </div>
    </section>
  );
};

export default LiveLedger;
// src/components/FloatingChat.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
} from "framer-motion";
import { FaTelegramPlane, FaHeadset } from "react-icons/fa";
// import { FaWhatsapp } from "react-icons/fa";

const BUTTON_SIZE = 48; // matches w-12 / h-12
const EDGE_PADDING = 8; // min gap to the viewport edge
const POPUP_MAX_WIDTH = 352; // matches max-w-sm
const POPUP_GAP = 12;
const STORAGE_KEY = "zeno_floating_chat_pos";

// Default anchor is bottom-right: 24px on mobile, 32px from md up
const getAnchorMargin = () => (window.innerWidth >= 768 ? 32 : 24);

// Drag limits, expressed as offsets from the default bottom-right anchor
const getBounds = () => {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const M = getAnchorMargin();

  return {
    right: M - EDGE_PADDING,
    left: -(W - M - BUTTON_SIZE - EDGE_PADDING),
    bottom: M - EDGE_PADDING,
    top: -(H - M - BUTTON_SIZE - EDGE_PADDING),
  };
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// Places the popup next to the button, on whichever side has room
const getPopupStyle = (rect) => {
  const W = window.innerWidth;
  const H = window.innerHeight;

  const width = Math.min(POPUP_MAX_WIDTH, W - EDGE_PADDING * 2);
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const preferredLeft = centerX > W / 2 ? rect.right - width : rect.left;
  const left = clamp(preferredLeft, EDGE_PADDING, W - width - EDGE_PADDING);

  if (centerY > H / 2) {
    return {
      left,
      width,
      bottom: H - rect.top + POPUP_GAP,
      maxHeight: Math.max(rect.top - POPUP_GAP - EDGE_PADDING, 200),
    };
  }

  return {
    left,
    width,
    top: rect.bottom + POPUP_GAP,
    maxHeight: Math.max(H - rect.bottom - POPUP_GAP - EDGE_PADDING, 200),
  };
};

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [bounds, setBounds] = useState(null);
  const [popupStyle, setPopupStyle] = useState({});

  const wrapperRef = useRef(null);
  const wasDragged = useRef(false);

  // Offsets from the default bottom-right anchor
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // WhatsApp Configuration
  // const whatsappNumber = "09074705972";
  // const whatsappMessage = "Hello! I'm interested in Zeno services.";
  // const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
  // const whatsappGroupUrl = "https://chat.whatsapp.com/BPXIzzwuftU4f3ZTCPRhuj";

  // Telegram Configuration
  const telegramChannelUrl = "https://t.me/zenosmsglobal";
  const telegramSupportUrl = "https://t.me/Zenosmscustomercare";

  /* ------------------------------------------------------------------ */
  /* Position: restore, keep inside viewport on resize                   */
  /* ------------------------------------------------------------------ */

  const applyBounds = useCallback(() => {
    const next = getBounds();
    setBounds(next);
    x.set(clamp(x.get(), next.left, next.right));
    y.set(clamp(y.get(), next.top, next.bottom));
  }, [x, y]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) {
        x.set(saved.x);
        y.set(saved.y);
      }
    } catch {
      // Ignore storage/parsing errors
    }

    applyBounds();
    window.addEventListener("resize", applyBounds);
    return () => window.removeEventListener("resize", applyBounds);
  }, [applyBounds, x, y]);

  const closeChat = () => {
    setIsOpen(false);
    setShowOptions(false);
  };

  /* ------------------------------------------------------------------ */
  /* Drag vs click                                                       */
  /* ------------------------------------------------------------------ */

  const handleDragStart = () => {
    wasDragged.current = true;
  };

  const handleDragEnd = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ x: x.get(), y: y.get() })
      );
    } catch {
      // Ignore storage errors
    }

    // The click that follows a drag must not open the chat
    setTimeout(() => {
      wasDragged.current = false;
    }, 100);
  };

  const handleOpen = () => {
    if (wasDragged.current) return;

    const rect = wrapperRef.current?.getBoundingClientRect();
    if (rect) setPopupStyle(getPopupStyle(rect));

    setIsOpen(true);
    setShowOptions(true);
  };

  /* ------------------------------------------------------------------ */
  /* Links                                                               */
  /* ------------------------------------------------------------------ */

  // const handleWhatsApp = () => {
  //   window.open(whatsappGroupUrl, "_blank");
  //   closeChat();
  // };

  const handleTelegramChannel = () => {
    window.open(telegramChannelUrl, "_blank");
    closeChat();
  };

  const handleTelegramSupport = () => {
    window.open(telegramSupportUrl, "_blank");
    closeChat();
  };

  return (
    <>
      {/* Floating Button (draggable) */}
      <motion.div
        ref={wrapperRef}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        drag
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={bounds || undefined}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{ x, y, touchAction: "none" }}
        className="fixed bottom-6 right-6 z-50 md:bottom-8 md:right-8 cursor-grab active:cursor-grabbing"
      >
        {/* Pulsing Ring Effect */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.5, 0.2, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 to-green-700 blur-lg pointer-events-none"
        />

        {/* Main Button */}
        <motion.button
          type="button"
          aria-label="Open customer support"
          onClick={handleOpen}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="
            relative
            flex
            items-center
            justify-center
            w-12
            h-12
            rounded-full
            bg-gradient-to-br
            from-green-600
            to-green-500
            shadow-xl
            shadow-green-300/40
            border
            border-white/20
            backdrop-blur-md
            group
          "
        >
          <FaHeadset className="text-white text-2xl pointer-events-none" />

          {/* Customer Support Badge */}
          <div className="absolute -top-1.5 -right-1.5 bg-white rounded-full px-1.5 py-px shadow-lg pointer-events-none">
            <span className="text-[10px] font-bold text-green-600">CS</span>
          </div>
        </motion.button>
      </motion.div>

      {/* Chat Options Popup */}
      <AnimatePresence>
        {isOpen && showOptions && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeChat}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Options Modal — anchored next to the button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 220,
              }}
              style={popupStyle}
              className="
                fixed
                z-50
                overflow-y-auto
                overflow-x-hidden
                rounded-2xl
                border
                border-white/20
                bg-gradient-to-br
                from-gray-900
                to-black
                shadow-2xl
              "
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-green-600 to-green-500 p-3 flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
                    <FaHeadset className="text-green-600 text-2xl" />
                  </div>
                  <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                </div>

                <div>
                  <h3 className="text-white font-bold text-base">
                    Customer Support
                  </h3>
                  <p className="text-green-100 text-xs">
                    Choose your preferred platform
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Close"
                  onClick={closeChat}
                  className="ml-auto text-white/70 hover:text-white text-lg transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="p-3">
                <p className="text-gray-300 text-center text-sm leading-relaxed mb-4">
                  👋 Welcome to Zeno Support!
                  <br />
                  How would you like to connect with us?
                </p>

                {/* Options Cards */}
                <div className="space-y-3">
                  {/* WhatsApp Option */}
                  {/* <motion.button
                    onClick={handleWhatsApp}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full p-3 rounded-xl flex items-center gap-3 bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/30 hover:border-green-500 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FaWhatsapp className="text-green-500 text-xl" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="text-white text-sm font-semibold">WhatsApp Group</h4>
                      <p className="text-gray-400 text-xs">Join our community & get support</p>
                    </div>
                  </motion.button> */}

                  {/* Telegram Channel Option */}
                  <motion.button
                    type="button"
                    onClick={handleTelegramChannel}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="
                      w-full
                      p-3
                      rounded-xl
                      flex
                      items-center
                      gap-3
                      bg-gradient-to-r
                      from-blue-500/10
                      to-cyan-500/10
                      border
                      border-blue-500/30
                      hover:border-blue-500
                      transition-all
                      group
                    "
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FaTelegramPlane className="text-blue-500 text-xl" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="text-white text-sm font-semibold">
                        Telegram Channel
                      </h4>
                      <p className="text-gray-400 text-xs">
                        Stay updated with news & announcements
                      </p>
                    </div>
                    <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      →
                    </span>
                  </motion.button>

                  {/* Telegram Support Option */}
                  <motion.button
                    type="button"
                    onClick={handleTelegramSupport}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="
                      w-full
                      p-3
                      rounded-xl
                      flex
                      items-center
                      gap-3
                      bg-gradient-to-r
                      from-purple-500/10
                      to-pink-500/10
                      border
                      border-purple-500/30
                      hover:border-purple-500
                      transition-all
                      group
                    "
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FaTelegramPlane className="text-purple-500 text-xl" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="text-white text-sm font-semibold">
                        Customer Care
                      </h4>
                      <p className="text-gray-400 text-xs">
                        Direct support via Telegram
                      </p>
                    </div>
                    <span className="text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      →
                    </span>
                  </motion.button>
                </div>

                {/* Features */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="text-green-500">✓</span>
                      24/7 Availability
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="text-green-500">✓</span>
                      Instant Responses
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="text-green-500">✓</span>
                      Secure Chat
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="text-green-500">✓</span>
                      Free Support
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-gray-500 text-center mt-3">
                  Your privacy is important. All chats are encrypted and secure.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChat;

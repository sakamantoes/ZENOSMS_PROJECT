import React, { useEffect, useRef } from 'react';
import Homenav from '../Components/Homenav';
import Hero from '../Components/Hero';
import Services from '../Components/Services';
import LiveLedger from '../Components/LiveLedger';
import Footer from '../Components/Footer';
import FloatingChat from '../Components/FloatingChat';

const HomePage = () => {
  const homeSectionRef = useRef(null);
  const servicesSectionRef = useRef(null);
  const liveLedgerRef = useRef(null);
  const footerRef = useRef(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('section-visible');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    const sections = [
      homeSectionRef.current,
      servicesSectionRef.current,
      liveLedgerRef.current,
      footerRef.current
    ];

    sections.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  return (
    <>
      {/* Background container with black base and dim green grid */}
      <div className="relative min-h-screen w-full bg-black overflow-hidden">
        {/* SVG grid pattern with very dim green */}
        <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dimGreenGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#0a2f0a"
                strokeWidth="0.8"
                opacity="0.6"
              />
              <path
                d="M 0 40 L 40 40 40 0"
                fill="none"
                stroke="#0a2f0a"
                strokeWidth="0.8"
                opacity="0.6"
              />
            </pattern>

            <pattern id="dimGreenGridFine" width="10" height="10" patternUnits="userSpaceOnUse">
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="#0a2f0a"
                strokeWidth="0.4"
                opacity="0.4"
              />
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill="url(#dimGreenGridFine)" />
          <rect width="100%" height="100%" fill="url(#dimGreenGrid)" />
        </svg>

        <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dimGreenDots" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="0" cy="0" r="1.2" fill="#0f3f0f" opacity="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dimGreenDots)" />
        </svg>

        {/* Animation Styles */}
        <style>{`
          .section-fade-up {
            opacity: 0;
            transform: translateY(40px);
            transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .section-visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
          }

          .section-fade-left {
            opacity: 0;
            transform: translateX(-30px);
            transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .section-fade-right {
            opacity: 0;
            transform: translateX(30px);
            transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .section-scale {
            opacity: 0;
            transform: scale(0.95);
            transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .delay-1 { transition-delay: 0.1s; }
          .delay-2 { transition-delay: 0.2s; }
          .delay-3 { transition-delay: 0.3s; }
        `}</style>

        {/* Main content container with centralized padding */}
        <div className="relative z-10 min-h-screen">
          <div className="w-full max-w-7xl mx-auto sm:px-4 lg:px-5 py-3 md:py-4 lg:py-2">
            <div className="bg-black bg-opacity-80 rounded-lg p-3.5 md:p-8 lg:p-10">
              {/* Home Section */}
                <Homenav />
              <section 
                id="home" 
                ref={homeSectionRef}
                className="section-fade-up"
              >
              
                <Hero />
              </section>

              {/* Services Section */}
              <section 
                id="services" 
                ref={servicesSectionRef}
                className="section-fade-left delay-1"
              >
                <Services />
              </section>

              {/* LiveLedger Section */}
              <div ref={liveLedgerRef} className="section-scale delay-2">
                <LiveLedger />
              </div>

              {/* Footer Section */}
              <div ref={footerRef} className="section-fade-right delay-3">
                <Footer />
              </div>

              <FloatingChat />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
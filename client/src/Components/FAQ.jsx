// src/pages/FAQ.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTelegramPlane, 
  FaWhatsapp, 
  FaChevronDown,
  FaChevronUp,
  FaSearch,
  FaHeadset,
  FaComments,
  FaShieldAlt,
  FaRocket,
  FaUsers,
  FaGlobe,
  FaMobile,
  FaLock,
  FaCreditCard,
  FaQuestionCircle
} from 'react-icons/fa';
import { FiSend, FiMessageCircle } from 'react-icons/fi';

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);

  const faqCategories = [
    {
      title: 'Getting Started',
      icon: FaRocket,
      questions: [
        {
          q: 'What is Zeno?',
          a: 'Zeno is a global platform for virtual numbers, OTP verification, and social media growth tools. We provide virtual numbers for WhatsApp, Instagram, Facebook, and more across multiple countries for secure verification anywhere in the world.'
        },
        {
          q: 'How do I create an account?',
          a: 'Creating an account is simple. Click on the "Sign Up" button on our homepage, fill in your details, verify your email address, and you\'re ready to start using our services.'
        },
        {
          q: 'Do I need to verify my identity?',
          a: 'Yes, to ensure security and compliance, we require basic identity verification. This helps us maintain a secure platform for all users and prevent fraud.'
        }
      ]
    },
    {
      title: 'Virtual Numbers',
      icon: FaMobile,
      questions: [
        {
          q: 'What countries do you support for virtual numbers?',
          a: 'We support virtual numbers across 80+ countries including Nigeria, United States, United Kingdom, Canada, and many more. Check our coverage page for the complete list.'
        },
        {
          q: 'How long does it take to get a virtual number?',
          a: 'Virtual numbers are typically provisioned within minutes of order confirmation. Some specific numbers may require up to 24 hours depending on availability.'
        },
        {
          q: 'Can I use virtual numbers for WhatsApp verification?',
          a: 'Yes, our virtual numbers work perfectly for WhatsApp verification and other messaging apps. We support WhatsApp, Instagram, Facebook, Telegram, and many more.'
        }
      ]
    },
    {
      title: 'Security & Privacy',
      icon: FaLock,
      questions: [
        {
          q: 'Is my data secure with Zeno?',
          a: 'Absolutely! We use enterprise-grade encryption and security protocols to protect your data. All communications are encrypted and we never share your information with third parties.'
        },
        {
          q: 'What happens to my data after I stop using Zeno?',
          a: 'We retain your data for a period as required by law. You can request data deletion at any time through your account settings or by contacting our support team.'
        }
      ]
    },
    {
      title: 'Payments & Billing',
      icon: FaCreditCard,
      questions: [
        {
          q: 'What payment methods do you accept?',
          a: 'We accept various payment methods including bank transfers, cryptocurrency (BTC, ETH, USDT), and mobile money services. Check our payment page for the most up-to-date options.'
        },
        {
          q: 'Is there a free trial?',
          a: 'Yes, we offer a free trial for new users to explore our basic features. This allows you to experience the platform before committing to a paid plan.'
        }
      ]
    },
    {
      title: 'Social Media Growth',
      icon: FaUsers,
      questions: [
        {
          q: 'What social media growth services do you offer?',
          a: 'We offer engagement and account growth services including followers, likes, comments, and views for various platforms like Instagram, Facebook, Twitter, and TikTok.'
        },
        {
          q: 'Are your growth services safe?',
          a: 'Yes, our growth services use organic and safe methods to grow your presence. We follow platform guidelines to ensure your account remains secure and in good standing.'
        }
      ]
    }
  ];

  const allQuestions = faqCategories.flatMap(cat => 
    cat.questions.map(q => ({ ...q, category: cat.title }))
  );

  const filteredQuestions = searchTerm
    ? allQuestions.filter(q => 
        q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.a.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleToggle = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black/95 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
            <FaQuestionCircle className="text-green-500 text-sm" />
            <span className="text-xs font-medium text-green-400">FAQ</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-['Space_Grotesk']">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Find answers to common questions about Zeno's services, virtual numbers, and more.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 transition-all duration-300"
            />
          </div>
        </motion.div>

        {/* Search Results */}
        {searchTerm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h2 className="text-lg font-semibold text-white mb-4">
              Found {filteredQuestions.length} results
            </h2>
            <div className="space-y-3">
              {filteredQuestions.map((item, index) => (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:border-green-500/30 transition-all duration-300"
                >
                  <p className="text-white font-semibold">{item.q}</p>
                  <p className="text-gray-400 text-sm mt-1">{item.a}</p>
                  <p className="text-green-500 text-xs mt-2">Category: {item.category}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* FAQ Categories */}
        {!searchTerm && (
          <div className="space-y-8">
            {faqCategories.map((category, catIndex) => (
              <motion.div
                key={catIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: catIndex * 0.05 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                    <category.icon className="text-green-500 text-xl" />
                  </div>
                  <h2 className="text-xl font-bold text-white font-['Space_Grotesk']">
                    {category.title}
                  </h2>
                  <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full">
                    {category.questions.length} questions
                  </span>
                </div>

                <div className="space-y-3">
                  {category.questions.map((item, qIndex) => {
                    const globalIndex = catIndex * 10 + qIndex;
                    return (
                      <motion.div
                        key={qIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: qIndex * 0.05 }}
                        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-green-500/30 transition-all duration-300"
                      >
                        <button
                          onClick={() => handleToggle(globalIndex)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors duration-200"
                        >
                          <span className="text-white font-medium pr-4">
                            {item.q}
                          </span>
                          <span className="text-gray-500 flex-shrink-0">
                            {expandedIndex === globalIndex ? (
                              <FaChevronUp className="text-green-500" />
                            ) : (
                              <FaChevronDown className="text-gray-400" />
                            )}
                          </span>
                        </button>
                        <AnimatePresence>
                          {expandedIndex === globalIndex && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="px-4 pb-4"
                            >
                              <p className="text-gray-400 text-sm leading-relaxed border-t border-white/10 pt-4">
                                {item.a}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Still Need Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600/10 to-green-500/10 border border-green-500/20 p-8 text-center mt-12"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <FaHeadset className="text-4xl text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              Still have questions?
            </h3>
            <p className="text-gray-400 mb-4">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://t.me/zenosmsglobal"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
              >
                <FaTelegramPlane />
                Join Telegram
              </a>
              <a
                href="https://t.me/Zenosmscustomercare"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
              >
                <FiMessageCircle />
                Contact Support
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQ;
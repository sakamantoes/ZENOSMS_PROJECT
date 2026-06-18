// src/pages/UserSupport.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaTelegramPlane, 
  FaWhatsapp, 
  FaEnvelope, 
  FaClock, 
  FaShieldAlt, 
  FaHeadset,
  FaArrowRight,
  FaCopy,
  FaCheck,
  FaComments,
  FaUserFriends,
  FaGlobe
} from 'react-icons/fa';
import { FiMessageCircle, FiSend } from 'react-icons/fi';
import { Mail, Phone, MessageCircle } from 'lucide-react';

const UserSupport = () => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('telegram');

  // Telegram details
  const telegramChannelUrl = "https://t.me/zenosmsglobal";
  const telegramSupportUrl = "https://t.me/Zenosmscustomercare";

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const supportOptions = [
    {
      id: 'telegram',
      icon: FaTelegramPlane,
      title: 'Telegram Channel',
      description: 'Join our official Telegram channel for updates, announcements, and community discussions.',
      action: 'Join Channel',
      url: telegramChannelUrl,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-500',
    },
    {
      id: 'support',
      icon: FaHeadset,
      title: 'Customer Care',
      description: 'Direct support via Telegram for personalized assistance with your account and services.',
      action: 'Chat Now',
      url: telegramSupportUrl,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      textColor: 'text-purple-500',
    },
  ];

  const faqItems = [
    {
      question: 'How do I get started with Zeno?',
      answer: 'Getting started is easy! Simply sign up for an account, verify your email, and you\'ll have access to our full suite of virtual number and communication services.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept various payment methods including bank transfers, cryptocurrency, and mobile money. Please check our payment page for the most up-to-date options.'
    },
    {
      question: 'How long does it take to get a virtual number?',
      answer: 'Virtual numbers are typically provisioned within minutes of order confirmation. Some numbers may require up to 24 hours depending on availability.'
    },
    {
      question: 'Is my data secure with Zeno?',
      answer: 'Yes! We use enterprise-grade encryption and security protocols to protect your data. All communications are encrypted and we never share your information with third parties.'
    },
    {
      question: 'Can I use Zeno for business purposes?',
      answer: 'Absolutely! Zeno offers enterprise solutions for businesses of all sizes. Contact our support team for custom pricing and features.'
    },
    {
      question: 'What countries do you support?',
      answer: 'We support virtual numbers across 80+ countries including Nigeria, United States, United Kingdom, Canada, and many more. Check our coverage page for the full list.'
    },
  ];

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
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-green-400">Support Center</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-['Space_Grotesk']">
            How can we help?
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Get support through our channels or browse our FAQ for quick answers to common questions.
          </p>
        </motion.div>

        {/* Support Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {supportOptions.map((option, index) => (
            <motion.a
              key={option.id}
              href={option.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              className={`
                group relative overflow-hidden rounded-2xl p-8
                bg-gradient-to-br ${option.bgColor}
                border ${option.borderColor}
                hover:border-opacity-100 transition-all duration-300
                hover:scale-[1.02] hover:shadow-2xl
              `}
            >
              {/* Background Glow */}
              <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br ${option.color} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`} />
              
              <div className="relative z-10">
                <div className="flex items-start gap-4">
                  <div className={`
                    p-3 rounded-xl bg-gradient-to-br ${option.color}
                    shadow-lg shadow-${option.id === 'telegram' ? 'blue' : 'purple'}-500/20
                  `}>
                    <option.icon className="text-white text-2xl" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{option.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{option.description}</p>
                    <div className="flex items-center gap-2">
                      <span className={`
                        inline-flex items-center gap-2 px-4 py-2 rounded-lg
                        bg-gradient-to-r ${option.color}
                        text-white font-semibold text-sm
                        transition-all duration-300 group-hover:shadow-lg
                      `}>
                        {option.action}
                        <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
              <FiMessageCircle className="text-green-500 text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white font-['Space_Grotesk']">
                Frequently Asked Questions
              </h2>
              <p className="text-gray-400 text-sm">Quick answers to common questions</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-green-500/30 hover:bg-white/10 transition-all duration-300"
              >
                <h3 className="text-white font-semibold mb-2 group-hover:text-green-400 transition-colors">
                  {item.question}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {item.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Still Need Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600/10 to-green-500/10 border border-green-500/20 p-8 text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <FaHeadset className="text-4xl text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              Still need help?
            </h3>
            <p className="text-gray-400 mb-4">
              Our support team is ready to assist you 24/7
            </p>
            <a
              href={telegramSupportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 hover:scale-105"
            >
              Contact Support
              <FiSend className="text-sm" />
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserSupport;
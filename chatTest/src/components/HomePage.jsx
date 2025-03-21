import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Bot, Sparkles, Send, MessageSquare, User, ChevronRight } from 'lucide-react';

const HomePage = ({ onGetStarted }) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNameEntered, setIsNameEntered] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const savedName = sessionStorage.getItem('userName');
    if (savedName) {
      setName(savedName);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setErrorMessage('Please enter your name');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    
    setIsSubmitting(true);
    
    sessionStorage.setItem('userName', name.trim());
    
    setTimeout(() => {
      setIsNameEntered(true);
      setIsSubmitting(false);
    }, 1000);
  };

  const handleGetStarted = () => {
    onGetStarted(name);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col"
    >
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-blue-500 opacity-10"
              style={{
                width: Math.random() * 300 + 50,
                height: Math.random() * 300 + 50,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, Math.random() * 30 - 15],
                x: [0, Math.random() * 30 - 15],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto flex flex-col items-center justify-center min-h-screen px-4 py-12 relative z-10">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute opacity-20 w-32 h-32 rounded-full border-4 border-blue-500"
            />
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="relative z-10 bg-gradient-to-r from-blue-600 to-blue-400 p-5 rounded-full shadow-xl"
            >
              <Bot className="w-10 h-10 text-white" />
            </motion.div>
          </div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-600 mb-4"
          >
            Satyam's AI Assistant
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Get answers to all your questions about Satyam's projects, experience, and skills
          </motion.p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12"
        >
          {[
            { icon: <MessageSquare className="w-8 h-8" />, title: "Instant Responses", desc: "Get immediate answers to your questions" },
            { icon: <Sparkles className="w-8 h-8" />, title: "AI Powered", desc: "Powered by advanced AI technology" },
            { icon: <User className="w-8 h-8" />, title: "Personalized", desc: "Tailored responses about Satyam" }
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5, scale: 1.03 }}
              className="bg-gray-800 bg-opacity-50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-lg"
            >
              <div className="bg-blue-500 bg-opacity-20 p-3 rounded-full w-fit mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="w-full max-w-md bg-gray-800 bg-opacity-60 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 shadow-xl"
        >
          {!isNameEntered ? (
            <>
              <h2 className="text-2xl font-bold mb-6 text-center">Enter your name to get started</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg py-3 px-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Your name"
                    disabled={isSubmitting}
                  />
                </div>
                
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm flex items-center"
                  >
                    <span className="mr-2">⚠️</span> {errorMessage}
                  </motion.div>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all font-medium flex items-center justify-center space-x-2 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <span>Continue</span>
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full flex items-center justify-center"
              >
                <Bot className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-xl font-bold">
                Hello, <span className="text-blue-400">{name}</span>!
              </h2>
              <p className="text-gray-300">Ready to start chatting with Satyam's AI Assistant?</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetStarted}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all font-medium flex items-center justify-center gap-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HomePage;
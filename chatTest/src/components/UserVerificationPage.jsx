import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Info, UserCheck, Sparkles, ExternalLink } from 'lucide-react';

const UserVerificationPage = ({ onUserVerified }) => {
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND}/verify-user/${userId}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('verifiedUserId', userId);
        sessionStorage.setItem('userData', JSON.stringify(data));
        onUserVerified(data);
      } else {
        const errorMessage = data.message || 'User verification failed';
        setError(errorMessage);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const BackgroundParticles = () => {
    const particles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 2
    }));

    return (
      <motion.div 
        className="absolute inset-0 overflow-hidden pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute bg-purple-300/30 rounded-full"
            style={{
              width: `${particle.size}rem`,
              height: `${particle.size}rem`,
              left: `${particle.x}%`,
              top: `${particle.y}%`
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
              translateX: ['-50%', '50%', '-50%'],
              translateY: ['-50%', '50%', '-50%']
            }}
            transition={{
              duration: 5 + particle.delay,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#120312] via-[#200a22] to-[#331d3d] flex items-center justify-center overflow-hidden relative">
      <BackgroundParticles />
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-indigo-900/10 to-blue-900/20 mix-blend-overlay"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-[#1a0a1f]/60 backdrop-blur-xl border border-purple-900/40 p-8 rounded-3xl shadow-2xl shadow-purple-900/50">
          <div className="text-center mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 mb-2 flex items-center justify-center gap-3"
            >
              <Sparkles className="text-pink-400 animate-pulse" />
              ChatMate
              <Sparkles className="text-pink-400 animate-pulse" />
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-purple-300"
            >
              Your Personal Chat Assistant
            </motion.p>
          </div>

          <form onSubmit={handleVerifyUser} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center bg-purple-900/30 border border-purple-700/40 rounded-lg p-3 mb-2">
                <UserCheck className="text-pink-400 mr-3" />
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter UserID"
                  className="w-full bg-transparent text-purple-100 placeholder-purple-300 focus:outline-none"
                  required
                />
              </div>
              <div className="flex items-center text-xs text-purple-300 mb-4">
                <Info className="w-4 h-4 mr-2 text-pink-400" />
                <span>UserID is the unique username of the AI assistant you want to use</span>
              </div>
            </motion.div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-pink-400 text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-700 to-pink-700 text-white p-3 rounded-lg hover:from-purple-800 hover:to-pink-800 transition-all flex items-center justify-center"
            >
              {isLoading ? (
                <div className="animate-spin h-5 w-5 border-t-2 border-white rounded-full"></div>
              ) : (
                'Enter UserID'
              )}
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-center mt-4"
            >
              <motion.a
                href="https://graceful-pegasus-7e9200.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-purple-300 hover:text-pink-400 transition-colors flex items-center justify-center"
              >
                <span>Wanted to create your own chatbot?</span>
                <ExternalLink className="ml-2 w-4 h-4 text-pink-400" />
              </motion.a>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default UserVerificationPage;
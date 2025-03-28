import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatBot from './components/ChatBot';
import HomePage from './components/HomePage';
import UserVerificationPage from './components/UserVerificationPage';

const App = () => {
  const [showChat, setShowChat] = useState(false);
  const [userName, setUserName] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const hasStarted = sessionStorage.getItem('hasStartedChat');
    const storedUserData = sessionStorage.getItem('userData');

    if (hasStarted === 'true' && storedUserData) {
      setUserData(JSON.parse(storedUserData));
      setShowChat(true);
    }
  }, []);

  const handleGetStarted = (name) => {
    setUserName(name);
    setIsTransitioning(true);
    sessionStorage.setItem('hasStartedChat', 'true');

    setTimeout(() => {
      setShowChat(true);
      setIsTransitioning(false);
    }, 1000);
  };

  const handleUserVerified = (verifiedUserData) => {
    setUserData(verifiedUserData);
    setShowChat(true);
  };

  const handleLogout = () => {
    // Clear session and local storage
    sessionStorage.removeItem('hasStartedChat');
    sessionStorage.removeItem('userData');
    localStorage.removeItem('verifiedUserId');
    
    // Reset states
    setShowChat(false);
    setUserData(null);
    setUserName('');
  };

  useEffect(() => {
    const keepAlive = setInterval(() => {
      if (userData) {
        fetch(`${import.meta.env.VITE_BACKEND}/prompt/${userData.user._id}`)
          .then((res) => res.json())
          .then((data) => console.log('Server kept alive:', data))
          .catch((err) => console.error('Error keeping server alive:', err));
      }
    }, 100000);

    return () => clearInterval(keepAlive);
  }, [userData]);

  return (
    <div className="min-h-screen bg-gray-900">
      <AnimatePresence mode="wait">
        {isTransitioning ? (
          <motion.div
            key="transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-gray-900 z-50"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 0], rotate: [0, 180] }}
              transition={{ duration: 1 }}
              className="bg-blue-500 rounded-full p-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M12 7V12L15 15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : showChat ? (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <HomePage 
              userName={userName} 
              userData={userData} 
              onLogout={handleLogout} 
            />
          </motion.div>
        ) : (
          <motion.div
            key="verification"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <UserVerificationPage onUserVerified={handleUserVerified} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
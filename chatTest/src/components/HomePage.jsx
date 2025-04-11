import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Bot, 
  Sparkles, 
  MessageSquare, 
  User, 
  ChevronRight, 
  LogOut,
  Home,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import ChatBot from './ChatBot';
import AdminPanel from './AdminPanel';

const HomePage = ({ userData, onLogout }) => {
  const { username } = useParams(); 
  const navigate = useNavigate();
  
  const [profileOwnerData, setProfileOwnerData] = useState(null);
  const [profileOwnerName, setProfileOwnerName] = useState('');
  const [isProfileOwnerLoaded, setIsProfileOwnerLoaded] = useState(false);
  
  const [presentUserName, setPresentUserName] = useState('');
  const [presentUserData, setPresentUserData] = useState(null);
  const [isPresentUserAuthenticated, setIsPresentUserAuthenticated] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showChatBot, setShowChatBot] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showUserNotFoundModal, setShowUserNotFoundModal] = useState(false);

  const backgroundBubbles = useMemo(() => {
    return [...Array(20)].map((_, i) => ({
      id: i,
      width: Math.random() * 300 + 50,
      height: Math.random() * 300 + 50,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      yMovement: Math.random() * 30 - 15,
      xMovement: Math.random() * 30 - 15,
      duration: Math.random() * 10 + 10,
    }));
  }, []);

   const fetchProfileOwner = async (username) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND}/verify-user/${username}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const data = await response.json();
      if (response.ok) {
        setProfileOwnerData(data);
        setProfileOwnerName(data.user?.name || username);
        setIsProfileOwnerLoaded(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error fetching profile owner data:', error);
      return false;
    }
  };

   const fetchPresentUser = async (username) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND}/verify-user/${username}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const data = await response.json();
      if (response.ok) {
        setPresentUserData(data);
        sessionStorage.setItem('presentUserData', JSON.stringify(data));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error fetching present user data:', error);
      return false;
    }
  };

  useEffect(() => {
    if (username) {
      fetchProfileOwner(username);
    } else if (userData) {
      setProfileOwnerData(userData);
      setProfileOwnerName(userData.user?.name || '');
      setIsProfileOwnerLoaded(true);
    }
    
    const storedPresentUser = sessionStorage.getItem('presentUserName');
    if (storedPresentUser) {
      setPresentUserName(storedPresentUser);
      const storedPresentUserData = sessionStorage.getItem('presentUserData');
      if (storedPresentUserData) {
        setPresentUserData(JSON.parse(storedPresentUserData));
        setIsPresentUserAuthenticated(true);
      }
    }
  }, [username, userData]);

  const handlePresentUserSubmit = async (e) => {
    e.preventDefault();
    
    if (!presentUserName.trim()) {
      setErrorMessage('Please enter your ChatMate username');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const userExists = await fetchPresentUser(presentUserName.trim());
      
      if (userExists) {
        sessionStorage.setItem('presentUserName', presentUserName.trim());
        setIsPresentUserAuthenticated(true);
      } else {
        setShowUserNotFoundModal(true);
      }
    } catch (error) {
      console.error('Error validating present username:', error);
      setErrorMessage('Error validating username. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetStarted = () => {
    setShowChatBot(true);
  };

  const refetchUserData = async () => {
    try {
      const savedUsername = sessionStorage.getItem('presentUserName');
      
      if (!savedUsername) {
        throw new Error('No username found');
      }

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND}/verify-user/${savedUsername}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem('presentUserData', JSON.stringify(data));
        setPresentUserData(data);
        return data;
      } else {
        throw new Error(data.message || 'Failed to refetch user data');
      }
    } catch (error) {
      console.error('Error refetching user data:', error);
      throw error;
    }
  };

  const continueWithoutAccount = () => {
    sessionStorage.setItem('presentUserName', presentUserName.trim());
    setShowUserNotFoundModal(false);
    setIsPresentUserAuthenticated(true);
  };

  const tryDifferentUsername = () => {
    setShowUserNotFoundModal(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('presentUserName');
    sessionStorage.removeItem('presentUserData');
    if (onLogout) {
      onLogout();
    }
    setIsPresentUserAuthenticated(false);
    setShowChatBot(false);
    setPresentUserData(null);
    setPresentUserName('');
  };

  const navigateToHome = () => {
    navigate('/');
  };

  const renderHomeButton = () => (
    <button
      type="button"
      onClick={() => setShowAdminPanel(true)}
      className="text-white bg-blue-600 hover:bg-blue-700 p-2 rounded-full flex items-center justify-center cursor-pointer shadow-lg"
    >
      <Home className="w-5 h-5" />
    </button>
  );

  const renderUserNotFoundModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700"
      >
        <div className="flex items-center justify-center mb-4 text-red-500">
          <AlertCircle className="w-12 h-12" />
        </div>
        <h3 className="text-xl font-bold text-center mb-3">Username Not Found</h3>
        <p className="text-gray-300 text-center mb-6">
          The username "{presentUserName}" is not registered on ChatMate. Please register at{" "}
          <a 
            href="https://chat-matee.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            chat-matee.vercel.app
          </a>{" "}
          to use features like Task scheduling, or continue without an account.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={tryDifferentUsername}
            className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Try Different Username
          </button>
          <button
            onClick={continueWithoutAccount}
            className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            Continue Without Account
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  const chatBotView = (
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-slate-500 to-slate-800 relative">
       <div className="absolute top-4 left-4 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={navigateToHome}
          className="text-white bg-blue-600 hover:bg-blue-700 p-2 rounded-full flex items-center justify-center cursor-pointer shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
      </div>
      
      <ChatBot
        userName={presentUserName} 
        userData={profileOwnerData}
        onRefetchUserData={refetchUserData}  
        presentUserData={presentUserData}
      />
      <div className="absolute top-4 right-4 flex gap-3">
        {renderHomeButton()}
        <button
          type="button"
          onClick={handleLogout}
          className="text-white bg-red-500 hover:bg-red-600 p-2 rounded-full flex items-center justify-center cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
      
      {showAdminPanel && (
        <AdminPanel 
          userData={profileOwnerData} 
          onClose={() => setShowAdminPanel(false)} 
        />
      )}
    </div>
  );
  
  const homeView = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          {backgroundBubbles.map((bubble) => (
            <motion.div
              key={bubble.id}
              className="absolute rounded-full bg-blue-500 opacity-10"
              style={{
                width: bubble.width,
                height: bubble.height,
                left: bubble.left,
                top: bubble.top,
              }}
              animate={{
                y: [0, bubble.yMovement],
                x: [0, bubble.xMovement],
              }}
              transition={{
                duration: bubble.duration,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          ))}
        </div>
      </div>
      
       <div className="absolute top-4 left-4 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={navigateToHome}
          className="text-white bg-blue-600 hover:bg-blue-700 p-2 rounded-full flex items-center justify-center cursor-pointer shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
      </div>
      
      <div className="absolute top-4 right-4 z-50">
        {renderHomeButton()}
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
            {profileOwnerName ? `${profileOwnerName}'s AI Assistant` : "AI Assistant"}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto"
          >
            {profileOwnerName 
              ? `Get answers to all your questions about ${profileOwnerName}'s projects, experience, and skills`
              : "Get answers to all your questions about projects, experience, and skills"}
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12"
        >
          {[
            { icon: <MessageSquare className="w-8 h-8" />, title: "Instant Responses", desc: "Get immediate answers to your questions" },
            { icon: <Sparkles className="w-8 h-8" />, title: "AI Powered", desc: "Powered by advanced AI technology" },
            { icon: <User className="w-8 h-8" />, title: "Personalized", desc: "Tailored responses about your queries" }
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
          {!isPresentUserAuthenticated ? (
            <>
              <h2 className="text-2xl font-bold mb-6 text-center">Enter your ChatMate username</h2>
              <form onSubmit={handlePresentUserSubmit} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={presentUserName}
                    onChange={(e) => setPresentUserName(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg py-3 px-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Your ChatMate username"
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
                Hello, <span className="text-blue-400">{presentUserData?.user?.name || presentUserName}</span>!
              </h2>
              <p className="text-gray-300">
                Ready to start chatting with{profileOwnerName ? ` ${profileOwnerName}'s` : ""} AI Assistant?
              </p>
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
        
        {showAdminPanel && (
          <AdminPanel 
            userData={presentUserData} 
            onClose={() => setShowAdminPanel(false)} 
          />
        )}

        {showUserNotFoundModal && renderUserNotFoundModal()}
      </div>
    </motion.div>
  );

  return showChatBot ? chatBotView : homeView;
};

HomePage.propTypes = {
  userData: PropTypes.shape({
    user: PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
      username: PropTypes.string
    })
  }),
  onLogout: PropTypes.func
};

export default HomePage;
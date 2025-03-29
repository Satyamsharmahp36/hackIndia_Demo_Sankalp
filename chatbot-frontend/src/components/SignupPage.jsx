import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  Eye, 
  EyeOff, 
  Info,
  CheckCircle,
  ArrowRight,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNo: '',
    username: '',
    password: '',
    confirmPassword: '',
    geminiApiKey: ''
  });

  // Enhanced UI State
  const [uiState, setUiState] = useState({
    showPassword: false,
    showGeminiKeyModal: false,
    showSuccessModal: false,
    activeField: null,
    loading: false,
    globalError: null
  });

  // Centralized error state
  const [errors, setErrors] = useState({});

  // Animation Configurations
  const inputVariants = {
    initial: { 
      opacity: 0, 
      x: -20,
      scale: 0.95 
    },
    animate: (index) => ({
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: {
        delay: index * 0.1,
        type: 'spring',
        stiffness: 300
      }
    }),
    hover: {
      scale: 1.02,
      boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
    }
  };

  const backgroundVariants = {
    initial: { 
      backgroundPosition: '0% 50%',
      backgroundSize: '200% 200%'
    },
    animate: {
      backgroundPosition: ['0% 50%', '100% 50%'],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  };

  // Advanced Form Validation
  const validateForm = useCallback(() => {
    const newErrors = {};
    const validationRules = {
      name: (value) => !value.trim() && "Name is required",
      email: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !value.trim() ? "Email is required" : 
               !emailRegex.test(value) ? "Invalid email format" : false;
      },
      mobileNo: (value) => {
        const mobileRegex = /^[0-9]{10}$/;
        return !value.trim() ? "Mobile number is required" : 
               !mobileRegex.test(value) ? "Invalid mobile number (10 digits)" : false;
      },
      username: (value) => {
        return !value.trim() ? "Username is required" : 
               value.length < 4 ? "Username must be at least 4 characters" : false;
      },
      password: (value) => {
        return !value ? "Password is required" : 
               value.length < 8 ? "Password must be at least 8 characters" : false;
      },
      confirmPassword: (value) => {
        return value !== formData.password ? "Passwords do not match" : false;
      },
      geminiApiKey: (value) => !value.trim() && "Gemini API key is required"
    };

    Object.keys(validationRules).forEach(field => {
      const errorMessage = validationRules[field](formData[field]);
      if (errorMessage) newErrors[field] = errorMessage;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Input Change Handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setUiState(prev => ({...prev, globalError: null, loading: true}));

    if (validateForm()) {
      try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND}/register`, {
          name: formData.name,
          email: formData.email,
          mobileNo: formData.mobileNo,
          username: formData.username,
          password: formData.password,
          geminiApiKey: formData.geminiApiKey
        });

        localStorage.setItem('userId', response.data.userId);
        setUiState(prev => ({...prev, showSuccessModal: true, loading: false}));
      } catch (error) {
        setUiState(prev => ({
          ...prev, 
          globalError: error.response?.data?.message || 'Registration failed',
          loading: false
        }));
      }
    } else {
      setUiState(prev => ({...prev, loading: false}));
    }
  };

  // Utility Functions
  const openGeminiKeyGuide = () => {
    window.open('https://aistudio.google.com/apikey', '_blank');
  };

  const handleRedirectToContent = () => {
    window.open('https://chatoomate.vercel.app/', '_blank');
  };

  // Render Input Fields
  const renderInputField = (field, index) => {
    const fieldConfig = {
      name: { label: "Full Name", type: "text" },
      email: { label: "Email Address", type: "email" },
      mobileNo: { label: "Mobile Number", type: "tel" },
      username: { label: "Unique Username", type: "text" },
      password: { label: "Password", type: uiState.showPassword ? "text" : "password" },
      confirmPassword: { label: "Confirm Password", type: uiState.showPassword ? "text" : "password" },
      geminiApiKey: { label: "Gemini API Key ", type: "text" }
    };

    return (
      <motion.div
        key={field}
        custom={index}
        variants={inputVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
      >
        <div className="relative">
          <input 
            type={fieldConfig[field].type}
            name={field}
            placeholder={fieldConfig[field].label}
            value={formData[field]}
            onChange={handleChange}
            onFocus={() => setUiState(prev => ({...prev, activeField: field}))}
            onBlur={() => setUiState(prev => ({...prev, activeField: null}))}
            className={`w-full p-3.5 rounded-xl 
              ${uiState.activeField === field 
                ? 'ring-2 ring-purple-500/70 bg-gray-700/70' 
                : 'bg-gray-700/50'}
              ${errors[field] 
                ? 'border-2 border-red-500' 
                : 'border-transparent'}
              transition-all duration-300 ease-in-out`}
          />
          {field === 'password' && (
            <button 
              type="button"
              onClick={() => setUiState(prev => ({...prev, showPassword: !prev.showPassword}))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {uiState.showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
          {field === 'geminiApiKey' && (
            <motion.button 
              type="button"
              onClick={() => setUiState(prev => ({...prev, showGeminiKeyModal: true}))}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 
                text-blue-200 hover:text-blue-300 
                animate-pulse hover:animate-none"
            >
              <Info size={25} />
            </motion.button>
          )}
        </div>
        {errors[field] && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm mt-2 pl-2 flex items-center"
          >
            <Check size={16} className="mr-2" /> {errors[field]}
          </motion.p>
        )}
      </motion.div>
    );
  };

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      variants={backgroundVariants}
      className="min-h-screen md:min-h-[90vh] bg-gradient-to-br from-gray-900 via-black to-indigo-900 
      text-white flex items-center justify-center p-4 overflow-hidden relative"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-md bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-purple-500/20 relative"
      >
        <motion.div 
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute top-2 right-2 text-purple-400"
        >
          <Sparkles size={20} />
        </motion.div>

        <h2 className="text-3xl font-bold text-center mb-6 bg-clip-text text-transparent 
        bg-gradient-to-r from-blue-500 to-purple-600 tracking-wider">
          Create Account
        </h2>

        {uiState.globalError && (
          <div className="bg-red-500/20 border border-red-500 p-2 rounded-xl mb-3 flex items-center">
            <AlertTriangle className="mr-2 text-red-500" size={18} />
            <p className="text-red-300 text-sm">{uiState.globalError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {['name', 'email', 'mobileNo', 'username', 'password', 'confirmPassword', 'geminiApiKey'].map(renderInputField)}

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)' }}
            whileTap={{ scale: 0.95 }}
            disabled={uiState.loading}
            className="w-full p-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 
            font-bold text-base
            hover:from-blue-700 hover:to-purple-700 
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-300 ease-in-out
            flex items-center justify-center space-x-2"
          >
            {uiState.loading ? 'Processing...' : 'Create Account'}
            {!uiState.loading && <ArrowRight size={18} />}
          </motion.button>
        </form>
      </motion.div>

      {/* Gemini API Key Guide Modal */}
      <AnimatePresence>
        {uiState.showGeminiKeyModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full space-y-6 shadow-2xl border border-blue-500/30"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                  Gemini API Key Guide
                </h3>
                <button 
                  onClick={() => setUiState(prev => ({...prev, showGeminiKeyModal: false}))}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-gray-300">
                <div className="bg-gray-700/50 p-4 rounded-xl">
                  <h4 className="text-xl font-semibold text-blue-400 mb-2">
                    What is a Gemini API Key?
                  </h4>
                  <p>
                    A Gemini API Key is a unique authentication token that allows you to access Google's Gemini AI services. 
                    This key enables your application to interact with advanced AI capabilities.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-700/50 p-4 rounded-xl">
                    <h4 className="text-lg font-semibold text-green-400 mb-2">
                      Why You Need It
                    </h4>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Access advanced AI functionalities</li>
                      <li>Enable personalized AI interactions</li>
                      <li>Secure and authenticated API requests</li>
                    </ul>
                  </div>

                  <div className="bg-gray-700/50 p-4 rounded-xl">
                    <h4 className="text-lg font-semibold text-purple-400 mb-2">
                      How to Obtain
                    </h4>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Visit <a 
                        href="https://aistudio.google.com/apikey" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-400 underline hover:text-blue-300"
                      >
                        Google AI Studio
                      </a></li>
                      <li>Sign in with your Google account</li>
                      <li>Click "Create API Key"</li>
                      <li>Copy the generated key</li>
                    </ol>
                  </div>
                </div>

                <div className="bg-yellow-500/20 border border-yellow-500 p-4 rounded-xl flex items-center">
                  <Info className="mr-3 text-yellow-500" size={24} />
                  <p>
                    <strong>Important:</strong> Keep your API key confidential. 
                    Do not share it publicly or commit it to version control.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openGeminiKeyGuide}
                  className="px-6 py-3 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 
                  flex items-center space-x-2 font-semibold"
                >
                  <span>Open AI Studio</span>
                  <ArrowRight size={20} />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUiState(prev => ({...prev, showGeminiKeyModal: false}))}
                  className="px-6 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 font-semibold"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {uiState.showSuccessModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl border border-green-500/30"
            >
              <div className="flex justify-center mb-4">
                <CheckCircle 
                  size={80} 
                  className="text-green-500 animate-pulse"
                />
              </div>
              
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                Registration Successful!
              </h2>
              
              <div className="bg-gray-700/50 p-4 rounded-xl text-left">
                <p className="text-gray-300 mb-2">
                  Your account has been created successfully. 
                </p>
                <div className="flex items-center space-x-2 text-blue-300">
                  <Info size={20} />
                  <p>Next Step: Click the button below to access your content platform</p>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRedirectToContent}
                className="w-full p-3 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 
                text-white font-bold flex items-center justify-center space-x-2
                hover:from-green-600 hover:to-blue-600"
              >
                <span>Enter Content Platform</span>
                <ArrowRight size={20} />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SignupPage;
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
  // Form state management
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
    
    // Clear specific field error on change
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Form Submission Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset global error
    setUiState(prev => ({...prev, globalError: null, loading: true}));

    if (validateForm()) {
      try {
        const response = await axios.post('http://localhost:5000/register', {
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
      geminiApiKey: { label: "Gemini API Key", type: "text" }
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
      className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-indigo-900 
      text-white flex items-center justify-center p-4 overflow-hidden relative"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-md bg-gray-800/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-purple-500/20 relative"
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
          className="absolute top-4 right-4 text-purple-400"
        >
          <Sparkles size={24} />
        </motion.div>

        <h2 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent 
        bg-gradient-to-r from-blue-500 to-purple-600 tracking-wider">
          Create Your Account
        </h2>

        {uiState.globalError && (
          <div className="bg-red-500/20 border border-red-500 p-3 rounded-xl mb-4 flex items-center">
            <AlertTriangle className="mr-2 text-red-500" />
            <p className="text-red-300">{uiState.globalError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {['name', 'email', 'mobileNo', 'username', 'password', 'confirmPassword', 'geminiApiKey'].map(renderInputField)}

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)' }}
            whileTap={{ scale: 0.95 }}
            disabled={uiState.loading}
            className="w-full p-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 
            font-bold text-lg
            hover:from-blue-700 hover:to-purple-700 
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-300 ease-in-out
            flex items-center justify-center space-x-2"
          >
            {uiState.loading ? 'Processing...' : 'Create Account'}
            {!uiState.loading && <ArrowRight size={20} />}
          </motion.button>
        </form>
      </motion.div>

      {/* Gemini API Key Modal */}
      <AnimatePresence>
        {uiState.showGeminiKeyModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-800 rounded-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-2xl font-bold mb-4">How to Get Gemini API Key</h3>
              <ol className="space-y-2 mb-6 list-decimal list-inside text-gray-300">
                <li>Visit <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">AI Studio</a></li>
                <li>If first-time user, approve privacy requests</li>
                <li>Click on "Create API Key"</li>
                <li>Copy the generated key</li>
                <li>Paste the key in the registration form</li>
              </ol>
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={openGeminiKeyGuide}
                  className="px-4 py-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30"
                >
                  Open AI Studio
                </button>
                <button 
                  onClick={() => setUiState(prev => ({...prev, showGeminiKeyModal: false}))}
                  className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                >
                  Close
                </button>
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
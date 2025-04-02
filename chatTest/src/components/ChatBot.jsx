import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2,MessageCircle ,LightbulbIcon , ExternalLink, Settings,ChevronDown , X,Trash2, Save, Lock, Unlock, AlertTriangle, Filter, Plus, CheckCircle, XCircle, Clock ,Info, HelpCircle } from 'lucide-react';
import { getAnswer } from '../services/ai';
import { motion, AnimatePresence } from 'framer-motion';


const apiService = {
  getPrompt: async (userId) => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND}/prompt/${userId}`);
    const data = await response.json();
    return data.prompt;
  },

  getUserPrompt: async (userId) => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND}/user-prompt/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data.prompt;
  },
  
  updateUserPrompt: async (content, userId) => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND}/update-user-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, userId }),
    });
    return await response.json();
  },
  
  clearUserPrompt: async (userId) => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND}/update-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: '', userId }),
    });
    return await response.json();
  },
  
  updatePrompt: async (content, userId) => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND}/update-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, userId }),
    });
    return await response.json();
  },
  
  submitContribution: async (name, question, answer, username ) => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND}/contributions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, question, answer, username  }),
    });
    return await response.json();
  },
  
  getContributions: async (userId, status = null) => {
    let url = `${import.meta.env.VITE_BACKEND}/contributions/${userId}`;
    if (status) {
      url += `?status=${status}`;
    }
    const response = await fetch(url);
    return await response.json();
  },
  
  updateContributionStatus: async (contributionId, status, username) => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND}/contributions/${contributionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        status, 
        username   
      }),
    });
    return await response.json();
  }
};




const ContributionForm = ({ isOpen, onClose, lastQuestion }) => {
  const [name, setName] = useState(() => {
    return sessionStorage.getItem('userName') || '';
  });
  const [question, setQuestion] = useState(lastQuestion || '');
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitStatus, setSubmitStatus] = useState(''); 
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !question.trim() || !answer.trim()) {
      setSubmitMessage('Please fill all fields');
      setSubmitStatus('error');
      setTimeout(() => setSubmitMessage(''), 3000);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const result = await apiService.submitContribution(name, question, answer, localStorage.getItem('verifiedUserId') );
      setSubmitMessage(result.message);
      setSubmitStatus('success');
      setTimeout(() => {
        if (submitStatus === 'success') {
          onClose();
        }
      }, 2000);
    } catch (error) {
      setSubmitMessage('Failed to submit contribution');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 overflow-y-auto backdrop-blur-sm flex items-center justify-center z-40 p-4">
      <div className="min-h-screen py-8 flex items-center justify-center w-full">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl border border-blue-500 w-full max-w-md overflow-hidden flex flex-col"
        >
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-5 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Plus className="w-5 h-5 mr-2 text-white" />
              Knowledge Contribution
            </h2>
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors bg-blue-700 rounded-full p-2"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
          
          <div className="bg-blue-900 bg-opacity-30 border-b border-blue-500 px-6 py-3 flex items-start">
            <Info className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-blue-200 text-sm">
              Help improve this AI by contributing your knowledge. Your submissions will be reviewed before being added to the assistant's knowledge base.
            </p>
          </div>
          
          <div className="overflow-y-auto max-h-[calc(100vh-250px)]" style={{ scrollbarWidth: 'thin', scrollbarColor: '#4B5563 #111827' }}>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {submitMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${
                    submitStatus === 'success' 
                      ? 'bg-green-900 bg-opacity-20 border border-green-500 text-green-300' 
                      : 'bg-red-900 bg-opacity-20 border border-red-500 text-red-300'
                  } rounded-lg p-3 flex items-center shadow-lg`}
                >
                  {submitStatus === 'success' ? (
                    <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                  )}
                  {submitMessage}
                </motion.div>
              )}
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Your Name</label>
                <div className="relative">
                  <User className="w-5 h-5 text-gray-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white shadow-inner"
                    placeholder="Enter your name"
                    disabled={sessionStorage.getItem('userName')}
                  />
                </div>
                {sessionStorage.getItem('userName') && (
                  <p className="text-xs text-gray-400 mt-1 ml-2">Name auto-filled from your homepage entry</p>
                )}
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Question</label>
                <div className="relative">
                  <HelpCircle className="w-5 h-5 text-gray-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full pl-10 pr-4 text-lg py-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white shadow-inner"
                    placeholder="What question would you like to answer ?"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Your Contribution</label>
                <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden shadow-inner">
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="w-full text-lg p-4 bg-transparent focus:outline-none text-white h-32 resize-none"
                    placeholder="Share correct information or additional details that would improve the AI's knowledge..."
                  />
                  <div className="bg-gray-800 border-t border-gray-700 px-4 py-1 flex justify-between text-xs text-gray-400">
                    <span>Be clear, concise, and accurate</span>
                    <span>{answer.length} characters</span>
                  </div>
                </div>
              </div>
            </form>
          </div>
  
          <div className="p-6 pt-2 bg-gray-900 border-t border-gray-800">
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-5 h-5 text-white" />
                </motion.div>
              ) : (
                <Send className="w-5 h-5 text-white" />
              )}
              <span>Submit Contribution</span>
            </motion.button>
            
            <div className="pt-2 flex justify-center">
              <p className="text-xs text-gray-500 text-center max-w-sm">
                By submitting, you agree that your contribution may be used to improve the AI assistant's responses.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};



const MessageContent = ({ content }) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const convertUrlsToLinks = (text) => {
    return text.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        const linkText = part.includes('linkedin.com') 
          ? 'LinkedIn Profile' 
          : 'Link';
        
        return (
          <a 
            key={index} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-400 hover:underline"
          >
            {linkText}
          </a>
        );
      }
      return part;
    });
  };

  return <div>{convertUrlsToLinks(content)}</div>;
};

const TypingEffect = ({ text }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prevText => prevText + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, 15); 
      
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text]);
  
  return <>{displayText}</>;
};


const AdminModal = ({ isOpen, onClose, onPromptUpdated, password }) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [promptContent, setPromptContent] = useState('');
  const [responseStyleContent, setResponseStyleContent] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('prompt'); 
  const [contributions, setContributions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  
  const checkPassword = () => {
    if (passwordInput === password) {
      setAuthenticated(true);
      fetchPrompt();
      fetchResponseStyle(); 
      fetchContributions();
    } else {
      setError('Invalid password');
      setTimeout(() => setError(''), 3000);
    }
  };
  
  const fetchPrompt = async () => {
    setIsLoading(true);
    try {
      const promptData = await apiService.getPrompt(localStorage.getItem('verifiedUserId'));
      setPromptContent(promptData || '');
    } catch (err) {
      setError('Failed to fetch prompt');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchResponseStyle = async () => {
    setIsLoading(true);
    try {
      const styleData = await apiService.getUserPrompt(localStorage.getItem('verifiedUserId'));
      setResponseStyleContent(styleData || '');
    } catch (err) {
      setError('Failed to fetch response style');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchContributions = async (status = '') => {
    setIsLoading(true);
    try {
      const data = await apiService.getContributions(localStorage.getItem('verifiedUserId'), status || null);
      setContributions(data);
    } catch (err) {
      setError('Failed to fetch contributions');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };
  
  const updatePrompt = async () => {
    setIsLoading(true);
    try {
      await apiService.updatePrompt(promptContent, localStorage.getItem('verifiedUserId'));
      setSuccessMessage('Prompt updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      onPromptUpdated();
    } catch (err) {
      setError('Failed to update prompt');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const updateResponseStyle = async () => {
    setIsLoading(true);
    try {
      const userId = localStorage.getItem('verifiedUserId');
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      await apiService.updateUserPrompt(responseStyleContent, userId);
      
      setSuccessMessage('Response style updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      if (typeof onPromptUpdated === 'function') {
        onPromptUpdated();
      }
    } catch (err) {
      console.error('Error updating response style:', err);
      setError(`Failed to update response style: ${err.message || 'Unknown error'}`);
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearPrompt = async () => {
    if (window.confirm('Are you sure you want to clear the prompt?')) {
      setIsLoading(true);
      try {
        await apiService.clearPrompt();
        setPromptContent('');
        setSuccessMessage('Prompt cleared successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
        onPromptUpdated();
      } catch (err) {
        setError('Failed to clear prompt');
        setTimeout(() => setError(''), 3000);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const clearResponseStyle = async () => {
    if (window.confirm('Are you sure you want to clear the response style?')) {
      setIsLoading(true);
      try {
        const userId = localStorage.getItem('verifiedUserId');
        if (!userId) {
          throw new Error('User ID not found');
        }
        
        await apiService.clearUserPrompt(userId);
        setResponseStyleContent('');
        setSuccessMessage('Response style cleared successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
        
        if (typeof onPromptUpdated === 'function') {
          onPromptUpdated();
        }
      } catch (err) {
        console.error('Error clearing response style:', err);
        setError(`Failed to clear response style: ${err.message || 'Unknown error'}`);
        setTimeout(() => setError(''), 3000);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const updateContributionStatuse = async (id, status) => {
    setIsLoading(true);
    try {
      await apiService.updateContributionStatus(id, status, localStorage.getItem('verifiedUserId'));
      onPromptUpdated();
      fetchContributions(statusFilter);
      setSuccessMessage(`Contribution ${status}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to update contribution');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFilterChange = (status) => {
    setStatusFilter(status);
    fetchContributions(status);
  };
  
  const handleClose = () => {
    setAuthenticated(false);
    setPasswordInput('');
    setPromptContent('');
    setResponseStyleContent('');
    setError('');
    setSuccessMessage('');
    setActiveTab('prompt');
    onClose();
  };
  
  useEffect(() => {
    if (authenticated) {
      fetchContributions(statusFilter);
    }
  }, [statusFilter, authenticated]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl border border-blue-500 w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-5 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white flex items-center">
            {authenticated ? 
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <Unlock className="w-6 h-6 mr-3 text-white" />
              </motion.div> : 
              <Lock className="w-6 h-6 mr-3 text-white" />}
            Admin Dashboard
          </h2>
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors bg-blue-700 rounded-full p-2"
          >
            <X className="w-6 h-6" />
          </motion.button>
        </div>
        
        <div className="flex-1 overflow-hidden flex flex-col">
          {!authenticated ? (
            <div className="p-8 space-y-6 flex flex-col items-center overflow-y-auto">
              <motion.div 
                animate={{ 
                  boxShadow: ["0 0 0 rgba(59, 130, 246, 0)", "0 0 15px rgba(59, 130, 246, 0.5)", "0 0 0 rgba(59, 130, 246, 0)"] 
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="border-2 border-blue-500 p-6 rounded-xl bg-blue-900 bg-opacity-20 max-w-md w-full"
              >
                <motion.div className="flex justify-center mb-6">
                  <Lock className="w-16 h-16 text-blue-400" />
                </motion.div>
                <p className="text-blue-300 text-center text-lg mb-2">
                  Administrator Access Required
                </p>
                <p className="text-gray-400 text-center text-sm">
                  Please enter your admin credentials to continue
                </p>
              </motion.div>
              
              <div className="space-y-4 w-full max-w-md">
                <div className="space-y-2">
                  <label className="block text-gray-300 text-sm font-medium">Admin Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full p-4 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white pl-10"
                      placeholder="Enter admin password"
                    />
                    <Lock className="w-5 h-5 text-gray-500 absolute left-3 top-4" />
                  </div>
                </div>
                
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-900 bg-opacity-20 border border-red-500 rounded-lg p-3 text-red-300 flex items-center"
                  >
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                    {error}
                  </motion.div>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={checkPassword}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg hover:shadow-blue-500/30 font-medium flex items-center justify-center space-x-2"
                >
                  <Unlock className="w-5 h-5" />
                  <span>Authenticate</span>
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex border-b border-gray-700 bg-gray-800 px-4">
                <button
                  onClick={() => setActiveTab('prompt')}
                  className={`px-6 py-4 text-sm font-medium transition-all ${
                    activeTab === 'prompt'
                      ? 'border-b-2 border-blue-500 text-blue-400 bg-gray-900 bg-opacity-30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700 hover:bg-opacity-30'
                  } rounded-t-lg`}
                >
                  <div className="flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>System Prompt</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('responseStyle')}
                  className={`px-6 py-4 text-sm font-medium transition-all ${
                    activeTab === 'responseStyle'
                      ? 'border-b-2 border-blue-500 text-blue-400 bg-gray-900 bg-opacity-30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700 hover:bg-opacity-30'
                  } rounded-t-lg`}
                >
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>Response Style</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('contributions')}
                  className={`px-6 py-4 text-sm font-medium transition-all ${
                    activeTab === 'contributions'
                      ? 'border-b-2 border-blue-500 text-blue-400 bg-gray-900 bg-opacity-30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700 hover:bg-opacity-30'
                  } rounded-t-lg`}
                >
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>User Contributions</span>
                  </div>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 relative">
                {isLoading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="p-3 rounded-full bg-blue-900 bg-opacity-50"
                    >
                      <Loader2 className="w-10 h-10 text-blue-400" />
                    </motion.div>
                  </div>
                )}
                
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-900 bg-opacity-20 border-l-4 border-red-500 rounded-lg p-4 text-red-300 mb-6 flex items-center"
                  >
                    <AlertTriangle className="w-6 h-6 mr-3 text-red-400 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-red-300">Error</h4>
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  </motion.div>
                )}
                
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-900 bg-opacity-20 border-l-4 border-green-500 rounded-lg p-4 text-green-300 mb-6 flex items-center"
                  >
                    <CheckCircle className="w-6 h-6 mr-3 text-green-400 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-green-300">Success</h4>
                      <p className="text-sm text-green-400">{successMessage}</p>
                    </div>
                  </motion.div>
                )}
                
                {activeTab === 'prompt' ? (
                  <div className="space-y-6">
                    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-lg">
                      <div className="bg-gray-900 px-4 py-3 border-b border-gray-700 flex justify-between items-center">
                        <h3 className="text-white font-medium flex items-center">
                          <Bot className="w-5 h-5 mr-2 text-blue-400" />
                          User Data
                        </h3>
                        <div className="flex items-center text-xs text-gray-400">
                          <Clock className="w-4 h-4 mr-1" />
                          Last updated: Today
                        </div>
                      </div>
                      <div className="p-1">
                        <textarea
                          value={promptContent}
                          onChange={(e) => setPromptContent(e.target.value)}
                          className="w-full p-3 bg-gray-800 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-lg h-64 resize-none font-mono text-sm"
                          placeholder="Enter your Data here..."
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={updatePrompt}
                        disabled={isLoading}
                        className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all font-medium flex items-center justify-center"
                      >
                        <Save className="w-5 h-5 mr-2" />
                        <span>Save Changes</span>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={clearPrompt}
                        disabled={isLoading}
                        className="py-4 px-6 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-700 hover:to-red-600 shadow-lg hover:shadow-red-500/30 transition-all font-medium flex items-center justify-center"
                      >
                        <X className="w-5 h-5 mr-2" />
                        <span>Clear</span>
                      </motion.button>
                    </div>
                  </div>
                ) : activeTab === 'responseStyle' ? (
                  <div className="space-y-6">
                    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-lg">
                      <div className="bg-gray-900 px-4 py-3 border-b border-gray-700 flex justify-between items-center">
                        <h3 className="text-white font-medium flex items-center">
                          <MessageCircle className="w-5 h-5 mr-2 text-purple-400" />
                          Response Style Configuration
                        </h3>
                        <div className="flex items-center text-xs text-gray-400">
                          <Clock className="w-4 h-4 mr-1" />
                          Last updated: Today
                        </div>
                      </div>

                      <div className="p-2 bg-gray-900 bg-opacity-50">
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-sm text-gray-300 mb-3">
                          <div className="flex items-start mb-2">
                            <Info className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                            <p>Define how you want the AI model to respond. You specific behaviors like being funny, concise, or strict about certain topics.</p>
                          </div>
                        </div>
                        <textarea
                          value={responseStyleContent}
                          onChange={(e) => setResponseStyleContent(e.target.value)}
                          className="w-full p-3 bg-gray-800 text-white focus:outline-none focus:ring-1 focus:ring-purple-500 rounded-lg h-48 resize-none font-mono text-sm border border-gray-700"
                          placeholder="Define how you want the AI to respond (e.g., funny, precise, strict, etc.)..."
                        />
                      </div>
                    </div>
                    <div className="flex space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={updateResponseStyle}
                        disabled={isLoading}
                        className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg shadow-lg hover:shadow-purple-500/30 transition-all font-medium flex items-center justify-center"
                      >
                        <Save className="w-5 h-5 mr-2" />
                        <span>{isLoading ? 'Saving...' : 'Save Response Style'}</span>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={clearResponseStyle}
                        disabled={isLoading}
                        className="py-4 px-6 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-700 hover:to-red-600 shadow-lg hover:shadow-red-500/30 transition-all font-medium flex items-center justify-center"
                      >
                        <X className="w-5 h-5 mr-2" />
                        <span>{isLoading ? 'Clearing...' : 'Clear'}</span>
                      </motion.button>
                    </div>

                    
                    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-lg">
                      <div className="bg-gray-900 px-4 py-3 border-b border-gray-700">
                        <h3 className="text-white font-medium flex items-center">
                          <Settings className="w-5 h-5 mr-2 text-purple-400" />
                          Quick Templates
                        </h3>
                      </div>
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          { name: "Professional", desc: "Formal, precise responses with authoritative tone" },
                          { name: "Friendly", desc: "Casual, warm tone with conversational style" },
                          { name: "Concise", desc: "Brief, direct responses without unnecessary details" },
                          { name: "Educational", desc: "Explanatory style with examples and definitions" },
                          { name: "Creative", desc: "Imaginative responses with metaphors and analogies" },
                          { name: "Technical", desc: "Detailed technical explanations with terminology" }
                        ].map((template, idx) => (
                          <motion.div
                            key={idx}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setResponseStyleContent(prevContent => 
                              `${template.name.toUpperCase()} STYLE: ${template.desc}. ${prevContent ? '\n\nAdditional instructions: ' + prevContent : ''}`
                            )}
                            className="bg-gray-900 border border-gray-700 hover:border-purple-500 rounded-lg p-3 cursor-pointer transition-all"
                          >
                            <div className="font-medium text-white mb-1">{template.name}</div>
                            <div className="text-sm text-gray-400">{template.desc}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg shadow-md">
                      <h3 className="text-lg font-medium text-white flex items-center">
                        <User className="w-5 h-5 mr-2 text-blue-400" />
                        User Contributions
                      </h3>
                      
                      <div className="relative group">
                        <div className="flex items-center space-x-3 bg-gray-900 rounded-full px-4 py-2 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
                          <Filter className="w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
                          <select
                            value={statusFilter}
                            onChange={(e) => handleFilterChange(e.target.value)}
                            className="bg-transparent border-none text-white focus:outline-none text-sm font-medium cursor-pointer appearance-none w-full"
                          >
                            <option value="">All Contributions</option>
                            <option value="pending">Pending Review</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {contributions.length === 0 ? (
                        <div className="text-center py-12 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700">
                          <motion.div 
                            animate={{ 
                              opacity: [0.5, 1, 0.5],
                              scale: [0.98, 1, 0.98]
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="flex justify-center mb-4"
                          >
                            <User className="w-16 h-16 text-gray-600" />
                          </motion.div>
                          <p className="text-gray-400 text-lg font-medium">No contributions found</p>
                          <p className="text-gray-500 text-sm mt-2">User submissions will appear here</p>
                        </div>
                      ) : (
                        contributions.map((contribution, index) => (
                          <motion.div 
                            key={contribution._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`border rounded-xl overflow-hidden shadow-lg ${
                              contribution.status === 'approved' 
                                ? 'border-green-600 bg-gradient-to-r from-gray-900 to-green-900 bg-opacity-10' 
                                : contribution.status === 'rejected'
                                  ? 'border-red-600 bg-gradient-to-r from-gray-900 to-red-900 bg-opacity-10'
                                  : 'border-yellow-600 bg-gradient-to-r from-gray-900 to-yellow-900 bg-opacity-10'
                            } ${index === contributions.length - 1 ? 'mb-4' : ''}`}
                          >
                            <div className="flex justify-between items-center p-4 border-b border-gray-700">
                              <div className="flex items-center space-x-3">
                                <div className="bg-blue-900 bg-opacity-30 rounded-full p-2">
                                  <User className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                  <span className="font-medium text-white">{contribution.name}</span>
                                  <div className="text-xs text-gray-400 mt-1">
                                    {new Date(contribution.createdAt).toLocaleDateString()} • 
                                    {new Date(contribution.createdAt).toLocaleTimeString()}
                                  </div>
                                </div>
                              </div>
                              <div>
                                <span 
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    contribution.status === 'approved' 
                                      ? 'bg-green-900 bg-opacity-30 text-green-300 border border-green-600' 
                                      : contribution.status === 'rejected'
                                        ? 'bg-red-900 bg-opacity-30 text-red-300 border border-red-600'
                                        : 'bg-yellow-900 bg-opacity-30 text-yellow-300 border border-yellow-600'
                                  }`}
                                >
                                  {contribution.status === 'approved' ? '✓ Approved' : 
                                  contribution.status === 'rejected' ? '× Rejected' : 
                                  '○ Pending'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="p-4 space-y-4">
                              <div className="border-l-4 border-blue-500 pl-4 py-1">
                                <div className="text-xs text-blue-400 mb-1 font-semibold uppercase tracking-wider">Question</div>
                                <div className="text-white">{contribution.question}</div>
                              </div>
                              
                              <div className="border-l-4 border-green-500 pl-4 py-1 bg-gray-800 bg-opacity-40 rounded-r-lg">
                                <div className="text-xs text-green-400 mb-1 font-semibold uppercase tracking-wider">Contribution</div>
                                <div className="text-white whitespace-pre-wrap">{contribution.answer}</div>
                              </div>
                            </div>
                            
                            <div className="bg-gray-700 bg-opacity-50 p-3 flex justify-end space-x-3 border-t border-gray-700">
                              {contribution.status === 'pending' && (
                                <>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => updateContributionStatuse(contribution._id, 'approved')}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 shadow-lg hover:shadow-green-500/20"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Approve</span>
                                  </motion.button>
                                  
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => updateContributionStatuse(contribution._id, 'rejected')}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 shadow-lg hover:shadow-red-500/20"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    <span>Reject</span>
                                  </motion.button>
                                </>
                              )}
                              
                              {contribution.status !== 'pending' && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => updateContributionStatuse(contribution._id, 'pending')}
                                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2 shadow-lg"
                                >
                                  <Clock className="w-4 h-4" />
                                  <span>Reset to Pending</span>
                                </motion.button>
                              )}
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                    
                    {contributions.length > 5 && (
                      <div className="flex justify-center py-3 mt-2 bg-gray-800 bg-opacity-30 rounded-lg">
                        <motion.div
                          animate={{ 
                            rotate: 360,
                          }}
                          transition={{ 
                            duration: 1.5, 
                            repeat: Infinity, 
                            ease: "linear" 
                          }}
                        >
                          <RefreshCw className="w-6 h-6 text-blue-400" />
                        </motion.div>
                        <span className="ml-2 text-gray-400">Loading more...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const ChatBot = ({ userName, userData, onRefetchUserData, presentUserData }) => {
  const chatHistoryKey = `${userName || 'anonymous'}_${userData.user.name}`;

  const [messages, setMessages] = useState(() => {
    const allChatHistories = JSON.parse(localStorage.getItem('chatHistories') || '{}');
    
    const userChatHistory = allChatHistories[chatHistoryKey] 
      ? allChatHistories[chatHistoryKey] 
      : [
          {
            type: 'bot',
            content: `Hi${userName ? ' ' + userName : ''}! I'm ${userData.user.name} AI assistant. Feel free to ask me about my projects, experience, or skills!`,
            timestamp: new Date().toISOString()
          }
        ];

    return userChatHistory;
  });
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showContributionForm, setShowContributionForm] = useState(false);
  const [promptUpdated, setPromptUpdated] = useState(false);
  const [lastQuestion, setLastQuestion] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const clearChatHistory = () => {
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDeleteHistory = () => {
    const allChatHistories = JSON.parse(localStorage.getItem('chatHistories') || '{}');
    delete allChatHistories[chatHistoryKey];
    localStorage.setItem('chatHistories', JSON.stringify(allChatHistories));

    const initialMessage = {
      type: 'bot',
      content: `Hi${userName ? ' ' + userName : ''}! I'm ${userData.user.name} AI assistant. Feel free to ask me about my projects, experience, or skills!`,
      timestamp: new Date().toISOString()
    };

    setMessages([initialMessage]);
    setShowDeleteConfirmation(false);
    setShowDeleteSuccessModal(true);

    setTimeout(() => {
      setShowDeleteSuccessModal(false);
    }, 3000);
  };

  useEffect(() => {
    if (!userName) {
      const storedName = sessionStorage.getItem('userName');
      if (storedName) {
        const updatedChatHistoryKey = `${storedName}_${userData.user.name}`;
        const allChatHistories = JSON.parse(localStorage.getItem('chatHistories') || '{}');
        
        if (allChatHistories[updatedChatHistoryKey]) {
          setMessages(allChatHistories[updatedChatHistoryKey]);
        } else if (messages.length === 1 && messages[0].type === 'bot') {
          setMessages([
            {
              type: 'bot',
              content: `Hi ${storedName}! I'm ${userData.user.name}'s AI assistant. Feel free to ask me about my projects, experience, or skills!`,
              timestamp: new Date().toISOString()
            }
          ]);
        }
      }
    }
  }, [userName, userData.user.name]);

  useEffect(() => {
    const allChatHistories = JSON.parse(localStorage.getItem('chatHistories') || '{}');
    
    if (allChatHistories[chatHistoryKey]) {
      setMessages(allChatHistories[chatHistoryKey]);
    }
  }, [chatHistoryKey]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      const allChatHistories = JSON.parse(localStorage.getItem('chatHistories') || '{}');
      allChatHistories[chatHistoryKey] = messages;
      localStorage.setItem('chatHistories', JSON.stringify(allChatHistories));
    }
  }, [messages, chatHistoryKey]);

  useEffect(() => {
    const handleResize = () => {
      scrollToBottom();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage = {
      type: 'user',
      content: input,
      timestamp: new Date().toISOString() 
    };

    setMessages(prev => [...prev, userMessage]);
    setLastQuestion(input);
    setInput('');
    setIsLoading(true);

    inputRef.current?.focus();

    try {
      const response = await getAnswer(input, userData.user, presentUserData ? presentUserData.user : null);
      
      const botMessage = {
        type: 'bot',
        content: response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting answer:', error);
      
      const errorMessage = {
        type: 'bot',
        content: "I'm sorry, I couldn't process your request. Please try again later.",
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const DeleteConfirmationModal = () => (
    <AnimatePresence>
      {showDeleteConfirmation && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-gray-800 p-6 rounded-lg text-white max-w-md w-full"
          >
            <h2 className="text-xl font-bold mb-4">Delete Chat History</h2>
            <p className="mb-6">Are you sure you want to delete your entire chat history? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => setShowDeleteConfirmation(false)}
                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDeleteHistory}
                className="px-4 py-2 bg-red-600 rounded hover:bg-red-500 transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePromptUpdated = async () => {
    try {
      await onRefetchUserData();
      
      setPromptUpdated(true);
      
      setTimeout(() => setPromptUpdated(false), 3000);
    } catch (error) {
      console.error('Error refetching user data:', error);
    }
  };

  const autoResizeTextarea = (e) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
  };

  return (
    <div className="flex flex-col h-screen md:h-11/12 lg:max-w-1/2 lg:rounded-xl text-xl bg-gray-900 text-white shadow-2xl overflow-hidden">
      <div className="bg-gray-800 py-4 rounded-t-xl px-6 flex justify-between items-center border-b border-gray-700">
        <div className="flex items-center">
          <Bot className="w-6 h-6 text-blue-400 mr-2" />
          <h1 className="text-xl font-bold"> {userData.user.name}'s AI Assistant</h1>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowContributionForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Contribute</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSettings(true)}
            className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" id="chat-messages-container">
        <AnimatePresence>
          {promptUpdated && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-green-900 bg-opacity-20 border border-green-500 rounded-lg p-3 text-green-300 flex items-center"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Prompt updated successfully! I'm now equipped with the latest information.
            </motion.div>
          )}
        </AnimatePresence>

        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex items-start ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 shadow-md ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-800 text-white rounded-bl-none border border-gray-700'
              }`}
            >
              <div className="flex items-center mb-1">
                {message.type === 'bot' ? (
                  <Bot className="w-4 h-4 mr-2 text-blue-400" />
                ) : (
                  <User className="w-4 h-4 mr-2 text-blue-300" />
                )}
                <div className="text-xs opacity-70">
                  {message.type === 'bot' ? 'Assistant' : sessionStorage.getItem('userName') || 'You'}
                  {message.timestamp && (
                    <span className="ml-2 text-xs opacity-50">
                      {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-sm whitespace-pre-wrap break-words">
                {message.type === 'bot' && index === messages.length - 1 && isLoading ? (
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  </motion.div>
                ) : (
                  <MessageContent content={message.content} />
                )}
              </div>
            </div>
          </motion.div>
        ))}
        {isLoading && messages[messages.length - 1]?.type === 'user' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-start justify-start"
          >
            <div className="max-w-[80%] rounded-lg p-3 shadow-md bg-gray-800 text-white rounded-bl-none border border-gray-700">
              <div className="flex items-center mb-1">
                <Bot className="w-4 h-4 mr-2 text-blue-400" />
                <div className="text-xs opacity-70">Assistant</div>
              </div>
              <div className="text-sm">
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex items-center gap-2"
                >
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div>
        <div className="flex items-end p-4 border-t border-gray-700">
          <div className="relative flex items-center w-full rounded-lg bg-gray-800 p-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                autoResizeTextarea(e);
              }}
              onKeyDown={handleKeyPress}
              placeholder={`Ask me anything about ${userData.user.name} ...`}
              className="flex-1 bg-transparent outline-none resize-none text-white placeholder-gray-400 max-h-32"
              rows={1}
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSendMessage}
              disabled={isLoading || input.trim() === ''}
              className="p-2 ml-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-5 h-5" />
                </motion.div>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearChatHistory}
              className="p-2 ml-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showDeleteSuccessModal && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Chat history deleted successfully
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AdminModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onPromptUpdated={handlePromptUpdated}
        password={userData.user.password}
      />

      <ContributionForm
        isOpen={showContributionForm}
        onClose={() => setShowContributionForm(false)}
        lastQuestion={lastQuestion}
      />

      <DeleteConfirmationModal />

    </div>
  );
};

export default ChatBot;
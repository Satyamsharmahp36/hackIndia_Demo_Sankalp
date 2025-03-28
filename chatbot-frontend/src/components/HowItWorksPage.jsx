import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Brain, Globe2, Zap, Settings, Shield } from 'lucide-react';

function HowItWorksPage() {
  const steps = [
    {
      icon: <Bot className="w-12 h-12 text-blue-500" />,
      title: "Initial Setup",
      description: "Create your personalized ChatMate account and customize your AI assistant's personality and preferences."
    },
    {
      icon: <Brain className="w-12 h-12 text-purple-500" />,
      title: "Intelligent Learning",
      description: "ChatMate learns from your interactions, adapting to your communication style and work patterns."
    },
    {
      icon: <Globe2 className="w-12 h-12 text-green-500" />,
      title: "Multi-Platform Integration",
      description: "Seamlessly connect ChatMate across your devices and work environments, from desktop to mobile."
    },
    {
      icon: <Zap className="w-12 h-12 text-yellow-500" />,
      title: "Task Automation",
      description: "Automate repetitive tasks, manage schedules, and streamline your workflow with intelligent processing."
    },
    {
      icon: <Settings className="w-12 h-12 text-cyan-500" />,
      title: "Continuous Optimization",
      description: "Receive regular updates and improvements based on user feedback and advanced machine learning techniques."
    },
    {
      icon: <Shield className="w-12 h-12 text-red-500" />,
      title: "Privacy & Security",
      description: "Advanced encryption and strict privacy controls ensure your data remains confidential and protected."
    }
  ];

  return (
    <div className="bg-gray-900 text-white p-8 rounded-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto"
      >
        <h1 className="text-4xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          How ChatMate Works
        </h1>
        <p className="text-xl text-gray-400 text-center mb-12">
          Discover the intelligent journey of transforming your daily workflow
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: index * 0.2,
                duration: 0.5
              }}
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800 rounded-2xl p-6 text-center hover:bg-gray-700 transition-all duration-300"
            >
              <div className="flex justify-center mb-4">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-gray-400">{step.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="mt-16 text-center"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Unlock the power of AI-driven productivity with ChatMate
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white font-bold text-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
          >
            Start Your Free Trial
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default HowItWorksPage;
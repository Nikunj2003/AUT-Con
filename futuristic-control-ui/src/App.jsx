import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ParticleField from './components/ParticleField';
import FluidCanvas from './components/FluidCanvas';
import HolographicPanel from './components/HolographicPanel';
import config from './config';
import { nodeData, executeCommand, systemCommands } from './data/nodeData';
import { Settings, Maximize2, Minimize2, Power, Zap, Camera } from 'lucide-react';
import './App.css';

function App() {
  const [isSystemPanelVisible, setIsSystemPanelVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [commandLog, setCommandLog] = useState([]);
  const [systemStatus, setSystemStatus] = useState('online');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize system
  useEffect(() => {
    const initializeSystem = async () => {
      addToCommandLog('System initializing...', 'info');
      
      // Simulate initialization delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addToCommandLog('Futuristic Control Interface loaded', 'success');
      addToCommandLog('All systems operational', 'success');
      addToCommandLog('Ready for commands', 'info');
      
      setIsLoading(false);
    };

    initializeSystem();
  }, []);

  // Handle node interactions
  const handleNodeInteraction = useCallback(async (node, nodeType) => {
    console.debug('Node interaction:', node.title, nodeType);
    addToCommandLog(`Executing: ${node.title}`, 'command');
    
    try {
      // Execute the actual command if it exists
      if (node.command && systemCommands[node.command]) {
        systemCommands[node.command]();
      }
      
      // Simulate command execution with backend
      const result = await executeCommand(node);
      
      if (result.success) {
        addToCommandLog(result.message, 'success');
        if (result.output) {
          addToCommandLog(`Output: ${result.output}`, 'info');
        }
      } else {
        addToCommandLog(`Failed: ${result.message}`, 'error');
      }
    } catch (error) {
      console.error('Command execution error:', error);
      addToCommandLog(`Error executing ${node.title}: ${error.message}`, 'error');
    }
  }, []);

  // Add command to log
  const addToCommandLog = useCallback((message, type = 'info') => {
    const logEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    
    setCommandLog(prev => [...prev.slice(-9), logEntry]); // Keep last 10 entries
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Quick actions
  const handleQuickScreenshot = () => {
    handleNodeInteraction({ title: 'Screenshot', command: 'take_screenshot' });
  };

  const handleQuickLock = () => {
    handleNodeInteraction({ title: 'Lock Screen', command: 'lock_screen' });
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'f':
            event.preventDefault();
            toggleFullscreen();
            break;
          case 'h':
            event.preventDefault();
            setIsSystemPanelVisible(prev => !prev);
            break;
          case 'r':
            event.preventDefault();
            window.location.reload();
            break;
        }
      }
      
      if (event.key === 'Escape') {
        setIsSystemPanelVisible(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="w-screen h-screen bg-black text-white overflow-hidden relative">
      {/* Particle Background */}
      <ParticleField interactive={true} particleCount={config.PARTICLE_COUNT} />
      
      {/* Loading Screen */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="fixed inset-0 bg-black z-50 flex items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="text-center">
              <motion.div
                className="text-4xl font-bold text-cyan-400 neon-glow-strong mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                INITIALIZING
              </motion.div>
              <motion.div
                className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: 256 }}
                transition={{ duration: 1.5 }}
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.5 }}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Interface */}
      <div className="relative z-10 w-full h-full">
        {/* Header Bar */}
        <motion.header 
          className="absolute top-0 left-0 right-0 z-50 glass-panel"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Zap className="text-cyan-400 neon-glow" size={24} />
                <h1 className="text-xl font-bold text-cyan-400 neon-glow">
                  Futuristic Control Interface
                </h1>
              </div>
              <div className={`status-indicator ${
                systemStatus === 'online' ? 'status-online' : 
                systemStatus === 'warning' ? 'status-warning' : 'status-error'
              }`} />
              <span className="text-sm text-gray-400">
                Status: <span className="text-green-400">{systemStatus}</span>
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400 font-mono">
                {currentTime.toLocaleTimeString()}
              </div>
              <button
                onClick={() => setIsSystemPanelVisible(!isSystemPanelVisible)}
                className="p-2 rounded-lg glass-panel hover:bg-cyan-400/10 transition-colors"
                title="Toggle System Panel (Ctrl+H)"
              >
                <Settings className="text-cyan-400" size={18} />
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg glass-panel hover:bg-cyan-400/10 transition-colors"
                title="Toggle Fullscreen (Ctrl+F)"
              >
                {isFullscreen ? 
                  <Minimize2 className="text-cyan-400" size={18} /> : 
                  <Maximize2 className="text-cyan-400" size={18} />
                }
              </button>
            </div>
          </div>
        </motion.header>

        {/* Main Canvas Area */}
        <div className="pt-20 h-full">
          <FluidCanvas 
            nodes={nodeData}
            onNodeInteraction={handleNodeInteraction}
            className="w-full h-full"
            enablePhysics={true}
          />
        </div>

        {/* System Panel */}
        <AnimatePresence>
          {isSystemPanelVisible && (
            <HolographicPanel
              title="System Monitor"
              position="top-right"
              isVisible={isSystemPanelVisible}
              onClose={() => setIsSystemPanelVisible(false)}
            />
          )}
        </AnimatePresence>

        {/* Command Log Panel */}
        <motion.div 
          className="absolute bottom-4 left-4 glass-panel rounded-lg p-4 w-96 max-h-64 overflow-hidden"
          initial={{ x: -400 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-cyan-400 font-bold neon-glow">Command Log</h3>
            <button 
              onClick={() => setCommandLog([])}
              className="text-xs text-gray-400 hover:text-cyan-400 transition-colors"
            >
              Clear
            </button>
          </div>
          
          <div className="space-y-1 max-h-40 overflow-y-auto">
            <AnimatePresence>
              {commandLog.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className={`text-xs p-2 rounded ${
                    log.type === 'success' ? 'bg-green-400/10 text-green-400' :
                    log.type === 'error' ? 'bg-red-400/10 text-red-400' :
                    log.type === 'command' ? 'bg-yellow-400/10 text-yellow-400' :
                    'bg-cyan-400/10 text-cyan-400'
                  }`}
                >
                  <span className="opacity-60">[{log.timestamp}]</span>
                  <span className="ml-2">{log.message}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Quick Actions Floating Menu */}
        <motion.div 
          className="absolute bottom-4 right-4 flex flex-col space-y-2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <motion.button
            onClick={handleQuickScreenshot}
            className="p-3 rounded-full glass-panel hover:bg-cyan-400/10 transition-all"
            title="Quick Screenshot"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Camera className="text-cyan-400" size={24} />
          </motion.button>
          
          <motion.button
            onClick={handleQuickLock}
            className="p-3 rounded-full glass-panel hover:bg-red-400/10 transition-all"
            title="Lock Screen"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Power className="text-red-400" size={24} />
          </motion.button>
        </motion.div>

        {/* Help Overlay */}
        <motion.div 
          className="absolute top-24 left-1/2 transform -translate-x-1/2 glass-panel rounded-lg p-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <p className="text-sm text-gray-400 text-center">
            Click nodes to expand • Drag to move • Ctrl+F for fullscreen • Ctrl+H to toggle panel
          </p>
        </motion.div>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-24 right-4 glass-panel rounded p-2 text-xs text-gray-400">
            <div>Nodes Available: {nodeData.length}</div>
            <div>System Status: {systemStatus}</div>
            <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;


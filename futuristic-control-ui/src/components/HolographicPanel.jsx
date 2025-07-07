import React, { useState, useEffect } from 'react';
import { animated, useSpring, useTransition } from '@react-spring/web';
import { Activity, Cpu, HardDrive, Wifi, Zap } from 'lucide-react';

const HolographicPanel = ({ 
  title = "System Status", 
  position = "top-left",
  isVisible = true,
  onClose,
  className = ""
}) => {
  const [systemStats, setSystemStats] = useState({
    cpu: 0,
    memory: 0,
    network: 0,
    power: 100,
    temperature: 45
  });
  const [logs, setLogs] = useState([]);

  // Simulate system stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        cpu: Math.max(0, Math.min(100, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(0, Math.min(100, prev.memory + (Math.random() - 0.5) * 5)),
        network: Math.max(0, Math.min(100, prev.network + (Math.random() - 0.5) * 20)),
        power: Math.max(0, Math.min(100, prev.power - Math.random() * 0.1)),
        temperature: Math.max(30, Math.min(80, prev.temperature + (Math.random() - 0.5) * 2))
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Add system logs
  useEffect(() => {
    const logMessages = [
      "System initialized successfully",
      "Network connection established",
      "All systems operational",
      "Background processes running",
      "Monitoring system health"
    ];

    const interval = setInterval(() => {
      const randomMessage = logMessages[Math.floor(Math.random() * logMessages.length)];
      const newLog = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        message: randomMessage,
        type: Math.random() > 0.8 ? 'warning' : 'info'
      };

      setLogs(prev => [...prev.slice(-4), newLog]); // Keep last 5 logs
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Panel animation
  const [{ opacity, transform }, api] = useSpring(() => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0px)' : 'translateY(-20px)',
    config: { tension: 300, friction: 30 }
  }));

  useEffect(() => {
    api.start({
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0px)' : 'translateY(-20px)'
    });
  }, [isVisible, api]);

  // Log transitions
  const logTransitions = useTransition(logs, {
    from: { opacity: 0, transform: 'translateX(-100%)' },
    enter: { opacity: 1, transform: 'translateX(0%)' },
    leave: { opacity: 0, transform: 'translateX(100%)' },
    config: { tension: 300, friction: 30 }
  });

  // Position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 left-4';
    }
  };

  // Status indicator component
  const StatusIndicator = ({ value, label, icon: Icon, color, unit = '%' }) => {
    const getColor = () => {
      if (value > 80) return 'text-red-400';
      if (value > 60) return 'text-yellow-400';
      return color;
    };

    return (
      <div className="flex items-center justify-between p-2 rounded bg-black/20">
        <div className="flex items-center space-x-2">
          <Icon size={16} className={getColor()} />
          <span className="text-sm text-gray-300">{label}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                value > 80 ? 'bg-red-400' : 
                value > 60 ? 'bg-yellow-400' : 
                'bg-cyan-400'
              }`}
              style={{ width: `${value}%` }}
            />
          </div>
          <span className={`text-xs font-mono ${getColor()}`}>
            {Math.round(value)}{unit}
          </span>
        </div>
      </div>
    );
  };

  return (
    <animated.div
      className={`fixed ${getPositionClasses()} z-50 ${className}`}
      style={{ opacity, transform }}
    >
      <div className="hologram-panel rounded-lg p-4 w-80 max-h-96 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-cyan-400 font-bold text-lg neon-glow">
            {title}
          </h3>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-cyan-400 transition-colors"
            >
              ×
            </button>
          )}
        </div>

        {/* System Stats */}
        <div className="space-y-2 mb-4">
          <StatusIndicator 
            value={systemStats.cpu} 
            label="CPU" 
            icon={Cpu} 
            color="text-cyan-400" 
          />
          <StatusIndicator 
            value={systemStats.memory} 
            label="Memory" 
            icon={HardDrive} 
            color="text-purple-400" 
          />
          <StatusIndicator 
            value={systemStats.network} 
            label="Network" 
            icon={Wifi} 
            color="text-green-400" 
          />
          <StatusIndicator 
            value={systemStats.power} 
            label="Power" 
            icon={Zap} 
            color="text-yellow-400" 
          />
          <StatusIndicator 
            value={systemStats.temperature} 
            label="Temp" 
            icon={Activity} 
            color="text-blue-400" 
            unit="°C"
          />
        </div>

        {/* System Logs */}
        <div className="border-t border-cyan-400/20 pt-3">
          <h4 className="text-cyan-400 text-sm font-semibold mb-2">System Log</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {logTransitions((style, log) => (
              <animated.div
                key={log.id}
                style={style}
                className={`text-xs p-2 rounded ${
                  log.type === 'warning' 
                    ? 'bg-yellow-400/10 text-yellow-400' 
                    : 'bg-cyan-400/10 text-cyan-400'
                }`}
              >
                <span className="opacity-60">[{log.timestamp}]</span>
                <span className="ml-2">{log.message}</span>
              </animated.div>
            ))}
          </div>
        </div>

        {/* Holographic effect overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent animate-pulse" />
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
        </div>
      </div>
    </animated.div>
  );
};

export default HolographicPanel;


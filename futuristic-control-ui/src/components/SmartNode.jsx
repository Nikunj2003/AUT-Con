import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from 'react-use-gesture';
import config from '../config';

const SmartNode = ({
  id,
  title,
  type = 'primary',
  position = { x: 100, y: 100 },
  onPositionChange,
  onInteraction,
  children,
  isExpanded = false,
  size = config.NODE_MIN_SIZE,
  containerBounds = { width: 1200, height: 800 },
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [{ x, y }, api] = useSpring(() => ({ x: position.x, y: position.y }));

  // Update spring position when prop changes (initial positioning or external updates)
  useEffect(() => {
    api.start({ x: position.x, y: position.y });
  }, [position, api]);

  const bind = useDrag(({ down, movement: [mx, my], initial: [ix, iy] }) => {
    setIsDragging(down);
    const newX = Math.max(size / 2, Math.min(containerBounds.width - size / 2, ix + mx));
    const newY = Math.max(size / 2, Math.min(containerBounds.height - size / 2, iy + my));

    api.start({ x: newX, y: newY, immediate: down });

    if (!down && onPositionChange) {
      onPositionChange(id, { x: newX, y: newY });
    }
  }, { initial: () => [x.get(), y.get()] });

  // Node styling based on type
  const getNodeStyle = () => {
    const baseStyle = {
      width: size,
      height: size,
      borderRadius: type === 'primary' ? '50%' : '20%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: isDragging ? 'grabbing' : 'grab',
      userSelect: 'none',
      fontSize: size > 60 ? '14px' : '12px',
      fontWeight: 'bold',
      textAlign: 'center',
      padding: '8px',
      boxSizing: 'border-box',
      position: 'absolute',
      zIndex: isDragging ? 1000 : isHovered ? 100 : 10,
      willChange: 'transform',
    };

    switch (type) {
      case 'primary':
        return {
          ...baseStyle,
          background: isHovered
            ? 'linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(0, 128, 255, 0.3))'
            : 'linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(0, 128, 255, 0.1))',
          border: '2px solid rgba(0, 255, 255, 0.8)',
          color: '#00ffff',
          boxShadow: isHovered
            ? '0 0 30px rgba(0, 255, 255, 0.6), inset 0 0 20px rgba(0, 255, 255, 0.1)'
            : '0 0 15px rgba(0, 255, 255, 0.4), inset 0 0 10px rgba(0, 255, 255, 0.05)',
        };
      case 'secondary':
        return {
          ...baseStyle,
          background: isHovered
            ? 'linear-gradient(135deg, rgba(138, 43, 226, 0.3), rgba(255, 20, 147, 0.3))'
            : 'linear-gradient(135deg, rgba(138, 43, 226, 0.1), rgba(255, 20, 147, 0.1))',
          border: '2px solid rgba(138, 43, 226, 0.8)',
          color: '#8a2be2',
          boxShadow: isHovered
            ? '0 0 30px rgba(138, 43, 226, 0.6), inset 0 0 20px rgba(138, 43, 226, 0.1)'
            : '0 0 15px rgba(138, 43, 226, 0.4), inset 0 0 10px rgba(138, 43, 226, 0.05)',
        };
      case 'accent':
        return {
          ...baseStyle,
          background: isHovered
            ? 'linear-gradient(135deg, rgba(57, 255, 20, 0.3), rgba(0, 255, 127, 0.3))'
            : 'linear-gradient(135deg, rgba(57, 255, 20, 0.1), rgba(0, 255, 127, 0.1))',
          border: '2px solid rgba(57, 255, 20, 0.8)',
          color: '#39ff14',
          boxShadow: isHovered
            ? '0 0 30px rgba(57, 255, 20, 0.6), inset 0 0 20px rgba(57, 255, 20, 0.1)'
            : '0 0 15px rgba(57, 255, 20, 0.4), inset 0 0 10px rgba(57, 255, 20, 0.05)',
        };
      default:
        return baseStyle;
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (!isDragging && onInteraction) {
      onInteraction(id, type);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <animated.div
      {...bind()}
      className="smart-node"
      style={{
        ...getNodeStyle(),
        transform: x.to((x) => `translate3d(${x - size / 2}px, ${y.get() - size / 2}px, 0)`),
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: isDragging ? 1.1 : isHovered ? 1.05 : 1,
          opacity: 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="no-select"
      >
        {title}
      </motion.div>

      {/* Status indicator */}
      <div
        className="status-indicator status-online"
        style={{
          position: 'absolute',
          top: '5px',
          right: '5px',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#39ff14',
          boxShadow: '0 0 10px #39ff14',
          animation: 'pulse 2s infinite',
        }}
      />

      {/* Expansion indicator for parent nodes */}
      {children && (
        <div
          style={{
            position: 'absolute',
            bottom: '5px',
            right: '5px',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: isExpanded ? '#39ff14' : '#666',
            border: '1px solid #fff',
            fontSize: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}
        >
          {isExpanded ? '−' : '+'}
        </div>
      )}
    </animated.div>
  );
};

export default SmartNode;



import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import config from "../config";
import SmartNode from './SmartNode';

const FluidCanvas = ({ 
  nodes = [], 
  onNodeInteraction, 
  className = '',
  enablePhysics = true 
}) => {
  const canvasRef = useRef(null);
  const [containerBounds, setContainerBounds] = useState({ width: 1200, height: 800 });
  const [nodePositions, setNodePositions] = useState(new Map());
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [selectedNode, setSelectedNode] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize container bounds
  useEffect(() => {
    const updateBounds = () => {
      if (!canvasRef.current) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const bounds = {
        width: Math.max(rect.width, 800),
        height: Math.max(rect.height, 600)
      };
      
      setContainerBounds(bounds);
    };

    updateBounds();
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, []);

  // Initialize node positions when nodes are available
  useEffect(() => {
    if (nodes.length === 0) {
      console.log('FluidCanvas: No nodes to initialize');
      return;
    }

    console.log('FluidCanvas: Initializing positions for', nodes.length, 'nodes');
    
    const newPositions = new Map();
    const centerX = containerBounds.width / 2;
    const centerY = containerBounds.height / 2;
    const radius = Math.min(containerBounds.width, containerBounds.height) * config.NODE_INITIAL_RADIUS_FACTOR;

    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * 2 * Math.PI;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      const position = { 
        x: Math.max(80, Math.min(containerBounds.width - 80, x)),
        y: Math.max(80, Math.min(containerBounds.height - 80, y))
      };
      
      newPositions.set(node.id, position);
      console.log(`FluidCanvas: Positioned node ${node.id} (${node.title}) at`, position);
    });

    setNodePositions(newPositions);
    setIsInitialized(true);
    console.log('FluidCanvas: Initialization complete with', newPositions.size, 'positioned nodes');
  }, [nodes, containerBounds]);

  // Handle node position updates
  const handleNodePositionChange = useCallback((nodeId, newPosition) => {
    console.log('FluidCanvas: Updating position for node', nodeId, newPosition);
    setNodePositions(prev => {
      const updated = new Map(prev);
      updated.set(nodeId, newPosition);
      return updated;
    });
  }, []);

  // Handle node interactions
  const handleNodeInteraction = useCallback((nodeId, nodeType) => {
    // Find the node, whether it's a parent or a child
    let node = null;
    for (const parentNode of nodes) {
      if (parentNode.id === nodeId) {
        node = parentNode;
        break;
      }
      if (parentNode.children) {
        const foundChild = parentNode.children.find(child => child.id === nodeId);
        if (foundChild) {
          node = foundChild;
          break;
        }
      }
    }

    if (!node) {
      console.error(`FluidCanvas: Node with ID ${nodeId} not found.`);
      return;
    }

    console.log(`FluidCanvas: Node clicked: ${node.title} (${nodeId})`);

    // Toggle expansion for parent nodes
    if (node.children && node.children.length > 0) {
      setExpandedNodes(prev => {
        const updated = new Set(prev);
        if (updated.has(nodeId)) {
          updated.delete(nodeId);
          // Remove child node positions when collapsing
          node.children.forEach(child => {
            setNodePositions(prevPos => {
              const newPos = new Map(prevPos);
              newPos.delete(child.id);
              return newPos;
            });
          });
        } else {
          updated.add(nodeId);
          // Add child node positions when expanding
          setTimeout(() => arrangeChildNodes(nodeId), 100);
        }
        return updated;
      });
    }

    // Set selected node
    setSelectedNode(nodeId);

    // Call external handler
    if (onNodeInteraction) {
      onNodeInteraction(node, nodeType);
    }
  }, [nodes, onNodeInteraction]);

  // Arrange child nodes around parent
  const arrangeChildNodes = useCallback((parentId) => {
    const parentNode = nodes.find(n => n.id === parentId);
    if (!parentNode || !parentNode.children) return;

    const parentPos = nodePositions.get(parentId);
    if (!parentPos) return;

    const childRadius = 120;
    const angleStep = (2 * Math.PI) / parentNode.children.length;

    setNodePositions(prev => {
      const updatedPositions = new Map(prev);

      parentNode.children.forEach((child, index) => {
        const angle = index * angleStep;
        const x = parentPos.x + Math.cos(angle) * childRadius;
        const y = parentPos.y + Math.sin(angle) * childRadius;

        updatedPositions.set(child.id, {
          x: Math.max(50, Math.min(containerBounds.width - 50, x)),
          y: Math.max(50, Math.min(containerBounds.height - 50, y))
        });
      });

      return updatedPositions;
    });
  }, [nodes, nodePositions, containerBounds]);

  // Get all visible nodes (main nodes + expanded child nodes)
  const getVisibleNodes = () => {
    const visibleNodes = [];

    // Add main nodes
    nodes.forEach(node => {
      const position = nodePositions.get(node.id);
      if (position) {
        visibleNodes.push({
          ...node,
          position,
          isExpanded: expandedNodes.has(node.id),
          isSelected: selectedNode === node.id,
          size: selectedNode === node.id ? 100 : 80
        });
      }
    });

    // Add expanded child nodes
    nodes.forEach(parentNode => {
      if (expandedNodes.has(parentNode.id) && parentNode.children) {
        parentNode.children.forEach(child => {
          const position = nodePositions.get(child.id);
          if (position) {
            visibleNodes.push({
              ...child,
              position,
              isExpanded: false,
              isSelected: selectedNode === child.id,
              size: selectedNode === child.id ? 80 : 60,
              type: child.type || 'secondary'
            });
          }
        });
      }
    });

    return visibleNodes;
  };

  const visibleNodes = getVisibleNodes();

  console.log('FluidCanvas render:', {
    isInitialized,
    nodesLength: nodes.length,
    nodePositionsSize: nodePositions.size,
    visibleNodesLength: visibleNodes.length,
    containerBounds
  });

  // Show loading state only if we have nodes but haven't initialized yet
  if (nodes.length > 0 && !isInitialized) {
    return (
      <div className={`relative w-full h-full overflow-hidden ${className} flex items-center justify-center`}>
        <motion.div 
          className="text-cyan-400 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Initializing Control Interface...
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      ref={canvasRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{ minHeight: '100vh', position: 'relative' }}
    >
      {/* Render all visible nodes */}
      <AnimatePresence>
        {visibleNodes.map(node => (
          <SmartNode
            key={node.id}
            id={node.id}
            title={node.title}
            type={node.type || 'primary'}
            position={node.position}
            onPositionChange={handleNodePositionChange}
            onInteraction={handleNodeInteraction}
            isExpanded={node.isExpanded}
            size={node.size}
            containerBounds={containerBounds}
            children={node.children}
          />
        ))}
      </AnimatePresence>

      {/* Floating info panel for selected node */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div 
            className="absolute top-4 left-4 glass-panel rounded-lg p-4 max-w-xs z-50"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-cyan-400 font-bold mb-2">Node Info</h3>
            <p className="text-sm text-gray-300">
              Selected: {nodes.find(n => n.id === selectedNode)?.title || 
                        nodes.flatMap(n => n.children || []).find(c => c.id === selectedNode)?.title || 
                        'Unknown'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Click and drag to move • Click to expand/execute
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Debug info */}
      <div className="absolute bottom-4 left-4 glass-panel rounded p-2 text-xs text-gray-400">
        <div>Visible Nodes: {visibleNodes.length}</div>
        <div>Total Nodes: {nodes.length}</div>
        <div>Positioned: {nodePositions.size}</div>
        <div>Container: {containerBounds.width}×{containerBounds.height}</div>
        <div>Expanded: {expandedNodes.size}</div>
        <div>Selected: {selectedNode || 'None'}</div>
        <div>Initialized: {isInitialized ? 'Yes' : 'No'}</div>
      </div>

      {/* No nodes message */}
      {nodes.length === 0 && (
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 glass-panel rounded-lg p-4 text-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-cyan-400 text-lg font-bold mb-2">No Nodes Available</p>
          <p className="text-gray-300 text-sm">
            Check node data configuration
          </p>
        </motion.div>
      )}

      {/* No visible nodes message */}
      {nodes.length > 0 && visibleNodes.length === 0 && isInitialized && (
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 glass-panel rounded-lg p-4 text-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-cyan-400 text-lg font-bold mb-2">Nodes Not Visible</p>
          <p className="text-gray-300 text-sm">
            Positioning issue detected
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default FluidCanvas;


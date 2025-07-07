import React, { useRef, useEffect, useState } from 'react';

const ParticleField = ({ interactive = true, particleCount = 100 }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  class Particle {
    constructor(x, y, canvas) {
      this.x = x || Math.random() * canvas.width;
      this.y = y || Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.size = Math.random() * 2 + 1;
      this.opacity = Math.random() * 0.5 + 0.2;
      this.hue = Math.random() * 60 + 180; // Cyan to blue range
      this.life = Math.random() * 100 + 100;
      this.maxLife = this.life;
      this.canvas = canvas;
    }

    update(mouse) {
      // Mouse interaction
      if (interactive && mouse) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          const force = (100 - distance) / 100;
          this.vx += (dx / distance) * force * 0.01;
          this.vy += (dy / distance) * force * 0.01;
        }
      }

      // Apply velocity
      this.x += this.vx;
      this.y += this.vy;

      // Boundary collision with slight bounce
      if (this.x <= 0 || this.x >= this.canvas.width) {
        this.vx *= -0.8;
        this.x = Math.max(0, Math.min(this.canvas.width, this.x));
      }
      if (this.y <= 0 || this.y >= this.canvas.height) {
        this.vy *= -0.8;
        this.y = Math.max(0, Math.min(this.canvas.height, this.y));
      }

      // Friction
      this.vx *= 0.99;
      this.vy *= 0.99;

      // Life cycle
      this.life--;
      if (this.life <= 0) {
        this.respawn();
      }
    }

    respawn() {
      this.x = Math.random() * this.canvas.width;
      this.y = Math.random() * this.canvas.height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.life = this.maxLife;
      this.hue = Math.random() * 60 + 180;
    }

    draw(ctx) {
      const alpha = (this.life / this.maxLife) * this.opacity;
      ctx.save();
      
      // Glow effect
      ctx.shadowBlur = 10;
      ctx.shadowColor = `hsl(${this.hue}, 100%, 50%)`;
      
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 100%, 50%, ${alpha})`;
      ctx.fill();
      
      ctx.restore();
    }
  }

  const initParticles = (canvas) => {
    const particles = [];
    const count = Math.min(particleCount, (canvas.width * canvas.height) / 8000);
    
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(null, null, canvas));
    }
    
    return particles;
  };

  const drawConnections = (ctx, particles) => {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 80) {
          const opacity = (80 - distance) / 80 * 0.2;
          ctx.globalAlpha = opacity;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    
    ctx.restore();
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear canvas with fade effect
    ctx.fillStyle = 'rgba(12, 12, 12, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles
    const particles = particlesRef.current;
    const mouse = interactive ? mouseRef.current : null;
    
    particles.forEach(particle => {
      particle.update(mouse);
      particle.draw(ctx);
    });
    
    // Draw connections
    drawConnections(ctx, particles);
    
    animationRef.current = requestAnimationFrame(animate);
  };

  const handleMouseMove = (event) => {
    if (!interactive) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };

  const handleResize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    
    canvas.width = newWidth;
    canvas.height = newHeight;
    
    setDimensions({ width: newWidth, height: newHeight });
    
    // Reinitialize particles with new canvas size
    particlesRef.current = initParticles(canvas);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Initial setup
    handleResize();
    
    // Start animation
    animate();
    
    // Event listeners
    window.addEventListener('resize', handleResize);
    if (interactive) {
      canvas.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        canvas.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [interactive, particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className="particle-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: interactive ? 'auto' : 'none',
        zIndex: 0,
        opacity: 0.6
      }}
    />
  );
};

export default ParticleField;


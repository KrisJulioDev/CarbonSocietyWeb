// Utility functions
function throttle(func, limit) {
  let lastCall = 0;
  return function (...args) {
    const now = performance.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      func.apply(this, args);
    }
  };
}

function hexToRgb(hex) {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16),
  };
}

// Simple easing functions to replace GSAP
const easing = {
  elastic: {
    out: function(t) {
      const c4 = (2 * Math.PI) / 3;
      return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    }
  }
};

// Animation class to replace GSAP functionality
class SimpleAnimation {
  constructor(target, properties, duration = 1000, ease = null) {
    this.target = target;
    this.properties = properties;
    this.duration = duration;
    this.ease = ease;
    this.startTime = null;
    this.startValues = {};
    this.active = false;
    
    // Store initial values
    for (const prop in properties) {
      this.startValues[prop] = target[prop] || 0;
    }
  }
  
  start() {
    this.active = true;
    this.startTime = performance.now();
    this.animate();
    return this;
  }
  
  animate() {
    if (!this.active) return;
    
    const now = performance.now();
    const elapsed = now - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1);
    
    const easedProgress = this.ease ? this.ease(progress) : progress;
    
    for (const prop in this.properties) {
      const start = this.startValues[prop];
      const end = this.properties[prop];
      this.target[prop] = start + (end - start) * easedProgress;
    }
    
    if (progress < 1) {
      requestAnimationFrame(() => this.animate());
    } else {
      this.active = false;
      if (this.onComplete) this.onComplete();
    }
  }
  
  kill() {
    this.active = false;
  }
}

class DotGrid {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      dotSize: 8,
      gap: 20,
      baseColor: "#CCCCCC",
      activeColor: "#4F46E5",
      proximity: 80,
      speedTrigger: 50,
      shockRadius: 150,
      shockStrength: 3,
      maxSpeed: 3000,
      resistance: 500,
      returnDuration: 1000,
      ...options
    };
    
    this.wrapper = null;
    this.canvas = null;
    this.ctx = null;
    this.dots = [];
    this.pointer = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      speed: 0,
      lastTime: 0,
      lastX: 0,
      lastY: 0,
    };
    
    this.baseRgb = hexToRgb(this.options.baseColor);
    this.activeRgb = hexToRgb(this.options.activeColor);
    this.circlePath = null;
    this.animationFrame = null;
    this.activeAnimations = new Map();
    
    this.init();
  }
  
  init() {
    this.createElements();
    this.buildGrid();
    this.addEventListeners();
    this.startAnimation();
    this.setupResizeObserver();
  }
  
  createElements() {
    // Create wrapper
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'dot-grid__wrap';
    
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'dot-grid__canvas';
    this.ctx = this.canvas.getContext('2d');
    
    // Create dot grid container
    const dotGrid = document.createElement('div');
    dotGrid.className = 'dot-grid';
    
    // Assemble structure
    this.wrapper.appendChild(this.canvas);
    dotGrid.appendChild(this.wrapper);
    this.container.appendChild(dotGrid);
    
    // Create circle path for performance
    if (window.Path2D) {
      this.circlePath = new Path2D();
      this.circlePath.arc(0, 0, this.options.dotSize / 2, 0, Math.PI * 2);
    }
  }
  
  buildGrid() {
    if (!this.wrapper || !this.canvas) return;
    
    const { width, height } = this.wrapper.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.scale(dpr, dpr);
    
    const { dotSize, gap } = this.options;
    const cols = Math.floor((width + gap) / (dotSize + gap));
    const rows = Math.floor((height + gap) / (dotSize + gap));
    const cell = dotSize + gap;
    
    const gridW = cell * cols - gap;
    const gridH = cell * rows - gap;
    
    const extraX = width - gridW;
    const extraY = height - gridH;
    
    const startX = extraX / 2 + dotSize / 2;
    const startY = extraY / 2 + dotSize / 2;
    
    this.dots = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cx = startX + x * cell;
        const cy = startY + y * cell;
        this.dots.push({ 
          cx, 
          cy, 
          xOffset: 0, 
          yOffset: 0, 
          _inertiaApplied: false,
          id: `${x}-${y}`
        });
      }
    }
  }
  
  startAnimation() {
    const draw = () => {
      if (!this.ctx || !this.canvas) return;
      
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      const { x: px, y: py } = this.pointer;
      const proxSq = this.options.proximity * this.options.proximity;
      
      for (const dot of this.dots) {
        const ox = dot.cx + dot.xOffset;
        const oy = dot.cy + dot.yOffset;
        const dx = dot.cx - px;
        const dy = dot.cy - py;
        const dsq = dx * dx + dy * dy;
        
        let style = this.options.baseColor;
        if (dsq <= proxSq) {
          const dist = Math.sqrt(dsq);
          const t = 1 - dist / this.options.proximity;
          const r = Math.round(this.baseRgb.r + (this.activeRgb.r - this.baseRgb.r) * t);
          const g = Math.round(this.baseRgb.g + (this.activeRgb.g - this.baseRgb.g) * t);
          const b = Math.round(this.baseRgb.b + (this.activeRgb.b - this.baseRgb.b) * t);
          style = `rgb(${r},${g},${b})`;
        }
        
        this.ctx.save();
        this.ctx.translate(ox, oy);
        this.ctx.fillStyle = style;
        
        if (this.circlePath) {
          this.ctx.fill(this.circlePath);
        } else {
          this.ctx.beginPath();
          this.ctx.arc(0, 0, this.options.dotSize / 2, 0, Math.PI * 2);
          this.ctx.fill();
        }
        
        this.ctx.restore();
      }
      
      this.animationFrame = requestAnimationFrame(draw);
    };
    
    draw();
  }
  
  addEventListeners() {
    const onMove = (e) => {
      const now = performance.now();
      const pr = this.pointer;
      const dt = pr.lastTime ? now - pr.lastTime : 16;
      const dx = e.clientX - pr.lastX;
      const dy = e.clientY - pr.lastY;
      
      let vx = (dx / dt) * 1000;
      let vy = (dy / dt) * 1000;
      let speed = Math.hypot(vx, vy);
      
      if (speed > this.options.maxSpeed) {
        const scale = this.options.maxSpeed / speed;
        vx *= scale;
        vy *= scale;
        speed = this.options.maxSpeed;
      }
      
      pr.lastTime = now;
      pr.lastX = e.clientX;
      pr.lastY = e.clientY;
      pr.vx = vx;
      pr.vy = vy;
      pr.speed = speed;
      
      const rect = this.canvas.getBoundingClientRect();
      pr.x = e.clientX - rect.left;
      pr.y = e.clientY - rect.top;
      
      // Apply inertia effect for fast movement
      for (const dot of this.dots) {
        const dist = Math.hypot(dot.cx - pr.x, dot.cy - pr.y);
        if (speed > this.options.speedTrigger && dist < this.options.proximity && !dot._inertiaApplied) {
          this.applyInertia(dot, pr, vx, vy);
        }
      }
    };
    
    const onClick = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      
      for (const dot of this.dots) {
        const dist = Math.hypot(dot.cx - cx, dot.cy - cy);
        if (dist < this.options.shockRadius && !dot._inertiaApplied) {
          this.applyShock(dot, cx, cy, dist);
        }
      }
    };
    
    this.throttledMove = throttle(onMove, 16);
    this.canvas.addEventListener('mousemove', this.throttledMove, { passive: true });
    this.canvas.addEventListener('click', onClick);
  }
  
  applyInertia(dot, pointer, vx, vy) {
    dot._inertiaApplied = true;
    this.killAnimation(dot.id);
    
    const pushX = (dot.cx - pointer.x) + vx * 0.002;
    const pushY = (dot.cy - pointer.y) + vy * 0.002;
    
    // Simulate inertia with custom animation
    const inertiaAnim = new SimpleAnimation(dot, {
      xOffset: pushX * 0.5,
      yOffset: pushY * 0.5
    }, 800);
    
    inertiaAnim.onComplete = () => {
      const returnAnim = new SimpleAnimation(dot, {
        xOffset: 0,
        yOffset: 0
      }, this.options.returnDuration, easing.elastic.out);
      
      returnAnim.onComplete = () => {
        dot._inertiaApplied = false;
        this.activeAnimations.delete(dot.id);
      };
      
      this.activeAnimations.set(dot.id, returnAnim);
      returnAnim.start();
    };
    
    this.activeAnimations.set(dot.id, inertiaAnim);
    inertiaAnim.start();
  }
  
  applyShock(dot, cx, cy, dist) {
    dot._inertiaApplied = true;
    this.killAnimation(dot.id);
    
    const falloff = Math.max(0, 1 - dist / this.options.shockRadius);
    const pushX = (dot.cx - cx) * this.options.shockStrength * falloff;
    const pushY = (dot.cy - cy) * this.options.shockStrength * falloff;
    
    const shockAnim = new SimpleAnimation(dot, {
      xOffset: pushX,
      yOffset: pushY
    }, 600);
    
    shockAnim.onComplete = () => {
      const returnAnim = new SimpleAnimation(dot, {
        xOffset: 0,
        yOffset: 0
      }, this.options.returnDuration, easing.elastic.out);
      
      returnAnim.onComplete = () => {
        dot._inertiaApplied = false;
        this.activeAnimations.delete(dot.id);
      };
      
      this.activeAnimations.set(dot.id, returnAnim);
      returnAnim.start();
    };
    
    this.activeAnimations.set(dot.id, shockAnim);
    shockAnim.start();
  }
  
  killAnimation(id) {
    const anim = this.activeAnimations.get(id);
    if (anim) {
      anim.kill();
      this.activeAnimations.delete(id);
    }
  }
  
  setupResizeObserver() {
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => {
        this.buildGrid();
      });
      this.resizeObserver.observe(this.wrapper);
    } else {
      this.onResize = () => this.buildGrid();
      window.addEventListener('resize', this.onResize);
    }
  }
  
  destroy() {
    // Cancel animation frame
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    // Kill all active animations
    for (const anim of this.activeAnimations.values()) {
      anim.kill();
    }
    this.activeAnimations.clear();
    
    // Remove event listeners
    if (this.canvas && this.throttledMove) {
      this.canvas.removeEventListener('mousemove', this.throttledMove);
      this.canvas.removeEventListener('click', this.onClick);
    }
    
    // Clean up resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    } else if (this.onResize) {
      window.removeEventListener('resize', this.onResize);
    }
    
    // Remove DOM elements
    const dotGrid = this.container.querySelector('.dot-grid');
    if (dotGrid) {
      dotGrid.remove();
    }
  }
}

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  const navSidebar = document.querySelector('.nav-sidebar');
  if (navSidebar) {
    new DotGrid(navSidebar, {
      dotSize: 8,
      gap: 20,
      baseColor: "#666666",
      activeColor: "#FF4444",
      proximity: 80,
      speedTrigger: 40,
      shockRadius: 120,
      shockStrength: 3,
      returnDuration: 800
    });
  }
});

// Export for manual initialization
window.DotGrid = DotGrid; 
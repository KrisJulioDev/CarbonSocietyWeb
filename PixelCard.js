class Pixel {
  constructor(canvas, context, x, y, color, speed, delay) {
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = context;
    this.x = x;
    this.y = y;
    this.color = color;
    this.speed = this.getRandomValue(0.1, 0.9) * speed;
    this.size = 0;
    this.sizeStep = Math.random() * 0.4;
    this.minSize = 0.5;
    this.maxSizeInteger = 2;
    this.maxSize = this.getRandomValue(this.minSize, this.maxSizeInteger);
    this.delay = delay;
    this.counter = 0;
    this.counterStep = Math.random() * 4 + (this.width + this.height) * 0.01;
    this.isIdle = false;
    this.isReverse = false;
    this.isShimmer = false;
  }

  getRandomValue(min, max) {
    return Math.random() * (max - min) + min;
  }

  draw() {
    const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5;
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(
      this.x + centerOffset,
      this.y + centerOffset,
      this.size,
      this.size
    );
  }

  appear() {
    this.isIdle = false;
    if (this.counter <= this.delay) {
      this.counter += this.counterStep;
      return;
    }
    if (this.size >= this.maxSize) {
      this.isShimmer = true;
    }
    if (this.isShimmer) {
      this.shimmer();
    } else {
      this.size += this.sizeStep;
    }
    this.draw();
  }

  disappear() {
    this.isShimmer = false;
    this.counter = 0;
    if (this.size <= 0) {
      this.isIdle = true;
      return;
    } else {
      this.size -= 0.1;
    }
    this.draw();
  }

  shimmer() {
    if (this.size >= this.maxSize) {
      this.isReverse = true;
    } else if (this.size <= this.minSize) {
      this.isReverse = false;
    }
    if (this.isReverse) {
      this.size -= this.speed;
    } else {
      this.size += this.speed;
    }
  }
}

function getEffectiveSpeed(value, reducedMotion) {
  const min = 0;
  const max = 100;
  const throttle = 0.001;
  const parsed = parseInt(value, 10);

  if (parsed <= min || reducedMotion) {
    return min;
  } else if (parsed >= max) {
    return max * throttle;
  } else {
    return parsed * throttle;
  }
}

const VARIANTS = {
  default: {
    activeColor: null,
    gap: 5,
    speed: 35,
    colors: "#f8fafc,#f1f5f9,#cbd5e1",
    noFocus: false
  },
  blue: {
    activeColor: "#e0f2fe",
    gap: 10,
    speed: 25,
    colors: "#e0f2fe,#7dd3fc,#0ea5e9",
    noFocus: false
  },
  yellow: {
    activeColor: "#fef08a",
    gap: 3,
    speed: 20,
    colors: "#fef08a,#fde047,#eab308",
    noFocus: false
  },
  pink: {
    activeColor: "#fecdd3",
    gap: 6,
    speed: 80,
    colors: "#fecdd3,#fda4af,#e11d48",
    noFocus: true
  },
  purple: {
    activeColor: "#e0e7ff",
    gap: 4,
    speed: 30,
    colors: "#e0e7ff,#c7d2fe,#4f46e5",
    noFocus: false
  }
};

class PixelCard {
  constructor(element, options = {}) {
    this.element = element;
    this.canvas = null;
    this.pixels = [];
    this.animationFrame = null;
    this.timePrevious = performance.now();
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    // Configuration
    this.variant = options.variant || 'purple';
    this.variantCfg = VARIANTS[this.variant] || VARIANTS.default;
    this.gap = options.gap ?? this.variantCfg.gap;
    this.speed = options.speed ?? this.variantCfg.speed;
    this.colors = options.colors ?? this.variantCfg.colors;
    this.noFocus = options.noFocus ?? this.variantCfg.noFocus;
    
    this.init();
  }

  init() {
    // Add pixel-card class to element
    this.element.classList.add('pixel-card');
    
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'pixel-canvas';
    this.element.appendChild(this.canvas);
    
    // Initialize pixels
    this.initPixels();
    
    // Add event listeners
    this.addEventListeners();
    
    // Setup resize observer
    this.setupResizeObserver();
  }

  initPixels() {
    if (!this.element || !this.canvas) return;

    const rect = this.element.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);
    const ctx = this.canvas.getContext("2d");

    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    const colorsArray = this.colors.split(",");
    const pxs = [];
    
    for (let x = 0; x < width; x += parseInt(this.gap, 10)) {
      for (let y = 0; y < height; y += parseInt(this.gap, 10)) {
        const color = colorsArray[Math.floor(Math.random() * colorsArray.length)];

        const dx = x - width / 2;
        const dy = y - height / 2;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const delay = this.reducedMotion ? 0 : distance;

        pxs.push(
          new Pixel(
            this.canvas,
            ctx,
            x,
            y,
            color,
            getEffectiveSpeed(this.speed, this.reducedMotion),
            delay
          )
        );
      }
    }
    this.pixels = pxs;
  }

  doAnimate(fnName) {
    this.animationFrame = requestAnimationFrame(() => this.doAnimate(fnName));
    const timeNow = performance.now();
    const timePassed = timeNow - this.timePrevious;
    const timeInterval = 1000 / 60;

    if (timePassed < timeInterval) return;
    this.timePrevious = timeNow - (timePassed % timeInterval);

    const ctx = this.canvas?.getContext("2d");
    if (!ctx || !this.canvas) return;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let allIdle = true;
    for (let i = 0; i < this.pixels.length; i++) {
      const pixel = this.pixels[i];
      pixel[fnName]();
      if (!pixel.isIdle) {
        allIdle = false;
      }
    }
    if (allIdle) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  handleAnimation(name) {
    cancelAnimationFrame(this.animationFrame);
    this.animationFrame = requestAnimationFrame(() => this.doAnimate(name));
  }

  addEventListeners() {
    this.onMouseEnter = () => this.handleAnimation("appear");
    this.onMouseLeave = () => this.handleAnimation("disappear");
    this.onFocus = (e) => {
      if (this.noFocus) return;
      if (e.currentTarget.contains(e.relatedTarget)) return;
      this.handleAnimation("appear");
    };
    this.onBlur = (e) => {
      if (this.noFocus) return;
      if (e.currentTarget.contains(e.relatedTarget)) return;
      this.handleAnimation("disappear");
    };

    this.element.addEventListener('mouseenter', this.onMouseEnter);
    this.element.addEventListener('mouseleave', this.onMouseLeave);
    
    if (!this.noFocus) {
      this.element.addEventListener('focus', this.onFocus);
      this.element.addEventListener('blur', this.onBlur);
      this.element.setAttribute('tabindex', '0');
    }
  }

  setupResizeObserver() {
    this.resizeObserver = new ResizeObserver(() => {
      this.initPixels();
    });
    this.resizeObserver.observe(this.element);
  }

  destroy() {
    // Clean up event listeners
    this.element.removeEventListener('mouseenter', this.onMouseEnter);
    this.element.removeEventListener('mouseleave', this.onMouseLeave);
    this.element.removeEventListener('focus', this.onFocus);
    this.element.removeEventListener('blur', this.onBlur);
    
    // Clean up animation
    cancelAnimationFrame(this.animationFrame);
    
    // Clean up resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    // Remove canvas
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    
    // Remove class
    this.element.classList.remove('pixel-card');
  }
}

// Auto-initialize all images on page load
document.addEventListener('DOMContentLoaded', function() {
  // Find all images in the document
  const images = document.querySelectorAll('img');
  
  images.forEach(img => {
    // Wait for image to load before initializing pixel effect
    if (img.complete) {
      new PixelCard(img.parentElement, { variant: 'purple' });
    } else {
      img.addEventListener('load', () => {
        new PixelCard(img.parentElement, { variant: 'purple' });
      });
    }
  });
});

// Export for manual initialization
window.PixelCard = PixelCard; 
// GlareHover - Vanilla JavaScript Implementation
class GlareHover {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            width: "auto",
            height: "auto", 
            background: "transparent",
            borderRadius: "0px",
            borderColor: "transparent",
            glareColor: "#ffffff",
            glareOpacity: 0.5,
            glareAngle: -45,
            glareSize: 250,
            transitionDuration: 650,
            playOnce: false,
            className: "",
            ...options
        };
        
        this.hasPlayed = false;
        this.init();
    }

    init() {
        this.setupElement();
        this.setCSSVariables();
        this.addEventListeners();
    }

    setupElement() {
        // Add base glare-hover class
        this.element.classList.add('glare-hover');
        
        // Add text-specific class for text elements
        if (this.options.className.includes('text') || this.element.tagName.toLowerCase() === 'span') {
            this.element.classList.add('glare-hover--text');
        }
        
        // Add play-once class if needed
        if (this.options.playOnce) {
            this.element.classList.add('glare-hover--play-once');
        }
        
        // Add custom class
        if (this.options.className) {
            this.element.classList.add(this.options.className);
        }
    }

    setCSSVariables() {
        const rgba = this.hexToRgba(this.options.glareColor, this.options.glareOpacity);
        
        const vars = {
            '--gh-width': this.options.width,
            '--gh-height': this.options.height,
            '--gh-bg': this.options.background,
            '--gh-br': this.options.borderRadius,
            '--gh-angle': `${this.options.glareAngle}deg`,
            '--gh-duration': `${this.options.transitionDuration}ms`,
            '--gh-size': `${this.options.glareSize}%`,
            '--gh-rgba': rgba,
            '--gh-border': this.options.borderColor,
        };

        Object.entries(vars).forEach(([property, value]) => {
            this.element.style.setProperty(property, value);
        });
    }

    hexToRgba(hex, opacity) {
        // Remove # if present
        hex = hex.replace('#', '');
        
        let r, g, b;
        
        if (hex.length === 6) {
            r = parseInt(hex.slice(0, 2), 16);
            g = parseInt(hex.slice(2, 4), 16);
            b = parseInt(hex.slice(4, 6), 16);
        } else if (hex.length === 3) {
            r = parseInt(hex[0] + hex[0], 16);
            g = parseInt(hex[1] + hex[1], 16);
            b = parseInt(hex[2] + hex[2], 16);
        } else {
            // Invalid hex, return default
            return `rgba(255, 255, 255, ${opacity})`;
        }
        
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    addEventListeners() {
        if (this.options.playOnce) {
            this.element.addEventListener('mouseenter', () => {
                if (!this.hasPlayed) {
                    this.hasPlayed = true;
                    this.element.classList.add('played');
                }
            });
        }
        
        // Add additional hover effects
        this.element.addEventListener('mouseenter', this.onMouseEnter.bind(this));
        this.element.addEventListener('mouseleave', this.onMouseLeave.bind(this));
    }

    onMouseEnter() {
        // Optional: Add custom enter effects
        this.element.style.transition = `all ${this.options.transitionDuration}ms ease`;
    }

    onMouseLeave() {
        // Optional: Add custom leave effects
    }

    // Method to update options dynamically
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
        this.setCSSVariables();
    }

    // Method to reset play-once state
    reset() {
        if (this.options.playOnce) {
            this.hasPlayed = false;
            this.element.classList.remove('played');
        }
    }

    // Method to destroy the instance
    destroy() {
        this.element.classList.remove('glare-hover', 'glare-hover--text', 'glare-hover--play-once');
        
        // Remove CSS variables
        const vars = ['--gh-width', '--gh-height', '--gh-bg', '--gh-br', '--gh-angle', '--gh-duration', '--gh-size', '--gh-rgba', '--gh-border'];
        vars.forEach(prop => {
            this.element.style.removeProperty(prop);
        });
    }
}

// Enhanced GlareHover with presets
class EnhancedGlareHover extends GlareHover {
    constructor(element, options = {}) {
        super(element, options);
        this.presets = {
            subtle: {
                glareOpacity: 0.3,
                glareSize: 200,
                transitionDuration: 800,
                glareAngle: -30
            },
            dramatic: {
                glareOpacity: 0.8,
                glareSize: 300,
                transitionDuration: 500,
                glareAngle: -45
            },
            fast: {
                glareOpacity: 0.6,
                glareSize: 250,
                transitionDuration: 300,
                glareAngle: -60
            },
            slow: {
                glareOpacity: 0.4,
                glareSize: 280,
                transitionDuration: 1000,
                glareAngle: -35
            }
        };
    }

    applyPreset(presetName) {
        if (this.presets[presetName]) {
            this.updateOptions(this.presets[presetName]);
        }
    }
}

// Auto-initialize function
function initGlareHover() {
    // Initialize glare hover on all word-highlight elements (CREATIVE and DEVELOPER)
    const highlightElements = document.querySelectorAll('.word-highlight');
    highlightElements.forEach((element, index) => {
        new EnhancedGlareHover(element, {
            glareColor: "#ffffff",
            glareOpacity: 0.7,
            glareAngle: -45,
            glareSize: 300,
            transitionDuration: 650,
            playOnce: false,
            className: index === 0 ? "creative-glare" : "developer-glare"
        });
    });

    // Initialize on any elements with data-glare attribute
    const glareElements = document.querySelectorAll('[data-glare]');
    glareElements.forEach(element => {
        const options = {};
        
        // Parse data attributes
        if (element.dataset.glareColor) options.glareColor = element.dataset.glareColor;
        if (element.dataset.glareOpacity) options.glareOpacity = parseFloat(element.dataset.glareOpacity);
        if (element.dataset.glareAngle) options.glareAngle = parseInt(element.dataset.glareAngle);
        if (element.dataset.glareSize) options.glareSize = parseInt(element.dataset.glareSize);
        if (element.dataset.glareDuration) options.transitionDuration = parseInt(element.dataset.glareDuration);
        if (element.dataset.glareOnce) options.playOnce = element.dataset.glareOnce === 'true';
        
        new GlareHover(element, options);
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initGlareHover();
});

// Export for global use
if (typeof window !== 'undefined') {
    window.GlareHover = GlareHover;
    window.EnhancedGlareHover = EnhancedGlareHover;
    window.initGlareHover = initGlareHover;
} 
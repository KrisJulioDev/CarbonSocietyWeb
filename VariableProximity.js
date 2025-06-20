// VariableProximity - Vanilla JavaScript Implementation
class VariableProximity {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            fromFontVariationSettings: "'wght' 400, 'wdth' 100",
            toFontVariationSettings: "'wght' 900, 'wdth' 125",
            radius: 80,
            falloff: "exponential",
            containerRef: null,
            ...options
        };
        
        this.letterRefs = [];
        this.interpolatedSettings = [];
        this.mousePosition = { x: 0, y: 0 };
        this.lastPosition = { x: null, y: null };
        this.animationId = null;
        this.isMouseInContainer = false;
        
        this.init();
    }

    init() {
        this.setupLetters();
        this.setupMouseTracking();
        this.startAnimation();
    }

    setupLetters() {
        const text = this.element.textContent;
        const words = text.split(' ');
        
        // Clear existing content
        this.element.innerHTML = '';
        this.element.classList.add('variable-proximity');
        
        let letterIndex = 0;
        
        words.forEach((word, wordIndex) => {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'variable-proximity-word';
            
            word.split('').forEach(letter => {
                const letterSpan = document.createElement('span');
                letterSpan.className = 'variable-proximity-letter';
                letterSpan.textContent = letter;
                letterSpan.style.fontVariationSettings = this.options.fromFontVariationSettings;
                
                this.letterRefs[letterIndex] = letterSpan;
                wordSpan.appendChild(letterSpan);
                letterIndex++;
            });
            
            this.element.appendChild(wordSpan);
            
            // Add space between words
            if (wordIndex < words.length - 1) {
                const spaceSpan = document.createElement('span');
                spaceSpan.className = 'variable-proximity-space';
                spaceSpan.innerHTML = '&nbsp;';
                this.element.appendChild(spaceSpan);
            }
        });
        
        // Add screen reader text
        const srSpan = document.createElement('span');
        srSpan.className = 'sr-only';
        srSpan.textContent = text;
        this.element.appendChild(srSpan);
    }

    setupMouseTracking() {
        const container = this.options.containerRef || document.body;
        
        const updatePosition = (x, y) => {
            if (container) {
                const rect = container.getBoundingClientRect();
                this.mousePosition = { 
                    x: x - rect.left, 
                    y: y - rect.top 
                };
            } else {
                this.mousePosition = { x, y };
            }
        };

        const handleMouseMove = (ev) => {
            updatePosition(ev.clientX, ev.clientY);
            this.isMouseInContainer = true;
        };

        const handleMouseLeave = () => {
            this.isMouseInContainer = false;
            // Reset all letters to default state
            this.letterRefs.forEach(letterRef => {
                if (letterRef) {
                    letterRef.style.fontVariationSettings = this.options.fromFontVariationSettings;
                }
            });
        };

        const handleTouchMove = (ev) => {
            const touch = ev.touches[0];
            updatePosition(touch.clientX, touch.clientY);
            this.isMouseInContainer = true;
        };

        // Use container or document for event listeners
        const eventTarget = this.options.containerRef || document;
        
        eventTarget.addEventListener('mousemove', handleMouseMove);
        eventTarget.addEventListener('mouseleave', handleMouseLeave);
        eventTarget.addEventListener('touchmove', handleTouchMove);
        
        // Store references for cleanup
        this.eventListeners = {
            target: eventTarget,
            mousemove: handleMouseMove,
            mouseleave: handleMouseLeave,
            touchmove: handleTouchMove
        };
    }

    parseFontVariationSettings(settingsStr) {
        const settings = new Map();
        const pairs = settingsStr.split(',').map(s => s.trim());
        
        pairs.forEach(pair => {
            const match = pair.match(/'([^']+)'\s+([\d.-]+)/);
            if (match) {
                settings.set(match[1], parseFloat(match[2]));
            }
        });
        
        return settings;
    }

    calculateDistance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    calculateFalloff(distance) {
        const norm = Math.min(Math.max(1 - distance / this.options.radius, 0), 1);
        
        switch (this.options.falloff) {
            case "exponential":
                return norm ** 2;
            case "gaussian":
                return Math.exp(-((distance / (this.options.radius / 2)) ** 2) / 2);
            case "linear":
            default:
                return norm;
        }
    }

    animationLoop() {
        if (!this.isMouseInContainer) {
            this.animationId = requestAnimationFrame(() => this.animationLoop());
            return;
        }

        const container = this.options.containerRef || document.body;
        if (!container) {
            this.animationId = requestAnimationFrame(() => this.animationLoop());
            return;
        }

        const { x, y } = this.mousePosition;
        
        // Skip if mouse hasn't moved
        if (this.lastPosition.x === x && this.lastPosition.y === y) {
            this.animationId = requestAnimationFrame(() => this.animationLoop());
            return;
        }
        
        this.lastPosition = { x, y };
        const containerRect = container.getBoundingClientRect();
        
        // Parse font settings once
        const fromSettings = this.parseFontVariationSettings(this.options.fromFontVariationSettings);
        const toSettings = this.parseFontVariationSettings(this.options.toFontVariationSettings);
        
        const parsedSettings = Array.from(fromSettings.entries()).map(([axis, fromValue]) => ({
            axis,
            fromValue,
            toValue: toSettings.get(axis) ?? fromValue,
        }));

        this.letterRefs.forEach((letterRef, index) => {
            if (!letterRef) return;

            const rect = letterRef.getBoundingClientRect();
            const letterCenterX = rect.left + rect.width / 2 - containerRect.left;
            const letterCenterY = rect.top + rect.height / 2 - containerRect.top;

            const distance = this.calculateDistance(x, y, letterCenterX, letterCenterY);

            if (distance >= this.options.radius) {
                letterRef.style.fontVariationSettings = this.options.fromFontVariationSettings;
                return;
            }

            const falloffValue = this.calculateFalloff(distance);
            const newSettings = parsedSettings
                .map(({ axis, fromValue, toValue }) => {
                    const interpolatedValue = fromValue + (toValue - fromValue) * falloffValue;
                    return `'${axis}' ${interpolatedValue}`;
                })
                .join(', ');

            this.interpolatedSettings[index] = newSettings;
            letterRef.style.fontVariationSettings = newSettings;
        });

        this.animationId = requestAnimationFrame(() => this.animationLoop());
    }

    startAnimation() {
        this.animationLoop();
    }

    destroy() {
        // Cancel animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Remove event listeners
        if (this.eventListeners) {
            const { target, mousemove, mouseleave, touchmove } = this.eventListeners;
            target.removeEventListener('mousemove', mousemove);
            target.removeEventListener('mouseleave', mouseleave);
            target.removeEventListener('touchmove', touchmove);
        }
        
        // Reset element
        this.element.classList.remove('variable-proximity');
        this.letterRefs = [];
        this.interpolatedSettings = [];
    }
}

// Auto-initialization function
function initVariableProximity() {
    // Initialize on all section headings
    const sectionHeadings = document.querySelectorAll('.section-heading');
    
    sectionHeadings.forEach(heading => {
        new VariableProximity(heading, {
            fromFontVariationSettings: "'wght' 1500, 'wdth' 100",
            toFontVariationSettings: "'wght' 200, 'wdth' 110",
            radius: 1000,
            falloff: "exponential",
            containerRef: heading.closest('.section')
        });
    });
}

// Export for global use
if (typeof window !== 'undefined') {
    window.VariableProximity = VariableProximity;
    window.initVariableProximity = initVariableProximity;
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for other scripts to load
    setTimeout(initVariableProximity, 200);
}); 
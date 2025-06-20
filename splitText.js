// Split Text Animation Class - Vanilla JS implementation
class SplitTextAnimation {
    constructor(options = {}) {
        this.options = {
            delay: 100,
            duration: 0.6,
            ease: "power3.out",
            splitType: "chars",
            from: { opacity: 0, y: 40 },
            to: { opacity: 1, y: 0 },
            threshold: 0.1,
            rootMargin: "-100px",
            stagger: true,
            ...options
        };
        
        this.animations = [];
        this.init();
    }

    init() {
        // Register GSAP plugins
        if (typeof gsap !== 'undefined' && gsap.registerPlugin) {
            gsap.registerPlugin(ScrollTrigger);
        }

        // Find all elements with split-text class
        const elements = document.querySelectorAll('.split-text');
        elements.forEach(element => this.createSplitAnimation(element));
    }

    createSplitAnimation(element) {
        const text = element.textContent;
        const splitType = element.dataset.split || this.options.splitType;
        
        // Clear the element
        element.innerHTML = '';
        
        // Create split elements based on type
        let splitElements = [];
        
        switch (splitType) {
            case 'chars':
                splitElements = this.splitIntoChars(text, element);
                break;
            case 'words':
                splitElements = this.splitIntoWords(text, element);
                break;
            case 'lines':
                splitElements = this.splitIntoLines(text, element);
                break;
            default:
                splitElements = this.splitIntoChars(text, element);
        }

        // Set initial state
        gsap.set(splitElements, {
            ...this.options.from,
            force3D: true
        });

        // Create ScrollTrigger animation
        const timeline = gsap.timeline({
            scrollTrigger: {
                trigger: element,
                start: `top ${(1 - this.options.threshold) * 100}%${this.parseRootMargin()}`,
                toggleActions: "play none none none",
                once: true,
            },
            onComplete: () => {
                // Clean up after animation
                gsap.set(splitElements, {
                    ...this.options.to,
                    clearProps: "willChange"
                });
            }
        });

        // Animate the split elements
        timeline.to(splitElements, {
            ...this.options.to,
            duration: this.options.duration,
            ease: this.options.ease,
            stagger: this.options.stagger ? this.options.delay / 1000 : 0,
            force3D: true
        });

        this.animations.push(timeline);
    }

    splitIntoChars(text, container) {
        const chars = [];
        const words = text.split(' ');
        
        words.forEach((word, wordIndex) => {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'split-word';
            wordSpan.style.display = 'inline-block';
            wordSpan.style.overflow = 'hidden';
            
            for (let i = 0; i < word.length; i++) {
                const char = word[i];
                const charSpan = document.createElement('span');
                charSpan.className = 'split-char';
                charSpan.textContent = char;
                charSpan.style.display = 'inline-block';
                charSpan.style.willChange = 'transform, opacity';
                
                wordSpan.appendChild(charSpan);
                chars.push(charSpan);
            }
            
            container.appendChild(wordSpan);
            
            // Add space after word (except last word)
            if (wordIndex < words.length - 1) {
                const spaceSpan = document.createElement('span');
                spaceSpan.className = 'split-char';
                spaceSpan.innerHTML = '&nbsp;';
                spaceSpan.style.display = 'inline-block';
                spaceSpan.style.willChange = 'transform, opacity';
                
                container.appendChild(spaceSpan);
                chars.push(spaceSpan);
            }
        });
        
        return chars;
    }

    splitIntoWords(text, container) {
        const words = [];
        const wordArray = text.split(' ');
        
        wordArray.forEach((word, index) => {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'split-word';
            wordSpan.textContent = word;
            wordSpan.style.display = 'inline-block';
            wordSpan.style.marginRight = '0.3em';
            wordSpan.style.willChange = 'transform, opacity';
            
            container.appendChild(wordSpan);
            words.push(wordSpan);
        });
        
        return words;
    }

    splitIntoLines(text, container) {
        // For lines, we'll treat each line break as a separate element
        const lines = text.split('\n');
        const lineElements = [];
        
        lines.forEach(line => {
            const lineSpan = document.createElement('span');
            lineSpan.className = 'split-line';
            lineSpan.textContent = line;
            lineSpan.style.display = 'block';
            lineSpan.style.willChange = 'transform, opacity';
            
            container.appendChild(lineSpan);
            lineElements.push(lineSpan);
        });
        
        return lineElements;
    }

    parseRootMargin() {
        const margin = this.options.rootMargin;
        const match = margin.match(/^(-?\d+)px$/);
        if (match) {
            const value = parseInt(match[1], 10);
            return value < 0 ? `-=${Math.abs(value)}px` : `+=${value}px`;
        }
        return '';
    }

    destroy() {
        // Clean up all animations
        this.animations.forEach(animation => {
            if (animation.scrollTrigger) {
                animation.scrollTrigger.kill();
            }
            animation.kill();
        });
        this.animations = [];
    }
}

// Enhanced Split Text with different animation presets
class EnhancedSplitText extends SplitTextAnimation {
    constructor(options = {}) {
        super(options);
        this.presets = {
            fadeUp: {
                from: { opacity: 0, y: 40 },
                to: { opacity: 1, y: 0 },
                duration: 0.6,
                ease: "power3.out"
            },
            slideLeft: {
                from: { opacity: 0, x: 50 },
                to: { opacity: 1, x: 0 },
                duration: 0.8,
                ease: "power2.out"
            },
            scale: {
                from: { opacity: 0, scale: 0.8 },
                to: { opacity: 1, scale: 1 },
                duration: 0.5,
                ease: "back.out(1.7)"
            },
            rotate: {
                from: { opacity: 0, rotation: 15, y: 20 },
                to: { opacity: 1, rotation: 0, y: 0 },
                duration: 0.7,
                ease: "power3.out"
            }
        };
    }

    applyPreset(preset) {
        if (this.presets[preset]) {
            this.options = { ...this.options, ...this.presets[preset] };
        }
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait for GSAP to load
    const initSplitText = () => {
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            // Initialize different animations for different elements
            
            // Main heading with dramatic fade up
            new EnhancedSplitText({
                delay: 50,
                duration: 0.8,
                ease: "power3.out",
                from: { opacity: 0, y: 60, rotationX: 45 },
                to: { opacity: 1, y: 0, rotationX: 0 },
                threshold: 0.2
            });
            
            // Add special animation for the highlighted word "CREATIVE"
            setTimeout(() => {
                const creativeElement = document.querySelector('.word-highlight.split-text');
                if (creativeElement) {
                    // Add extra sparkle effect to CREATIVE
                    const chars = creativeElement.querySelectorAll('.split-char');
                    chars.forEach((char, index) => {
                        gsap.to(char, {
                            scale: 1.1,
                            duration: 0.3,
                            delay: index * 0.1 + 1.5,
                            yoyo: true,
                            repeat: 1,
                            ease: "power2.inOut"
                        });
                    });
                }
            }, 2000);
            
        } else {
            // Retry if GSAP hasn't loaded yet
            setTimeout(initSplitText, 100);
        }
    };
    
    initSplitText();
});

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.SplitTextAnimation = SplitTextAnimation;
    window.EnhancedSplitText = EnhancedSplitText;
} 
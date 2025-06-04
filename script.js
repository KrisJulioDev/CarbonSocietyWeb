// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Dashboard Tab Switching
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            // Close all FAQ items
            faqItems.forEach(faqItem => {
                faqItem.classList.remove('active');
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // Pricing Toggle (Monthly/Yearly)
    const pricingToggle = document.querySelector('.toggle-switch');
    const pricingAmounts = {
        starter: { monthly: 29, yearly: 23 },
        pro: { monthly: 79, yearly: 63 },
        enterprise: { monthly: 199, yearly: 159 }
    };

    if (pricingToggle) {
        pricingToggle.addEventListener('click', function() {
            const slider = this.querySelector('.toggle-slider');
            const isYearly = slider.style.transform === 'translateX(30px)';
            
            if (isYearly) {
                // Switch to monthly
                slider.style.transform = 'translateX(0px)';
                updatePricing('monthly');
            } else {
                // Switch to yearly
                slider.style.transform = 'translateX(30px)';
                updatePricing('yearly');
            }
        });
    }

    function updatePricing(period) {
        const amountElements = document.querySelectorAll('.amount');
        amountElements.forEach((element, index) => {
            const plans = ['starter', 'pro', 'enterprise'];
            const plan = plans[index];
            if (pricingAmounts[plan]) {
                element.textContent = pricingAmounts[plan][period];
            }
        });
    }

    // Smooth Scrolling for Navigation Links
    const navLinks = document.querySelectorAll('.nav-link, .footer-section a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 70; // Account for fixed navbar
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
                
                // Close mobile menu if open
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    hamburger.classList.remove('active');
                }
            }
        });
    });

    // Navbar Background on Scroll
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });

    // Intersection Observer for Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Add glow effect for dark theme
                if (entry.target.classList.contains('feature')) {
                    entry.target.style.boxShadow = '0 0 30px rgba(0, 102, 204, 0.1)';
                }
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature, .testimonial, .pricing-card');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(el);
    });

    // Button Click Handlers
    const ctaButtons = document.querySelectorAll('.cta-button');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Add click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);

            // Handle different button actions
            const buttonText = this.textContent.toLowerCase();
            
            if (buttonText.includes('demo') || buttonText.includes('watch')) {
                e.preventDefault();
                showDemo();
            } else if (buttonText.includes('trial') || buttonText.includes('started')) {
                e.preventDefault();
                showSignup();
            } else if (buttonText.includes('schedule')) {
                e.preventDefault();
                showContactForm();
            }
        });
    });

    // Demo Modal (placeholder)
    function showDemo() {
        alert('Demo video would open here! This is a placeholder for the actual demo functionality.');
    }

    // Signup Modal (placeholder)
    function showSignup() {
        alert('Signup form would open here! This is a placeholder for the actual signup functionality.');
    }

    // Contact Form Modal (placeholder)
    function showContactForm() {
        alert('Contact form would open here! This is a placeholder for the actual contact functionality.');
    }

    // Stats Counter Animation with glowing effect
    function animateStats() {
        const stats = document.querySelectorAll('.stat-number');
        
        stats.forEach(stat => {
            const target = parseInt(stat.textContent.replace(/\D/g, ''));
            const suffix = stat.textContent.replace(/[0-9]/g, '');
            let current = 0;
            const increment = target / 50;
            
            // Add glow effect
            stat.style.textShadow = '0 0 10px rgba(0, 102, 204, 0.5)';
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                stat.textContent = Math.floor(current) + suffix;
            }, 30);
        });
    }

    // Trigger stats animation when hero section is visible
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        const heroObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateStats();
                    heroObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        heroObserver.observe(heroSection);
    }

    // Form Submission Handlers (for future forms)
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;
            
            // Simulate form submission
            setTimeout(() => {
                alert('Thank you for your interest! We\'ll be in touch soon.');
                this.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 2000);
        });
    });

    // Keyboard Navigation
    document.addEventListener('keydown', function(e) {
        // ESC key to close modals/menus
        if (e.key === 'Escape') {
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        }
        
        // Arrow keys for tab navigation
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            const activeTab = document.querySelector('.tab-button.active');
            if (activeTab) {
                const tabs = Array.from(tabButtons);
                const currentIndex = tabs.indexOf(activeTab);
                let newIndex;
                
                if (e.key === 'ArrowLeft') {
                    newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
                } else {
                    newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
                }
                
                tabs[newIndex].click();
            }
        }
    });

    // Console welcome message
    console.log(`
    🚗 Welcome to CarbonSociety! 
    
    Thanks for checking out our landing page.
    This is a demo site showcasing our car club organizer platform.
    
    Built with vanilla HTML, CSS, and JavaScript.
    Ready for GitHub Pages deployment!
    `);
});

// Additional CSS for mobile menu (added via JS to avoid conflicts)
const mobileMenuCSS = `
    @media (max-width: 768px) {
        .nav-menu {
            position: fixed;
            left: -100%;
            top: 70px;
            flex-direction: column;
            background-color: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(10px);
            width: 100%;
            text-align: center;
            transition: 0.3s;
            box-shadow: 0 10px 27px rgba(0, 0, 0, 0.05);
            padding: 20px 0;
        }

        .nav-menu.active {
            left: 0;
        }

        .nav-menu .nav-link {
            padding: 15px;
            display: block;
            border-bottom: 1px solid #eee;
        }

        .nav-menu .cta-button {
            margin: 20px;
        }

        .hamburger.active span:nth-child(1) {
            transform: rotate(-45deg) translate(-5px, 6px);
        }

        .hamburger.active span:nth-child(2) {
            opacity: 0;
        }

        .hamburger.active span:nth-child(3) {
            transform: rotate(45deg) translate(-5px, -6px);
        }
    }
`;

// Add mobile menu CSS to document
const style = document.createElement('style');
style.textContent = mobileMenuCSS;
document.head.appendChild(style); 
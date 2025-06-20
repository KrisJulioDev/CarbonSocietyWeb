// DOM elements
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');
const navSidebar = document.querySelector('.nav-sidebar');
const primaryBtns = document.querySelectorAll('.primary-btn');

// Navigation functionality
function showSection(targetId) {
    // Hide all sections
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update active nav link
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[data-section="${targetId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// Navigation click handlers will be added later with animation

// "View My Work" button functionality
const viewWorkBtn = document.querySelector('.home-section .primary-btn');
if (viewWorkBtn) {
    viewWorkBtn.addEventListener('click', () => {
        scrollToSection('works');
    });
}

// Contact form functionality
const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message')
        };
        
        // Simple validation
        if (!data.name || !data.email || !data.message) {
            alert('Please fill in all required fields.');
            return;
        }
        
        // Simulate form submission
        alert('Thank you for your message! I\'ll get back to you soon.');
        contactForm.reset();
    });
}

// Theme switcher removed from HTML

// Mobile navigation toggle (hamburger menu)
function createMobileMenuToggle() {
    if (window.innerWidth <= 768) {
        // Create hamburger button if it doesn't exist
        let mobileToggle = document.querySelector('.mobile-nav-toggle');
        if (!mobileToggle) {
            mobileToggle = document.createElement('button');
            mobileToggle.className = 'mobile-nav-toggle';
            mobileToggle.innerHTML = '☰';
            mobileToggle.setAttribute('aria-label', 'Toggle navigation menu');
            mobileToggle.setAttribute('aria-expanded', 'false');
            document.body.appendChild(mobileToggle);
            
            // Add click event
            mobileToggle.addEventListener('click', () => {
                const isActive = navSidebar.classList.toggle('active');
                mobileToggle.innerHTML = isActive ? '✕' : '☰';
                mobileToggle.setAttribute('aria-expanded', isActive.toString());
                
                // Prevent body scroll when menu is open
                document.body.style.overflow = isActive ? 'hidden' : '';
            });
            
            // Add touch event for better mobile response
            mobileToggle.addEventListener('touchstart', (e) => {
                e.preventDefault();
                mobileToggle.click();
            }, { passive: false });
        }
    } else {
        // Remove mobile toggle on desktop
        const mobileToggle = document.querySelector('.mobile-nav-toggle');
        if (mobileToggle) {
            mobileToggle.remove();
        }
        navSidebar.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close mobile menu when clicking outside
function handleOutsideClick(e) {
    if (window.innerWidth <= 768) {
        const mobileToggle = document.querySelector('.mobile-nav-toggle');
        if (navSidebar.classList.contains('active') && 
            !navSidebar.contains(e.target) && 
            !mobileToggle.contains(e.target)) {
            navSidebar.classList.remove('active');
            mobileToggle.innerHTML = '☰';
            mobileToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    }
}

// Navigation collapse functionality removed

// Intersection Observer for section animations
function initSectionAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '-50px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Add fade-in class to all sections except home
    sections.forEach((section, index) => {
        if (index > 0) { // Skip home section
            section.classList.add('fade-in');
        }
        observer.observe(section);
    });
}

// Smooth scroll to section
function scrollToSection(targetId) {
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
        // Set programmatic scroll flag
        isProgrammaticScroll = true;
        
        targetSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        
        // Clear any existing timeout
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        
        // Reset flag after scroll animation completes
        scrollTimeout = setTimeout(() => {
            isProgrammaticScroll = false;
            // Force an immediate update after programmatic scroll
            updateActiveNavLink();
        }, 800);
    }
}

// Show section with animation (for keyboard navigation)
function showSectionWithAnimation(targetId) {
    // Update active nav link immediately
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[data-section="${targetId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Scroll to section
    scrollToSection(targetId);
}

// Track if we're in programmatic scroll (to prevent conflicts)
let isProgrammaticScroll = false;
let scrollTimeout = null;

// Update active nav link based on scroll position
function updateActiveNavLink() {
    const scrollPosition = window.scrollY + 100; // Offset for better detection
    let activeSection = null;
    let currentSectionData = { id: null, distance: Infinity };
    
    // Find the section that's most prominently visible
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        const sectionCenter = sectionTop + (sectionHeight / 2);
        const viewportCenter = window.scrollY + (window.innerHeight / 2);
        const distanceFromCenter = Math.abs(sectionCenter - viewportCenter);
        
        // Check if section is in viewport
        if (scrollPosition >= sectionTop - 200 && scrollPosition < sectionTop + sectionHeight + 200) {
            if (distanceFromCenter < currentSectionData.distance) {
                currentSectionData = { id: sectionId, distance: distanceFromCenter };
                activeSection = sectionId;
            }
        }
    });
    
    // Special cases for edge positions
    if (window.scrollY <= 50) {
        activeSection = 'home';
    } else if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
        activeSection = 'contact';
    }
    
    // Update navigation if we found an active section
    if (activeSection) {
        const currentActiveLink = document.querySelector('.nav-link.active');
        const newActiveLink = document.querySelector(`[data-section="${activeSection}"]`);
        
        // Only update if the active section has changed
        if (currentActiveLink !== newActiveLink) {
            // Remove active class from all nav links
            navLinks.forEach(link => {
                link.classList.remove('active');
            });
            
            // Add active class to current section's nav link
            if (newActiveLink) {
                newActiveLink.classList.add('active');
                console.log(`Navigation updated to: ${activeSection}`);
            }
        }
    }
}

// Navigation click handlers for smooth scrolling
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSection = link.getAttribute('data-section');
        
        // Immediately update active state
        navLinks.forEach(navLink => {
            navLink.classList.remove('active');
        });
        link.classList.add('active');
        
        scrollToSection(targetSection);
        
        // Close mobile nav if open
        if (window.innerWidth <= 768) {
            navSidebar.classList.remove('active');
            const mobileToggle = document.querySelector('.mobile-nav-toggle');
            if (mobileToggle) {
                mobileToggle.innerHTML = '☰';
                mobileToggle.setAttribute('aria-expanded', 'false');
            }
            document.body.style.overflow = '';
        }
    });
    
    // Add touch handling for better mobile experience
    link.addEventListener('touchstart', (e) => {
        link.style.backgroundColor = 'rgba(79, 70, 229, 0.1)';
    });
    
    link.addEventListener('touchend', (e) => {
        setTimeout(() => {
            link.style.backgroundColor = '';
        }, 150);
    });
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    const currentActive = document.querySelector('.nav-link.active');
    const currentIndex = Array.from(navLinks).indexOf(currentActive);
    
    switch(e.key) {
        case 'ArrowUp':
            e.preventDefault();
            if (currentIndex > 0) {
                const targetSection = navLinks[currentIndex - 1].getAttribute('data-section');
                showSectionWithAnimation(targetSection);
            }
            break;
        case 'ArrowDown':
            e.preventDefault();
            if (currentIndex < navLinks.length - 1) {
                const targetSection = navLinks[currentIndex + 1].getAttribute('data-section');
                showSectionWithAnimation(targetSection);
            }
            break;
        case 'Escape':
            if (window.innerWidth <= 768) {
                navSidebar.classList.remove('active');
                const mobileToggle = document.querySelector('.mobile-nav-toggle');
                if (mobileToggle) {
                    mobileToggle.innerHTML = '☰';
                }
            }
            break;
    }
});

// Parallax effect for decorative elements
function initParallax() {
    const decorativeElements = document.querySelectorAll('.decorative-chevron, .decorative-asterisk');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.3;
        
        decorativeElements.forEach(element => {
            element.style.transform = `translateY(${rate}px) rotate(45deg)`;
        });
    });
}

// Image hover effects
function initImageEffects() {
    const images = document.querySelectorAll('.image-placeholder, .project-image, .stacked-image');
    
    images.forEach(image => {
        image.addEventListener('mouseenter', () => {
            image.style.transform = image.style.transform.replace(/scale\([^)]*\)/, '') + ' scale(1.05)';
            image.style.transition = 'transform 0.3s ease';
        });
        
        image.addEventListener('mouseleave', () => {
            image.style.transform = image.style.transform.replace(/scale\([^)]*\)/, '');
        });
    });
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for GSAP and split text to initialize
    setTimeout(() => {
        // Initialize scroll-based navigation
        console.log('Initializing scroll navigation...');
        
        // Set initial active nav link
        updateActiveNavLink();
        
        // Add optimized scroll event listener
        let scrollTicking = false;
        
        function handleScroll() {
            if (!scrollTicking) {
                requestAnimationFrame(() => {
                    updateActiveNavLink();
                    scrollTicking = false;
                });
                scrollTicking = true;
            }
        }
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Also listen for resize events to recalculate positions
        window.addEventListener('resize', () => {
            setTimeout(updateActiveNavLink, 100);
        });
        
        // Initialize section animations
        initSectionAnimations();
        
        // Initialize mobile menu
        createMobileMenuToggle();
        
        // Initialize parallax effects
        initParallax();
        
        // Initialize image effects
        initImageEffects();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            createMobileMenuToggle();
        });
        
        // Add touch event listeners for mobile
        document.addEventListener('click', handleOutsideClick);
        document.addEventListener('touchstart', handleOutsideClick);
        
        // Scroll performance is already optimized above
    }, 100);
});

// Handle page visibility for performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when page is not visible
        document.body.style.animationPlayState = 'paused';
    } else {
        // Resume animations when page becomes visible
        document.body.style.animationPlayState = 'running';
    }
});

// Preload next section content for smooth transitions
function preloadSections() {
    sections.forEach(section => {
        const images = section.querySelectorAll('img');
        images.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
        });
    });
}

// Initialize preloading
setTimeout(preloadSections, 1000); 
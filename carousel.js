// Glide.js Carousel Implementation
document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.querySelector('#projects-carousel');
    
    if (!carousel) return;
    
    // Initialize Glide.js carousel with auto-scroll and infinite loop
    const glide = new Glide('#projects-carousel', {
        type: 'carousel',
        perView: 3,
        gap: 48,
        autoplay: 2000, // Auto-scroll every 2 seconds
        hoverpause: true, // Pause on hover
        animationDuration: 800,
        animationTimingFunc: 'ease-in-out',
        focusAt: 'center',
        breakpoints: {
            1200: {
                perView: 2,
                gap: 32
            },
            768: {
                perView: 1,
                gap: 24
            },
            480: {
                perView: 1,
                gap: 16
            }
        }
    });
    
    // Mount the carousel
    glide.mount();
    
    // Prevent image dragging
    const images = carousel.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('dragstart', (e) => {
            e.preventDefault();
        });
    });
    
    // Add custom styling classes for active states
    glide.on('move.after', () => {
        const activeSlides = carousel.querySelectorAll('.glide__slide--active');
        const allSlides = carousel.querySelectorAll('.glide__slide');
        
        // Remove active class from all slides
        allSlides.forEach(slide => {
            slide.classList.remove('slide-active');
        });
        
        // Add active class to center slide
        activeSlides.forEach(slide => {
            slide.classList.add('slide-active');
        });
    });
});

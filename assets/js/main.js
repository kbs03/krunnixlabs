// Service Card Click Handler
document.addEventListener("DOMContentLoaded", function () {
  const serviceCards = document.querySelectorAll('.service-card[role="link"]');

  function handleCardClick(event) {
    // Don't trigger if the click was on the actual link
    if (event.target.tagName === "A" || event.target.closest("a")) {
      return;
    }

    const card = event.currentTarget;
    const href = card.getAttribute("data-href");

    if (href) {
      // Check if it's an internal link or external
      if (href.startsWith("#")) {
        // Internal link - scroll to section
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        // External link - navigate to page
        window.location.href = href;
      }
    }
  }

  function handleCardKeydown(event) {
    // Handle Enter and Space key for keyboard navigation
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCardClick(event);
    }
  }

  // Add event listeners to all service cards
  serviceCards.forEach((card) => {
    card.addEventListener("click", handleCardClick);
    card.addEventListener("keydown", handleCardKeydown);

    // Add aria-label for better accessibility
    const title = card.querySelector("h3")?.textContent;
    const link = card.querySelector(".service-link")?.textContent;
    if (title && link) {
      card.setAttribute("aria-label", `${title} - ${link}`);
    }
  });
});
// Industries Carousel Customization
document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.getElementById('industriesCarousel');
    if (!carousel) return;

    const bsCarousel = new bootstrap.Carousel(carousel, {
        interval: 5000, // 5 seconds autoplay
        wrap: true,
        pause: false // We'll handle pause on hover manually
    });

    let autoplayInterval;
    let isPaused = false;

    function startAutoplay() {
        if (autoplayInterval) clearInterval(autoplayInterval);
        
        autoplayInterval = setInterval(() => {
            if (!isPaused) {
                bsCarousel.next();
            }
        }, 5000);
    }

    function pauseAutoplay() {
        isPaused = true;
    }

    function resumeAutoplay() {
        isPaused = false;
    }

    // Pause on hover
    carousel.addEventListener('mouseenter', pauseAutoplay);
    carousel.addEventListener('mouseleave', resumeAutoplay);

    // Pause when interacting with carousel controls
    const carouselControls = carousel.querySelectorAll('[data-bs-slide]');
    carouselControls.forEach(control => {
        control.addEventListener('click', () => {
            pauseAutoplay();
            // Resume after slide transition completes
            setTimeout(resumeAutoplay, 1000);
        });
    });

    // Pause when interacting with industry cards
    const industryCards = carousel.querySelectorAll('.industry-card');
    industryCards.forEach(card => {
        card.addEventListener('mouseenter', pauseAutoplay);
        card.addEventListener('mouseleave', resumeAutoplay);
        
        card.addEventListener('focus', pauseAutoplay);
        card.addEventListener('blur', resumeAutoplay);
    });

    // Handle visibility change (tab switching)
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            pauseAutoplay();
        } else {
            resumeAutoplay();
        }
    });

    // Start autoplay
    startAutoplay();

    // Cleanup on page unload
    window.addEventListener('beforeunload', function() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
        }
    });

    // Keyboard navigation support
    carousel.addEventListener('keydown', function(event) {
        if (event.key === 'ArrowLeft') {
            bsCarousel.prev();
            pauseAutoplay();
            setTimeout(resumeAutoplay, 1000);
        } else if (event.key === 'ArrowRight') {
            bsCarousel.next();
            pauseAutoplay();
            setTimeout(resumeAutoplay, 1000);
        }
    });
});

// Client Logos Infinite Scroll
document.addEventListener('DOMContentLoaded', function() {
    const clientsCarousel = document.getElementById('clientsCarousel');
    if (!clientsCarousel) return;

    // Check if reduced motion is preferred
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (reducedMotion) {
        // For users who prefer reduced motion, use a static layout
        clientsCarousel.style.animation = 'none';
        clientsCarousel.style.justifyContent = 'center';
        clientsCarousel.style.flexWrap = 'wrap';
        clientsCarousel.style.gap = '2rem';
        return;
    }

    // Clone logos for seamless infinite scroll
    function cloneLogos() {
        const logos = clientsCarousel.querySelectorAll('.client-logo');
        const logosArray = Array.from(logos);
        
        // Clone all logos and append them
        logosArray.forEach(logo => {
            const clone = logo.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            clientsCarousel.appendChild(clone);
        });
    }

    // Initialize the carousel
    function initLogoCarousel() {
        cloneLogos();
        
        // Pause/play on hover
        const wrapper = clientsCarousel.parentElement;
        let isPaused = false;

        function pauseAnimation() {
            if (!isPaused) {
                clientsCarousel.style.animationPlayState = 'paused';
                isPaused = true;
            }
        }

        function resumeAnimation() {
            if (isPaused) {
                clientsCarousel.style.animationPlayState = 'running';
                isPaused = false;
            }
        }

        // Mouse events
        wrapper.addEventListener('mouseenter', pauseAnimation);
        wrapper.addEventListener('mouseleave', resumeAnimation);

        // Focus events for accessibility
        wrapper.addEventListener('focusin', pauseAnimation);
        wrapper.addEventListener('focusout', resumeAnimation);

        // Touch events for mobile
        wrapper.addEventListener('touchstart', pauseAnimation);
        wrapper.addEventListener('touchend', resumeAnimation);
    }

    // Keyboard navigation for testimonials carousel
    function initTestimonialsKeyboardNav() {
        const testimonialsCarousel = document.getElementById('testimonialsCarousel');
        if (!testimonialsCarousel) return;

        const bsCarousel = new bootstrap.Carousel(testimonialsCarousel);
        
        testimonialsCarousel.addEventListener('keydown', function(event) {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                bsCarousel.prev();
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                bsCarousel.next();
            }
        });

        // Make carousel focusable
        testimonialsCarousel.setAttribute('tabindex', '0');
    }

    // Initialize both carousels
    initLogoCarousel();
    initTestimonialsKeyboardNav();

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Re-initialize if needed for responsive adjustments
            const track = document.getElementById('clientsCarousel');
            if (track) {
                track.style.animation = 'none';
                setTimeout(() => {
                    track.style.animation = 'scroll-logos 30s linear infinite';
                }, 10);
            }
        }, 250);
    });
});

// Blog filtering and search functionality
document.addEventListener('DOMContentLoaded', function() {
    // Category filtering
    const filterButtons = document.querySelectorAll('.categories-filter .btn');
    const blogPosts = document.querySelectorAll('.blog-post-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            // Filter posts
            blogPosts.forEach(post => {
                if (filter === 'all' || post.getAttribute('data-category') === filter) {
                    post.style.display = 'flex';
                } else {
                    post.style.display = 'none';
                }
            });
        });
    });
    
    // Search functionality
    const searchInput = document.querySelector('.blog-search input');
    const searchButton = document.querySelector('.blog-search button');
    
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            // Show all posts if search is empty
            blogPosts.forEach(post => {
                post.style.display = 'flex';
            });
            return;
        }
        
        blogPosts.forEach(post => {
            const title = post.querySelector('h2 a').textContent.toLowerCase();
            const excerpt = post.querySelector('p').textContent.toLowerCase();
            const tags = post.getAttribute('data-tags').toLowerCase();
            
            if (title.includes(searchTerm) || excerpt.includes(searchTerm) || tags.includes(searchTerm)) {
                post.style.display = 'flex';
            } else {
                post.style.display = 'none';
            }
        });
    }
    
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
    
    // Tag cloud filtering
    const tagLinks = document.querySelectorAll('.tag-link');
    tagLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tag = this.textContent.replace('#', '').toLowerCase();
            
            // Update search input
            searchInput.value = tag;
            performSearch();
            
            // Scroll to posts
            document.querySelector('.blog-posts-grid').scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
    
    // Social share functionality
    const shareButtons = document.querySelectorAll('.social-share .btn');
    shareButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const platform = this.querySelector('i').className;
            const url = window.location.href;
            const title = document.title;
            
            let shareUrl;
            
            if (platform.includes('twitter')) {
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
            } else if (platform.includes('linkedin')) {
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
            } else if (platform.includes('facebook')) {
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            } else if (platform.includes('link')) {
                // Copy to clipboard
                navigator.clipboard.writeText(url).then(() => {
                    const originalHtml = this.innerHTML;
                    this.innerHTML = '<i class="fas fa-check"></i>';
                    setTimeout(() => {
                        this.innerHTML = originalHtml;
                    }, 2000);
                });
                return;
            }
            
            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400');
            }
        });
    });
});


// Contact Form Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const leadForm = document.getElementById('leadForm');
    const modalLeadForm = document.getElementById('modalLeadForm');
    const submitButton = document.getElementById('submitButton');
    const modalSubmitButton = document.getElementById('modalSubmitButton');
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
    const leadModal = new bootstrap.Modal(document.getElementById('leadModal'));
    const formLiveRegion = document.getElementById('formLiveRegion');
    const modalFormLiveRegion = document.getElementById('modalFormLiveRegion');

    // Validation patterns
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[\+]?[1-9][\d]{0,15}$/;

    // Utility functions
    function showLoading(button) {
        const submitText = button.querySelector('.submit-text');
        const spinner = button.querySelector('.spinner-border');
        
        submitText.classList.add('visually-hidden');
        spinner.classList.remove('visually-hidden');
        button.disabled = true;
    }

    function hideLoading(button) {
        const submitText = button.querySelector('.submit-text');
        const spinner = button.querySelector('.spinner-border');
        
        submitText.classList.remove('visually-hidden');
        spinner.classList.add('visually-hidden');
        button.disabled = false;
    }

    function announceToScreenReader(message, liveRegion) {
        liveRegion.textContent = message;
        // Clear after announcement
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 1000);
    }

    // Validation functions
    function validateField(field) {
        const value = field.value.trim();
        const isRequired = field.hasAttribute('required');
        
        // Clear previous validation
        field.classList.remove('is-invalid', 'is-valid');
        
        // Skip validation if not required and empty
        if (!isRequired && value === '') {
            return true;
        }
        
        let isValid = true;
        
        switch (field.type) {
            case 'email':
                isValid = emailPattern.test(value);
                break;
            case 'tel':
                if (value !== '') {
                    isValid = phonePattern.test(value.replace(/[\s\-\(\)]/g, ''));
                }
                break;
            case 'file':
                if (field.files.length > 0) {
                    const file = field.files[0];
                    const maxSize = 10 * 1024 * 1024; // 10MB
                    const allowedTypes = ['application/pdf', 'application/msword', 
                                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                                        'image/jpeg', 'image/png', 'application/zip'];
                    
                    isValid = file.size <= maxSize && allowedTypes.includes(file.type);
                }
                break;
            case 'checkbox':
                isValid = field.checked;
                break;
            default:
                if (field.tagName === 'SELECT') {
                    isValid = value !== '';
                } else {
                    isValid = value !== '';
                }
        }
        
        if (!isValid) {
            field.classList.add('is-invalid');
            announceToScreenReader(`Validation error in ${field.previousElementSibling.textContent}`, 
                                 field.closest('form').id === 'leadForm' ? formLiveRegion : modalFormLiveRegion);
        } else {
            field.classList.add('is-valid');
        }
        
        return isValid;
    }

    function validateForm(form) {
        const fields = form.querySelectorAll('input, select, textarea');
        let isValid = true;
        
        fields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });
        
        // Special validation for reCAPTCHA in main form
        if (form.id === 'leadForm') {
            const recaptchaCheckbox = document.getElementById('recaptchaCheckbox');
            if (!recaptchaCheckbox.checked) {
                document.getElementById('recaptchaError').style.display = 'block';
                isValid = false;
            } else {
                document.getElementById('recaptchaError').style.display = 'none';
            }
        }
        
        return isValid;
    }

    // Real-time validation
    function setupRealTimeValidation(form) {
        const fields = form.querySelectorAll('input, select, textarea');
        
        fields.forEach(field => {
            field.addEventListener('blur', () => validateField(field));
            field.addEventListener('input', () => {
                if (field.classList.contains('is-invalid')) {
                    validateField(field);
                }
            });
        });
    }

    // Form submission
    async function submitForm(form, button) {
        if (!validateForm(form)) {
            announceToScreenReader('Please fix the form errors before submitting.', 
                                 form.id === 'leadForm' ? formLiveRegion : modalFormLiveRegion);
            return;
        }
        
        showLoading(button);
        
        // Prepare form data
        const formData = new FormData(form);
        const jsonData = {};
        
        for (let [key, value] of formData.entries()) {
            jsonData[key] = value;
        }
        
        // Add reCAPTCHA token (placeholder for real implementation)
        if (form.id === 'leadForm') {
            jsonData.recaptchaToken = 'simulated_recaptcha_token';
        }
        
        try {
            // Simulate API call
            const response = await simulateApiCall('/api/lead', jsonData);
            
            if (response.success) {
                form.reset();
                // Clear validation states
                form.querySelectorAll('.is-valid').forEach(el => el.classList.remove('is-valid'));
                
                if (form.id === 'leadForm') {
                    successModal.show();
                } else {
                    leadModal.hide();
                    successModal.show();
                }
                
                announceToScreenReader('Form submitted successfully', 
                                     form.id === 'leadForm' ? formLiveRegion : modalFormLiveRegion);
            } else {
                throw new Error(response.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            document.getElementById('errorMessage').textContent = error.message;
            errorModal.show();
            announceToScreenReader('Form submission failed: ' + error.message, 
                                 form.id === 'leadForm' ? formLiveRegion : modalFormLiveRegion);
        } finally {
            hideLoading(button);
        }
    }

    // Simulate API call
    function simulateApiCall(url, data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate random success (90% success rate for demo)
                const isSuccess = Math.random() > 0.1;
                
                if (isSuccess) {
                    resolve({
                        success: true,
                        message: 'Lead submitted successfully',
                        leadId: 'LD_' + Math.random().toString(36).substr(2, 9)
                    });
                } else {
                    reject(new Error('Network error: Unable to connect to server'));
                }
            }, 2000); // Simulate network delay
        });
    }

    // Initialize forms
    function initializeForms() {
        // Main form
        if (leadForm) {
            setupRealTimeValidation(leadForm);
            
            leadForm.addEventListener('submit', (e) => {
                e.preventDefault();
                submitForm(leadForm, submitButton);
            });
        }
        
        // Modal form
        if (modalLeadForm) {
            setupRealTimeValidation(modalLeadForm);
            
            modalSubmitButton.addEventListener('click', (e) => {
                e.preventDefault();
                submitForm(modalLeadForm, modalSubmitButton);
            });
        }
        
        // File upload validation
        const fileUpload = document.getElementById('fileUpload');
        if (fileUpload) {
            fileUpload.addEventListener('change', function() {
                validateField(this);
            });
        }
        
        // reCAPTCHA checkbox validation
        const recaptchaCheckbox = document.getElementById('recaptchaCheckbox');
        if (recaptchaCheckbox) {
            recaptchaCheckbox.addEventListener('change', function() {
                if (this.checked) {
                    document.getElementById('recaptchaError').style.display = 'none';
                }
            });
        }
    }

    // Global function to open lead modal with pre-filled service
    window.openLeadModal = function(service = '') {
        if (service) {
            const serviceSelect = document.getElementById('modalServiceInterest');
            if (serviceSelect) {
                serviceSelect.value = service;
            }
        }
        leadModal.show();
    };

    // Initialize when DOM is loaded
    initializeForms();

    // Service CTA buttons event listeners
    document.addEventListener('click', function(e) {
        if (e.target.matches('[data-service-cta]')) {
            e.preventDefault();
            const service = e.target.getAttribute('data-service-cta');
            window.openLeadModal(service);
        }
    });
});

/* 
reCAPTCHA v2 Integration Guide:

Server-side implementation steps:

1. Get reCAPTCHA keys from Google:
   - Visit https://www.google.com/recaptcha/admin
   - Register your domain and get SITE_KEY and SECRET_KEY

2. Frontend integration (replace placeholder):
   - Add this script in head: <script src="https://www.google.com/recaptcha/api.js" async defer></script>
   - Replace the reCAPTCHA placeholder with:
     <div class="g-recaptcha" data-sitekey="YOUR_SITE_KEY"></div>

3. Backend validation (example in Node.js):
   
   const axios = require('axios');
   
   async function verifyRecaptcha(recaptchaToken) {
     try {
       const response = await axios.post(
         'https://www.google.com/recaptcha/api/siteverify',
         null,
         {
           params: {
             secret: process.env.RECAPTCHA_SECRET_KEY,
             response: recaptchaToken
           }
         }
       );
       
       return response.data.success;
     } catch (error) {
       console.error('reCAPTCHA verification failed:', error);
       return false;
     }
   }

4. In your form submission endpoint:
   
   app.post('/api/lead', async (req, res) => {
     const { recaptchaToken, ...formData } = req.body;
     
     // Verify reCAPTCHA
     const isHuman = await verifyRecaptcha(recaptchaToken);
     if (!isHuman) {
       return res.status(400).json({ 
         success: false, 
         message: 'reCAPTCHA verification failed' 
       });
     }
     
     // Process form data...
   });

*/
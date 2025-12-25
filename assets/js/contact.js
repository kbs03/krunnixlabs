// Add to contact.js - Replace the simulateApiCall function

/**
 * Enhanced form submission with lead routing
 */
async function submitFormWithRouting(form, button) {
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
    
    // Get country code for routing
    const countryCode = jsonData.country || 'US';
    
    try {
        // Initialize lead router
        const router = new LeadRouter();
        const result = await router.submitLead(jsonData, countryCode);
        
        if (result.success) {
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
            
            // Track conversion (if analytics available)
            if (typeof gtag !== 'undefined') {
                gtag('event', 'lead_submitted', {
                    'country': countryCode,
                    'service_interest': jsonData.serviceInterest
                });
            }
        } else {
            throw new Error(result.message);
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

// Update the form submission handlers to use the new function
if (leadForm) {
    setupRealTimeValidation(leadForm);
    
    leadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        submitFormWithRouting(leadForm, submitButton);
    });
}

if (modalLeadForm) {
    setupRealTimeValidation(modalLeadForm);
    
    modalSubmitButton.addEventListener('click', (e) => {
        e.preventDefault();
        submitFormWithRouting(modalLeadForm, modalSubmitButton);
    });
}
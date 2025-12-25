// assets/js/lead-router.js

/**
 * Lead Router - Routes form submissions to appropriate endpoints based on geographic rules
 * Replace this stub with actual CRM integration (HubSpot, Salesforce, etc.)
 */

class LeadRouter {
    constructor() {
        this.endpoints = {
            'default': '/api/lead',
            'eu': '/api/lead/eu',      // GDPR compliant endpoint
            'uk': '/api/lead/uk',      // UK specific endpoint
            'na': '/api/lead/na',      // North America
            'asia': '/api/lead/asia',  // Asia Pacific
            'other': '/api/lead/intl'  // International
        };

        // Country to region mapping
        this.regionMap = {
            // European Union countries
            'AT': 'eu', 'BE': 'eu', 'BG': 'eu', 'HR': 'eu', 'CY': 'eu',
            'CZ': 'eu', 'DK': 'eu', 'EE': 'eu', 'FI': 'eu', 'FR': 'eu',
            'DE': 'eu', 'GR': 'eu', 'HU': 'eu', 'IE': 'eu', 'IT': 'eu',
            'LV': 'eu', 'LT': 'eu', 'LU': 'eu', 'MT': 'eu', 'NL': 'eu',
            'PL': 'eu', 'PT': 'eu', 'RO': 'eu', 'SK': 'eu', 'SI': 'eu',
            'ES': 'eu', 'SE': 'eu',
            
            // United Kingdom (post-Brexit)
            'GB': 'uk', 'UK': 'uk',
            
            // North America
            'US': 'na', 'CA': 'na', 'MX': 'na',
            
            // Asia Pacific
            'JP': 'asia', 'KR': 'asia', 'CN': 'asia', 'SG': 'asia',
            'AU': 'asia', 'NZ': 'asia', 'IN': 'asia', 'MY': 'asia',
            'TH': 'asia', 'VN': 'asia', 'PH': 'asia', 'ID': 'asia'
        };

        this.maxRetries = 3;
        this.retryDelay = 1000; // Start with 1 second
    }

    /**
     * Determine the appropriate endpoint based on country selection
     * @param {string} countryCode - ISO 3166-1 alpha-2 country code
     * @returns {string} Endpoint URL
     */
    getEndpointForCountry(countryCode) {
        const region = this.regionMap[countryCode.toUpperCase()] || 'other';
        return this.endpoints[region] || this.endpoints['default'];
    }

    /**
     * Submit lead data to appropriate endpoint with retry logic
     * @param {Object} leadData - Form data as object
     * @param {string} countryCode - User's country selection
     * @returns {Promise<Object>} Response from server
     */
    async submitLead(leadData, countryCode) {
        const endpoint = this.getEndpointForCountry(countryCode);
        const submissionData = this.prepareLeadData(leadData, countryCode);
        
        console.log(`Routing lead from ${countryCode} to: ${endpoint}`);

        try {
            const response = await this.sendWithRetry(endpoint, submissionData);
            return this.handleSuccess(response, endpoint);
        } catch (error) {
            return this.handleError(error, endpoint, submissionData);
        }
    }

    /**
     * Prepare lead data for submission with additional metadata
     * @param {Object} leadData - Raw form data
     * @param {string} countryCode - User's country
     * @returns {Object} Enhanced lead data
     */
    prepareLeadData(leadData, countryCode) {
        return {
            ...leadData,
            metadata: {
                submittedAt: new Date().toISOString(),
                country: countryCode,
                region: this.regionMap[countryCode.toUpperCase()] || 'other',
                userAgent: navigator.userAgent,
                source: window.location.href,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                // Add UTM parameters if available
                utmSource: this.getUTMParameter('utm_source'),
                utmMedium: this.getUTMParameter('utm_medium'),
                utmCampaign: this.getUTMParameter('utm_campaign')
            }
        };
    }

    /**
     * Get UTM parameter from URL
     * @param {string} name - UTM parameter name
     * @returns {string|null} Parameter value
     */
    getUTMParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    /**
     * Send data to endpoint with exponential backoff retry
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Data to send
     * @param {number} retryCount - Current retry attempt
     * @returns {Promise<Response>} Fetch response
     */
    async sendWithRetry(endpoint, data, retryCount = 0) {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // TODO: Add authentication header for production
                    // 'Authorization': 'Bearer ' + await this.getAuthToken(),
                    'X-Lead-Source': 'website-form'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();

        } catch (error) {
            if (retryCount < this.maxRetries) {
                const delay = this.retryDelay * Math.pow(2, retryCount); // Exponential backoff
                console.warn(`Attempt ${retryCount + 1} failed, retrying in ${delay}ms:`, error.message);
                
                await this.delay(delay);
                return this.sendWithRetry(endpoint, data, retryCount + 1);
            }
            throw error; // Max retries exceeded
        }
    }

    /**
     * Delay utility function
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise} Promise that resolves after delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Handle successful lead submission
     * @param {Object} response - Server response
     * @param {string} endpoint - Endpoint used
     * @returns {Object} Processed response
     */
    handleSuccess(response, endpoint) {
        console.log(`Lead submitted successfully to ${endpoint}:`, response);
        
        // TODO: Add analytics tracking
        // this.trackConversion(response.leadId);
        
        return {
            success: true,
            data: response,
            endpoint: endpoint,
            message: 'Lead submitted successfully'
        };
    }

    /**
     * Handle submission error with fallback options
     * @param {Error} error - Error object
     * @param {string} endpoint - Endpoint that failed
     * @param {Object} data - Data that was being sent
     * @returns {Object} Error response
     */
    handleError(error, endpoint, data) {
        console.error(`Lead submission failed to ${endpoint}:`, error);

        // TODO: Implement fallback strategies:
        // 1. Send to backup endpoint
        // 2. Store in localStorage for later retry
        // 3. Send to email fallback
        // this.fallbackSubmission(data);

        return {
            success: false,
            error: error.message,
            endpoint: endpoint,
            data: data,
            message: 'Failed to submit lead. Please try again or contact us directly.'
        };
    }

    /**
     * Fallback submission method (stub for implementation)
     * @param {Object} data - Lead data to store for retry
     */
    async fallbackSubmission(data) {
        try {
            // Store failed submissions for later retry
            const failedSubmissions = JSON.parse(localStorage.getItem('failedLeadSubmissions') || '[]');
            failedSubmissions.push({
                data: data,
                timestamp: new Date().toISOString(),
                retryCount: 0
            });
            localStorage.setItem('failedLeadSubmissions', JSON.stringify(failedSubmissions));
            
            console.warn('Lead stored for retry. Total failed:', failedSubmissions.length);
            
            // TODO: Implement background retry logic
            // this.retryFailedSubmissions();
            
        } catch (storageError) {
            console.error('Failed to store lead for retry:', storageError);
        }
    }

    /**
     * Retry failed submissions (stub for implementation)
     */
    async retryFailedSubmissions() {
        // TODO: Implement background retry of failed submissions
        // This could run on page load or at intervals
        console.log('Retry failed submissions logic would run here');
    }
}

// CRM Integration Examples - Replace the sendWithRetry method with these implementations:

/**
 * Example: HubSpot CRM Integration
 * 
 * async submitToHubSpot(leadData) {
 *   const hubspotEndpoint = 'https://api.hubapi.com/crm/v3/objects/contacts';
 *   const hubspotData = {
 *     properties: {
 *       email: leadData.email,
 *       firstname: leadData.firstName,
 *       lastname: leadData.lastName,
 *       company: leadData.company,
 *       phone: leadData.phone,
 *       country: leadData.country,
 *       message: leadData.message,
 *       lead_source: 'Website Form'
 *     }
 *   };
 * 
 *   const response = await fetch(hubspotEndpoint, {
 *     method: 'POST',
 *     headers: {
 *       'Content-Type': 'application/json',
 *       'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`
 *     },
 *     body: JSON.stringify(hubspotData)
 *   });
 * 
 *   return await response.json();
 * }
 */

/**
 * Example: Salesforce Integration
 * 
 * async submitToSalesforce(leadData) {
 *   // First, get access token (OAuth 2.0)
 *   const tokenResponse = await fetch('https://login.salesforce.com/services/oauth2/token', {
 *     method: 'POST',
 *     body: new URLSearchParams({
 *       grant_type: 'password',
 *       client_id: SALESFORCE_CLIENT_ID,
 *       client_secret: SALESFORCE_CLIENT_SECRET,
 *       username: SALESFORCE_USERNAME,
 *       password: SALESFORCE_PASSWORD + SALESFORCE_SECURITY_TOKEN
 *     })
 *   });
 * 
 *   const { access_token, instance_url } = await tokenResponse.json();
 * 
 *   // Then create lead
 *   const salesforceData = {
 *     FirstName: leadData.firstName,
 *     LastName: leadData.lastName,
 *     Email: leadData.email,
 *     Company: leadData.company,
 *     Phone: leadData.phone,
 *     Country: leadData.country,
 *     Description: leadData.message,
 *     LeadSource: 'Website'
 *   };
 * 
 *   const response = await fetch(`${instance_url}/services/data/v58.0/sobjects/Lead`, {
 *     method: 'POST',
 *     headers: {
 *       'Content-Type': 'application/json',
 *       'Authorization': `Bearer ${access_token}`
 *     },
 *     body: JSON.stringify(salesforceData)
 *   });
 * 
 *   return await response.json();
 * }
 */

/**
 * Server-Side Security Notes:
 * 
 * 1. Authentication:
 *    - Use JWT tokens or API keys for server-to-server communication
 *    - Implement rate limiting per IP/client
 *    - Validate and sanitize all input data
 * 
 * 2. Data Protection:
 *    - Encrypt sensitive data in transit (HTTPS) and at rest
 *    - Implement GDPR compliance for EU users
 *    - Regular security audits and penetration testing
 * 
 * 3. Monitoring:
 *    - Log all submission attempts (success/failure)
 *    - Set up alerts for unusual activity
 *    - Monitor endpoint health and performance
 */

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LeadRouter;
} else {
    // Browser global
    window.LeadRouter = LeadRouter;
}

// Usage Example:
/*
// In your contact form submission handler:
const router = new LeadRouter();

async function handleFormSubmit(formData) {
    const countryCode = formData.country; // e.g., 'US', 'GB', 'DE'
    
    try {
        const result = await router.submitLead(formData, countryCode);
        
        if (result.success) {
            showSuccessMessage('Thank you! We\'ll be in touch soon.');
            // Track conversion in analytics
            gtag('event', 'lead_submitted', {
                'country': countryCode,
                'lead_id': result.data.leadId
            });
        } else {
            showErrorMessage(result.message);
        }
    } catch (error) {
        console.error('Lead submission failed:', error);
        showErrorMessage('Unable to submit form. Please try again or contact us directly.');
    }
}
*/

// Auto-retry failed submissions on page load
document.addEventListener('DOMContentLoaded', function() {
    const router = new LeadRouter();
    // router.retryFailedSubmissions(); // Uncomment to enable auto-retry
});

console.log('Lead Router loaded. Ready to route form submissions based on geographic rules.');
// assets/js/search.js

/**
 * Simple Client-Side Search Implementation
 * Provides fuzzy search for insights and case studies
 */

class SearchOverlay {
    constructor() {
        this.isOpen = false;
        this.searchData = [];
        this.searchIndex = [];
        this.currentFocus = -1;
        
        this.initializeSearch();
        this.bindEvents();
    }

    /**
     * Initialize search data and create overlay
     */
    async initializeSearch() {
        try {
            // Load search data from JSON file
            await this.loadSearchData();
            this.createOverlay();
            console.log('Search overlay initialized with', this.searchData.length, 'items');
        } catch (error) {
            console.error('Failed to initialize search:', error);
        }
    }

    /**
     * Load search data from JSON file
     */
    async loadSearchData() {
        // In a real implementation, this would fetch from a JSON file
        // For demo purposes, we'll use a static dataset
        this.searchData = [
            {
                id: 1,
                title: "Exploring React 18: New Features and Performance Improvements",
                slug: "react-18-features",
                excerpt: "Discover the latest enhancements in React 18 including concurrent features, automatic batching, and new APIs.",
                tags: ["react", "frontend", "web-development", "javascript"],
                type: "blog",
                date: "2024-03-15"
            },
            {
                id: 2,
                title: "How AI is Transforming Enterprise Operations in 2024",
                slug: "ai-enterprise-transformation",
                excerpt: "Explore the practical applications of artificial intelligence in modern enterprises and operational efficiency.",
                tags: ["ai", "machine-learning", "automation", "enterprise"],
                type: "blog",
                date: "2024-03-12"
            },
            {
                id: 3,
                title: "MediCare Plus Digital Transformation",
                slug: "medicare-plus-case-study",
                excerpt: "Revolutionizing patient care through a comprehensive telemedicine platform with AI-powered diagnostics.",
                tags: ["healthcare", "telemedicine", "ai", "digital-transformation"],
                type: "case-study",
                date: "2024-03-10"
            },
            {
                id: 4,
                title: "Best Practices for Cloud Migration: A Comprehensive Guide",
                slug: "cloud-migration-best-practices",
                excerpt: "Learn the essential strategies and considerations for successful cloud migration.",
                tags: ["cloud", "aws", "devops", "infrastructure"],
                type: "blog",
                date: "2024-03-08"
            },
            {
                id: 5,
                title: "Global Bank Mobile App Modernization",
                slug: "global-bank-mobile-app",
                excerpt: "Building a next-generation mobile banking experience with enhanced security and personalized features.",
                tags: ["finance", "mobile", "security", "banking"],
                type: "case-study",
                date: "2024-03-05"
            },
            {
                id: 6,
                title: "Optimizing Node.js Applications for Maximum Performance",
                slug: "nodejs-performance-optimization",
                excerpt: "Advanced techniques and best practices for scaling and optimizing Node.js applications.",
                tags: ["nodejs", "backend", "performance", "javascript"],
                type: "blog",
                date: "2024-03-01"
            }
        ];

        // Build search index
        this.buildSearchIndex();
    }

    /**
     * Build search index from data
     */
    buildSearchIndex() {
        this.searchIndex = this.searchData.map(item => ({
            id: item.id,
            searchableText: this.getSearchableText(item)
        }));
    }

    /**
     * Create searchable text from item data
     */
    getSearchableText(item) {
        return [
            item.title,
            item.excerpt,
            ...item.tags
        ].join(' ').toLowerCase();
    }

    /**
     * Create search overlay DOM elements
     */
    createOverlay() {
        // Create overlay container
        this.overlay = document.createElement('div');
        this.overlay.className = 'search-overlay';
        this.overlay.setAttribute('aria-hidden', 'true');
        this.overlay.innerHTML = `
            <div class="search-overlay-backdrop"></div>
            <div class="search-overlay-content" role="dialog" aria-modal="true" aria-labelledby="search-overlay-title">
                <div class="search-header">
                    <div class="search-input-container">
                        <i class="fas fa-search search-icon" aria-hidden="true"></i>
                        <input 
                            type="text" 
                            class="search-input" 
                            id="searchInput"
                            placeholder="Search insights and case studies..." 
                            aria-label="Search insights and case studies"
                            autocomplete="off"
                        >
                        <button class="search-clear-btn" type="button" aria-label="Clear search">
                            <i class="fas fa-times" aria-hidden="true"></i>
                        </button>
                    </div>
                    <button class="search-close-btn" type="button" aria-label="Close search">
                        <i class="fas fa-times" aria-hidden="true"></i>
                        <span class="visually-hidden">Close</span>
                    </button>
                </div>
                <div class="search-results-container">
                    <div class="search-results-header">
                        <h2 id="search-overlay-title" class="visually-hidden">Search Results</h2>
                        <div class="search-results-count" aria-live="polite"></div>
                    </div>
                    <div class="search-results-list" role="listbox" aria-label="Search results"></div>
                    <div class="search-no-results" style="display: none;">
                        <div class="no-results-content">
                            <i class="fas fa-search fa-2x mb-3 text-muted" aria-hidden="true"></i>
                            <h3>No results found</h3>
                            <p class="text-muted">Try different keywords or browse our categories</p>
                        </div>
                    </div>
                </div>
                <div class="search-footer">
                    <div class="search-shortcuts">
                        <kbd class="search-shortcut-key">↑↓</kbd>
                        <span class="search-shortcut-text">Navigate</span>
                        <kbd class="search-shortcut-key">Enter</kbd>
                        <span class="search-shortcut-text">Open</span>
                        <kbd class="search-shortcut-key">Esc</kbd>
                        <span class="search-shortcut-text">Close</span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.overlay);

        // Cache DOM elements
        this.searchInput = this.overlay.querySelector('#searchInput');
        this.searchClearBtn = this.overlay.querySelector('.search-clear-btn');
        this.searchCloseBtn = this.overlay.querySelector('.search-close-btn');
        this.resultsContainer = this.overlay.querySelector('.search-results-list');
        this.noResults = this.overlay.querySelector('.search-no-results');
        this.resultsCount = this.overlay.querySelector('.search-results-count');
        this.overlayBackdrop = this.overlay.querySelector('.search-overlay-backdrop');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Keyboard shortcut: / to open search
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && !this.isOpen && !this.isInputFocused()) {
                e.preventDefault();
                this.open();
            }
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                e.preventDefault();
                this.close();
            }
        });

        // Search input events
        this.searchInput.addEventListener('input', (e) => {
            this.performSearch(e.target.value);
        });

        this.searchInput.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });

        // Clear button
        this.searchClearBtn.addEventListener('click', () => {
            this.clearSearch();
        });

        // Close buttons
        this.searchCloseBtn.addEventListener('click', () => this.close());
        this.overlayBackdrop.addEventListener('click', () => this.close());

        // Prevent overlay content click from closing
        this.overlay.querySelector('.search-overlay-content').addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    /**
     * Check if any input is focused
     */
    isInputFocused() {
        const activeElement = document.activeElement;
        return activeElement.tagName === 'INPUT' || 
               activeElement.tagName === 'TEXTAREA' || 
               activeElement.isContentEditable;
    }

    /**
     * Open search overlay
     */
    open() {
        this.isOpen = true;
        this.overlay.setAttribute('aria-hidden', 'false');
        this.overlay.classList.add('active');
        
        // Focus search input
        setTimeout(() => {
            this.searchInput.focus();
        }, 100);

        // Add body class to prevent scrolling
        document.body.classList.add('search-open');

        // Trap focus within overlay
        this.trapFocus();

        console.log('Search overlay opened');
    }

    /**
     * Close search overlay
     */
    close() {
        this.isOpen = false;
        this.overlay.setAttribute('aria-hidden', 'true');
        this.overlay.classList.remove('active');
        
        // Clear search
        this.clearSearch();
        
        // Remove body class
        document.body.classList.remove('search-open');

        console.log('Search overlay closed');
    }

    /**
     * Clear search input and results
     */
    clearSearch() {
        this.searchInput.value = '';
        this.performSearch('');
        this.searchInput.focus();
    }

    /**
     * Trap focus within search overlay
     */
    trapFocus() {
        const focusableElements = this.overlay.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        this.overlay.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });
    }

    /**
     * Perform search with query
     */
    performSearch(query) {
        const trimmedQuery = query.trim().toLowerCase();
        
        // Show/hide clear button
        this.searchClearBtn.style.display = trimmedQuery ? 'block' : 'none';

        if (!trimmedQuery) {
            this.showEmptyState();
            return;
        }

        const results = this.search(trimmedQuery);
        this.displayResults(results, trimmedQuery);
    }

    /**
     * Simple fuzzy search implementation
     */
    search(query) {
        if (!query) return [];

        const queryTerms = query.split(/\s+/).filter(term => term.length > 0);
        
        return this.searchData.filter(item => {
            const searchableText = this.getSearchableText(item);
            
            // Check if all query terms are found in searchable text
            return queryTerms.every(term => searchableText.includes(term));
        });
    }

    /**
     * Display search results
     */
    displayResults(results, query) {
        this.resultsCount.textContent = `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`;
        
        if (results.length === 0) {
            this.showNoResults();
            return;
        }

        this.noResults.style.display = 'none';
        this.resultsContainer.style.display = 'block';
        this.resultsContainer.innerHTML = '';

        results.forEach((result, index) => {
            const resultElement = this.createResultElement(result, index);
            this.resultsContainer.appendChild(resultElement);
        });

        // Reset focus index
        this.currentFocus = -1;
    }

    /**
     * Create individual result element
     */
    createResultElement(result, index) {
        const element = document.createElement('div');
        element.className = 'search-result-item';
        element.setAttribute('role', 'option');
        element.setAttribute('aria-selected', 'false');
        element.setAttribute('data-index', index);
        element.setAttribute('data-slug', result.slug);
        
        const typeBadge = result.type === 'case-study' ? 
            '<span class="search-result-badge badge bg-accent">Case Study</span>' : 
            '<span class="search-result-badge badge bg-primary">Article</span>';

        element.innerHTML = `
            <div class="search-result-content">
                ${typeBadge}
                <h3 class="search-result-title">${this.escapeHtml(result.title)}</h3>
                <p class="search-result-excerpt">${this.escapeHtml(result.excerpt)}</p>
                <div class="search-result-meta">
                    <span class="search-result-date">${this.formatDate(result.date)}</span>
                    <div class="search-result-tags">
                        ${result.tags.map(tag => 
                            `<span class="search-result-tag">#${this.escapeHtml(tag)}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
            <div class="search-result-arrow">
                <i class="fas fa-chevron-right" aria-hidden="true"></i>
            </div>
        `;

        // Click event
        element.addEventListener('click', () => {
            this.navigateToResult(result);
        });

        // Mouse events for hover state
        element.addEventListener('mouseenter', () => {
            this.setCurrentFocus(index);
        });

        return element;
    }

    /**
     * Handle keyboard navigation in results
     */
    handleKeyboardNavigation(e) {
        const results = this.resultsContainer.querySelectorAll('.search-result-item');
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.currentFocus = Math.min(this.currentFocus + 1, results.length - 1);
                this.setCurrentFocus(this.currentFocus);
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                this.currentFocus = Math.max(this.currentFocus - 1, -1);
                this.setCurrentFocus(this.currentFocus);
                break;
                
            case 'Enter':
                e.preventDefault();
                if (this.currentFocus >= 0 && results[this.currentFocus]) {
                    this.navigateToFocusedResult();
                } else if (results.length > 0) {
                    // Navigate to first result if none focused
                    this.navigateToResult(this.searchData[results[0].dataset.index]);
                }
                break;
        }
    }

    /**
     * Set currently focused result
     */
    setCurrentFocus(index) {
        const results = this.resultsContainer.querySelectorAll('.search-result-item');
        
        // Remove focus from all results
        results.forEach(result => {
            result.classList.remove('focused');
            result.setAttribute('aria-selected', 'false');
        });
        
        // Set focus to new index
        if (index >= 0 && results[index]) {
            results[index].classList.add('focused');
            results[index].setAttribute('aria-selected', 'true');
            results[index].scrollIntoView({ block: 'nearest' });
        }
        
        this.currentFocus = index;
    }

    /**
     * Navigate to focused result
     */
    navigateToFocusedResult() {
        const results = this.resultsContainer.querySelectorAll('.search-result-item');
        if (this.currentFocus >= 0 && results[this.currentFocus]) {
            const resultIndex = parseInt(results[this.currentFocus].dataset.index);
            this.navigateToResult(this.searchData[resultIndex]);
        }
    }

    /**
     * Navigate to result page
     */
    navigateToResult(result) {
        console.log('Navigating to:', result.slug);
        
        // Close overlay first
        this.close();
        
        // Navigate to result page
        const url = result.type === 'case-study' ? 
            `case-study-detail.html?slug=${result.slug}` : 
            `blog-post.html?slug=${result.slug}`;
            
        window.location.href = url;
    }

    /**
     * Show empty state (no search query)
     */
    showEmptyState() {
        this.resultsContainer.style.display = 'none';
        this.noResults.style.display = 'none';
        this.resultsCount.textContent = 'Type to search insights and case studies';
    }

    /**
     * Show no results state
     */
    showNoResults() {
        this.resultsContainer.style.display = 'none';
        this.noResults.style.display = 'block';
    }

    /**
     * Utility: Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Utility: Format date
     */
    formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if search should be initialized (exclude if JS is disabled)
    if (typeof SearchOverlay !== 'undefined') {
        window.searchOverlay = new SearchOverlay();
        
        // Add search trigger button to page (optional)
        addSearchTriggerButton();
    }
});

/**
 * Add search trigger button to navigation (optional enhancement)
 */
function addSearchTriggerButton() {
    const existingSearchBtn = document.querySelector('[data-search-trigger]');
    if (existingSearchBtn) {
        existingSearchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.searchOverlay) {
                window.searchOverlay.open();
            }
        });
    }
}

// Fallback for no-JS: Ensure search form exists and works without JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const noJSSearchForm = document.getElementById('no-js-search-form');
    if (noJSSearchForm) {
        // This form will work with server-side search when JS is disabled
        console.log('No-JS search form detected');
    }
});

console.log('Search module loaded. Press / to search.');
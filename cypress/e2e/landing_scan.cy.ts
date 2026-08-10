describe('Landing Page Scan Flow', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should display the landing page correctly', () => {
        cy.contains('Is your content working for you?').should('be.visible');
        cy.get('input[placeholder="https://your-website.com"]').should('be.visible');
        cy.contains('Scan My Site').should('be.visible');
    });

    it('should validate invalid URL', () => {
        cy.get('input[placeholder="https://your-website.com"]').type('invalid-url');
        cy.contains('Scan My Site').click();
        cy.contains('Please enter a valid URL').should('be.visible');
    });

    it('should start scanning with valid URL and show terminal logs', () => {
        const targetUrl = 'https://example.com';

        cy.get('input[placeholder="https://your-website.com"]').type(targetUrl);
        cy.contains('Scan My Site').click();

        // Check if input is replaced by terminal or terminal appears
        cy.contains('seo-v2-scanner — bash').should('be.visible');

        // Check for specific logs appearing in sequence
        cy.contains(`Initializing scan for target: ${targetUrl}`).should('be.visible');

        // Wait for animation steps
        cy.contains('Resolving DNS...', { timeout: 10000 }).should('be.visible');
        cy.contains('Fetching raw HTML content...', { timeout: 10000 }).should('be.visible');
        cy.contains('Calculating Intent Match Score (IMS)...', { timeout: 10000 }).should('be.visible');

        // Final state
        cy.contains('Analysis complete', { timeout: 15000 }).should('be.visible');
    });

    it('should redirect to results page and show score', () => {
        const targetUrl = 'https://example.com';

        cy.get('input[placeholder="https://your-website.com"]').type(targetUrl);
        cy.contains('Scan My Site').click();

        // Wait for scan to complete and redirect
        cy.url({ timeout: 20000 }).should('include', '/scan/results');
        cy.url().should('include', 'score=');

        // Verify Results Page elements
        cy.contains('Intent Match Score').should('be.visible');
        cy.get('[data-testid="ims-gauge"]').should('be.visible');
        cy.contains('Friction Points').should('be.visible');
        cy.contains('Fix My Site').should('be.visible');
    });
});

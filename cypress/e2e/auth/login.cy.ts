describe("Login Page", () => {
    const appUrl = Cypress.env("APP_URL") as string;

    beforeEach(() => {
        cy.visit(`${appUrl}/auth/login`);
    });

    it("should display login form", () => {
        cy.get("form").should("exist");
        cy.get('[data-testid="email-input"]').should("exist");
        cy.get('input[type="password"]').should("not.exist");
        cy.get('[data-testid="submit-button"]').should("exist");
    });

    it("should show validation errors for empty fields", () => {
        cy.get('[data-testid="submit-button"]').click();
        cy.get('[data-testid="email-error"]').should("exist");
    });

    it("should show loading state while submitting", () => {
        cy.get('[data-testid="email-input"]').type("test@example.com");
        cy.get('[data-testid="submit-button"]').click();
        cy.get('[data-testid="loading-spinner"]').should("exist");
        cy.get('[data-testid="loading-text"]').should("exist");
    });

    it("should handle successful magic link request", () => {
        cy.get('[data-testid="email-input"]').type("test@example.com");
        cy.get('[data-testid="submit-button"]').click();

        // Expect success message
        cy.get('[data-testid="success-message"]').should("exist");
    });
});

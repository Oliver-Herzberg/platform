// / <reference types="Cypress" />

import ProductPageObject from '../../../../support/pages/module/sw-product.page-object';

/**
 * @deprecated tag:v6.5.0 - will be removed, use `sw-promotion-v2` instead
 * @feature-deprecated (flag:FEATURE_NEXT_13810)
 */
describe('Promotion: Test promotion with codes', () => {
    // eslint-disable-next-line no-undef
    before(() => {
        cy.onlyOnFeature('FEATURE_NEXT_13810');
        cy.skipOnFeature('v6.5.0.0');
    });

    beforeEach(() => {
        cy.loginViaApi()
            .then(() => {
                return cy.createDefaultFixture('promotion');
            })
            .then(() => {
                return cy.createProductFixture();
            })
            .then(() => {
                return cy.createCustomerFixture();
            })
            .then(() => {
                cy.openInitialPage(`${Cypress.env('admin')}#/sw/promotion/index`);
                cy.get('.sw-skeleton').should('not.exist');
                cy.get('.sw-loader').should('not.exist');
            });
    });

    it('@marketing: use general promotion codes', () => {
        const page = new ProductPageObject();

        // Request we want to wait for later
        cy.intercept({
            url: `${Cypress.env('apiPath')}/promotion`,
            method: 'POST'
        }).as('saveData');

        cy.intercept({
            url: `${Cypress.env('apiPath')}/_action/sync`,
            method: 'POST'
        }).as('saveDiscount');

        // Active code in promotion
        cy.contains(`${page.elements.dataGridRow}--0 a`, 'Thunder Tuesday').click();
        cy.get('#sw-field--promotion-name').should('be.visible');
        cy.get('input[name="sw-field--promotion-active"]').click();
        cy.get('.sw-promotion-sales-channel-select').typeMultiSelectAndCheck('Storefront');
        cy.get('.sw-promotion-sales-channel-select .sw-select-selection-list__input')
            .type('{esc}');
        cy.get('input[name="sw-field--promotion-useCodes"]').click();
        cy.get('#sw-field--promotion-code').should('be.enabled');
        cy.get('#sw-field--promotion-code').type('funicular');

        // Add discount
        cy.get('a[title="Discounts"]').click();
        cy.get(page.elements.loader).should('not.exist');
        cy.get('.sw-button--ghost').should('be.visible');
        cy.contains('.sw-button--ghost', 'Add discount').click();
        cy.get(page.elements.loader).should('not.exist');
        cy.wait('@filteredResultCall')
            .its('response.statusCode').should('equal', 200);

        cy.get('.sw-promotion-discount-component').should('be.visible');
        cy.get('.sw-promotion-discount-component__discount-value').should('be.visible');
        cy.get('.sw-promotion-discount-component__discount-value input')
            .clear()
            .type('54');

        // Save final promotion
        cy.get('.sw-promotion-detail__save-action').click();
        cy.wait('@saveDiscount').its('response.statusCode').should('equal', 200);

        // Verify Promotion in Storefront
        cy.visit('/');

        cy.window().then((win) => {
            /** @deprecated tag:v6.5.0 - Use `CheckoutPageObject.elements.lineItem` instead */
            const lineItemSelector = win.features['v6.5.0.0'] ? '.line-item' : '.cart-item';

            cy.get('.product-box').should('be.visible');
            cy.get('.btn-buy').click();
            cy.get('.offcanvas').should('be.visible');
            cy.get('#addPromotionOffcanvasCartInput').type('funicular');
            cy.get('#addPromotionOffcanvasCart').click();
            cy.get('.alert-success .icon-checkmark-circle').should('be.visible');
            cy.contains(`${lineItemSelector}-promotion ${lineItemSelector}-label`, 'Thunder Tuesday');
        });
    });

    it('@base @marketing: use invalid code', () => {
        const page = new ProductPageObject();

        // Request we want to wait for later
        cy.intercept({
            url: `${Cypress.env('apiPath')}/promotion`,
            method: 'POST'
        }).as('saveData');

        cy.intercept({
            url: `${Cypress.env('apiPath')}/_action/sync`,
            method: 'POST'
        }).as('saveDiscount');

        // Active code in promotion
        cy.contains(`${page.elements.dataGridRow}--0 a`, 'Thunder Tuesday').click();
        cy.get('#sw-field--promotion-name').should('be.visible');
        cy.get('input[name="sw-field--promotion-active"]').click();
        cy.get('.sw-promotion-sales-channel-select').typeMultiSelectAndCheck('Storefront');
        cy.get('.sw-promotion-sales-channel-select .sw-select-selection-list__input')
            .type('{esc}');
        cy.get('input[name="sw-field--promotion-useCodes"]').click();
        cy.get('#sw-field--promotion-code').should('be.enabled');
        cy.get('#sw-field--promotion-code').type('funicular');

        // Add discount
        cy.get('a[title="Discounts"]').click();
        cy.get(page.elements.loader).should('not.exist');
        cy.get('.sw-button--ghost').should('be.visible');
        cy.contains('.sw-button--ghost', 'Add discount').click();
        cy.get(page.elements.loader).should('not.exist');
        cy.wait('@filteredResultCall').its('response.statusCode').should('equal', 200);

        cy.get('.sw-promotion-discount-component').should('be.visible');
        cy.get('.sw-promotion-discount-component__discount-value').should('be.visible');
        cy.get('.sw-promotion-discount-component__discount-value input')
            .clear()
            .type('54');


        // Save final promotion
        cy.get('.sw-promotion-detail__save-action').click();
        cy.wait('@saveDiscount').its('response.statusCode').should('equal', 200);

        // Verify Promotion in Storefront
        cy.visit('/');

        cy.window().then((win) => {
            /** @deprecated tag:v6.5.0 - Use `CheckoutPageObject.elements.lineItem` instead */
            const lineItemSelector = win.features['v6.5.0.0'] ? '.line-item' : '.cart-item';

            cy.get('.product-box').should('be.visible');
            cy.get('.btn-buy').click();
            cy.get('.offcanvas').should('be.visible');
            cy.get('#addPromotionOffcanvasCartInput').type('not_funicular');
            cy.get('#addPromotionOffcanvasCart').click();
            cy.contains('Promotion with code "not_funicular" could not be found.');
            cy.get(`${lineItemSelector}-promotion`).should('not.exist');
        });
    });
});

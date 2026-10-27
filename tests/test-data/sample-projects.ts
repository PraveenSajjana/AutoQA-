/**
 * Reusable test data definitions and boundaries for AutoQA Studio Playwright automation
 */
export const TEST_DATA = {
  validTargets: {
    novashop: {
      url: 'https://demo.novashop-store.io',
      name: 'NovaShop E-Commerce',
      environment: 'staging',
    },
    flipkart: {
      url: 'https://www.flipkart.com',
      name: 'Flipkart Online Shopping',
      mobile: '8722451115',
      otp: '729401',
      item: 'iPhone 17 Pro Max',
      price: '₹1,59,900',
    },
    localhost: {
      url: 'http://localhost:3000',
      name: 'AutoQA Local Dev Sandbox',
      environment: 'local',
    },
  },
  invalidTargets: {
    empty: '',
    whitespace: '     ',
    noDomain: 'invalidurlwithoutdot',
    corruptScheme: 'ftp://not-supported-scheme.com',
  },
  boundaries: {
    maxCharsProjectName: 'A'.repeat(120),
    negativeTimeoutMs: '-500',
    extremeTimeoutMs: '600000',
    xssPayload: "<script>alert('xss')</script>",
  },
  mockCredentials: {
    validUser: 'qa.lead@enterprise.io',
    validPass: 'SecureP@ssword2026!',
  },
};

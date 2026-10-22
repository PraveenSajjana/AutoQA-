import { TestCase, ApplicationAnalysis } from '../types/qa';

export interface SampleAppDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  url: string;
  mockHtml: string;
  defaultDefectMode?: 'none' | 'product_bug' | 'flaky_selector' | 'network_timeout';
  analysis: ApplicationAnalysis;
  seededTestCases: TestCase[];
}

export const SAMPLE_APPS: SampleAppDefinition[] = [
  {
    id: 'novashop-ecom',
    name: 'NovaShop E-Commerce & Checkout',
    category: 'E-Commerce / Retail',
    description: 'Product catalog, shopping cart, promo discount coupon code, and multi-step checkout form.',
    url: 'https://demo.novashop-store.io',
    mockHtml: `
      <div id="app" data-testid="store-root">
        <header class="header">
          <h1 data-testid="store-logo">NovaShop</h1>
          <div data-testid="cart-badge">Items: 2</div>
        </header>
        <main>
          <div data-testid="product-grid">
            <button data-testid="add-to-cart-item-1">Add Ergonomic Keyboard ($89.00)</button>
          </div>
          <div data-testid="cart-drawer">
            <input data-testid="coupon-code-input" placeholder="Enter coupon" />
            <button data-testid="apply-coupon-btn">Apply Promo</button>
            <div data-testid="cart-total">$149.00</div>
            <button data-testid="checkout-btn">Proceed to Checkout</button>
          </div>
          <div data-testid="checkout-form" style="display:none">
            <input name="fullname" data-testid="checkout-name" />
            <input name="email" data-testid="checkout-email" />
            <button data-testid="place-order-btn">Pay and Confirm</button>
            <div data-testid="order-confirmation" style="display:none">Order #84291 Placed!</div>
          </div>
        </main>
      </div>
    `,
    analysis: {
      projectId: 'novashop-ecom',
      appName: 'NovaShop Modern E-Commerce',
      version: 'v2.4.1',
      summary: 'Single Page Web Store with product inventory, real-time discount calculation, and checkout modal.',
      techStackDetected: ['React 18', 'Vite', 'Stripe Elements', 'Tailwind CSS'],
      routes: [
        {
          path: '/',
          name: 'Storefront Catalog',
          description: 'Product listing, category filters, and quick-add to cart.',
          criticality: 'critical',
          interactiveElements: [
            { type: 'button', selector: 'add-to-cart-item-1', label: 'Add to Cart', purpose: 'Increments cart count' },
            { type: 'button', selector: 'cart-badge', label: 'Cart Badge', purpose: 'Opens slideout cart' }
          ],
          potentialRisks: ['Double click race condition on quick-add', 'Inventory stock count sync']
        },
        {
          path: '/cart',
          name: 'Cart & Promo Application',
          description: 'Cart summary, coupon validation, tax and shipping calculation.',
          criticality: 'critical',
          interactiveElements: [
            { type: 'input', selector: 'coupon-code-input', label: 'Promo Code Field', purpose: 'Applies discount' },
            { type: 'button', selector: 'apply-coupon-btn', label: 'Apply Promo Button', purpose: 'Triggers discount API' },
            { type: 'button', selector: 'checkout-btn', label: 'Proceed to Checkout', purpose: 'Navigates to payment' }
          ],
          potentialRisks: ['Negative total price on 100% off coupon', 'Expired discount handling', 'Rounding errors on currency']
        },
        {
          path: '/checkout',
          name: 'Checkout & Order Placement',
          description: 'Billing address, payment tokenization, and order creation.',
          criticality: 'critical',
          interactiveElements: [
            { type: 'input', selector: 'checkout-name', label: 'Customer Full Name', purpose: 'Billing identity' },
            { type: 'input', selector: 'checkout-email', label: 'Customer Email', purpose: 'Receipt delivery' },
            { type: 'button', selector: 'place-order-btn', label: 'Pay and Confirm', purpose: 'Authorizes charge' }
          ],
          potentialRisks: ['Form validation bypass', 'Timeout on payment gateway', 'Duplicate order generation']
        }
      ],
      boundaryScenarios: [
        'Entering coupon SAVE50 when cart total is $0.00',
        'Special characters (e.g. <script>, apostrophes) in billing name',
        'Rapid double-clicking on Place Order button'
      ],
      recommendedTestSuites: [
        { name: 'Core Purchase Journey', description: 'Catalog to cart to successful order confirmation', estimatedCases: 3, priority: 'critical-path' },
        { name: 'Promo Discount Edge Cases', description: 'Invalid codes, stackable discounts, boundary conditions', estimatedCases: 3, priority: 'edge-cases' },
        { name: 'Checkout Form Validations', description: 'Missing required inputs, invalid email format', estimatedCases: 2, priority: 'negative' }
      ],
      generatedAt: new Date().toISOString()
    },
    seededTestCases: [
      {
        test_id: 'ECOM-001',
        requirement_id: 'REQ-CHECKOUT-01',
        title: 'Complete Happy-Path Order Placement',
        priority: 'critical',
        category: 'critical-path',
        preconditions: ['Product is in stock', 'User session active'],
        steps: [
          { action: 'navigate', target: '/', description: 'Open storefront catalog' },
          { action: 'click', target: 'add-to-cart-item-1', description: 'Add Ergonomic Keyboard to cart' },
          { action: 'assert_visible', target: 'cart-badge', description: 'Verify cart badge increments' },
          { action: 'click', target: 'checkout-btn', description: 'Proceed to checkout modal' },
          { action: 'fill', target: 'checkout-name', value: 'Alex Morgan', description: 'Enter customer name' },
          { action: 'fill', target: 'checkout-email', value: 'alex.morgan@example.com', description: 'Enter receipt email' },
          { action: 'click', target: 'place-order-btn', description: 'Submit order' },
          { action: 'assert_visible', target: 'order-confirmation', description: 'Verify confirmation toast shown' }
        ],
        expected_result: 'Order is successfully placed and order confirmation banner appears',
        status: 'approved',
        reviewNotes: 'Reviewed by Agent 3: Verified selector resilience; clean assertion coverage.'
      },
      {
        test_id: 'ECOM-002',
        requirement_id: 'REQ-PROMO-02',
        title: 'Apply 20% Discount Promo Code "SAVE20"',
        priority: 'high',
        category: 'functional',
        preconditions: ['Cart has items totaling $149.00'],
        steps: [
          { action: 'navigate', target: '/cart', description: 'Open shopping cart drawer' },
          { action: 'assert_visible', target: 'cart-drawer', description: 'Verify cart drawer open' },
          { action: 'fill', target: 'coupon-code-input', value: 'SAVE20', description: 'Enter coupon code' },
          { action: 'click', target: 'apply-coupon-btn', description: 'Click Apply Promo' },
          { action: 'assert_text', target: 'cart-total', value: '$119.20', description: 'Verify 20% discount reflected' }
        ],
        expected_result: 'Cart total updates from $149.00 to $119.20',
        status: 'approved',
        reviewNotes: 'High priority financial calculation check.'
      },
      {
        test_id: 'ECOM-003',
        requirement_id: 'REQ-CHECKOUT-03',
        title: 'Checkout Form Mandatory Field Validation (Negative Case)',
        priority: 'medium',
        category: 'negative',
        preconditions: ['Cart has items'],
        steps: [
          { action: 'navigate', target: '/checkout', description: 'Go to checkout' },
          { action: 'fill', target: 'checkout-name', value: '', description: 'Leave name field blank' },
          { action: 'fill', target: 'checkout-email', value: 'invalid-email-format', description: 'Enter invalid email format' },
          { action: 'click', target: 'place-order-btn', description: 'Attempt to place order' },
          { action: 'assert_visible', target: 'checkout-form', description: 'Form should remain visible without navigating' }
        ],
        expected_result: 'Form validation blocks submission and prevents order placement',
        status: 'approved',
        reviewNotes: 'Validates client-side input validation barriers.'
      }
    ]
  },
  {
    id: 'cloudauth-saas',
    name: 'CloudAuth B2B SaaS Console',
    category: 'Security / SaaS',
    description: 'Enterprise sign-in, MFA OTP validation, tenant workspace selector, and API key token generation.',
    url: 'https://console.cloudauth-saas.com',
    mockHtml: `
      <div id="saas-app" data-testid="saas-root">
        <div data-testid="login-card">
          <input name="email" data-testid="login-email" />
          <input name="password" type="password" data-testid="login-password" />
          <button data-testid="sign-in-btn">Continue</button>
        </div>
        <div data-testid="mfa-modal" style="display:none">
          <input data-testid="mfa-otp-input" placeholder="6-digit OTP" />
          <button data-testid="verify-otp-btn">Verify MFA</button>
        </div>
        <div data-testid="dashboard-view" style="display:none">
          <h2 data-testid="welcome-header">Workspace Dashboard</h2>
          <button data-testid="generate-api-key-btn">Create Key</button>
          <div data-testid="key-token-display">sk_live_983719284</div>
        </div>
      </div>
    `,
    analysis: {
      projectId: 'cloudauth-saas',
      appName: 'CloudAuth IAM Cloud Platform',
      version: 'v4.1.0',
      summary: 'Enterprise identity security platform featuring OAuth2, MFA TOTP, and tokenized API key rotation.',
      techStackDetected: ['Next.js 14', 'TypeScript', 'Tailwind CSS', 'PostgreSQL'],
      routes: [
        {
          path: '/login',
          name: 'Identity Authentication',
          description: 'Credentials authentication with rate limiting and password policy.',
          criticality: 'critical',
          interactiveElements: [
            { type: 'input', selector: 'login-email', label: 'Work Email', purpose: 'User identifier' },
            { type: 'input', selector: 'login-password', label: 'Password', purpose: 'Credentials' },
            { type: 'button', selector: 'sign-in-btn', label: 'Continue Button', purpose: 'Triggers auth' }
          ],
          potentialRisks: ['Credential stuffing vulnerability', 'Lockout after 5 failed tries']
        },
        {
          path: '/mfa',
          name: '2-Factor TOTP Verification',
          description: 'Time-based OTP verification screen.',
          criticality: 'critical',
          interactiveElements: [
            { type: 'input', selector: 'mfa-otp-input', label: 'OTP Input', purpose: '6-digit verification code' },
            { type: 'button', selector: 'verify-otp-btn', label: 'Verify Button', purpose: 'Authorizes session token' }
          ],
          potentialRisks: ['Expired OTP handling', 'Clock drift between server and client']
        },
        {
          path: '/dashboard/api-keys',
          name: 'API Key Management',
          description: 'Secret token generation and revocation.',
          criticality: 'high',
          interactiveElements: [
            { type: 'button', selector: 'generate-api-key-btn', label: 'Create Key', purpose: 'Generates API secret' },
            { type: 'form', selector: 'key-token-display', label: 'Key Display', purpose: 'Shows masked key' }
          ],
          potentialRisks: ['Key leakage in DOM', 'Unrevoked active tokens']
        }
      ],
      boundaryScenarios: [
        'Entering 5 digits into 6-digit OTP field',
        'Expired JWT refresh rotation during active tab session'
      ],
      recommendedTestSuites: [
        { name: 'MFA Authentication Flow', description: 'End to end login with secondary OTP code', estimatedCases: 2, priority: 'critical-path' },
        { name: 'API Key Generation & Copy', description: 'Verify new key generation and secret display', estimatedCases: 2, priority: 'functional' }
      ],
      generatedAt: new Date().toISOString()
    },
    seededTestCases: [
      {
        test_id: 'AUTH-001',
        requirement_id: 'REQ-AUTH-01',
        title: 'Sign in with Credentials and Verify 2FA OTP',
        priority: 'critical',
        category: 'critical-path',
        preconditions: ['User account configured with MFA'],
        steps: [
          { action: 'navigate', target: '/login', description: 'Navigate to login portal' },
          { action: 'fill', target: 'login-email', value: 'admin@acmecorp.internal', description: 'Enter corporate email' },
          { action: 'fill', target: 'login-password', value: 'P@ssw0rdSecure2026!', description: 'Enter password' },
          { action: 'click', target: 'sign-in-btn', description: 'Submit credentials' },
          { action: 'assert_visible', target: 'mfa-modal', description: 'Ensure MFA challenge prompt is displayed' },
          { action: 'fill', target: 'mfa-otp-input', value: '482910', description: 'Enter valid 6-digit authenticator code' },
          { action: 'click', target: 'verify-otp-btn', description: 'Confirm OTP' },
          { action: 'assert_visible', target: 'dashboard-view', description: 'Confirm redirect to dashboard' }
        ],
        expected_result: 'User successfully satisfies MFA challenge and accesses dashboard workspace',
        status: 'approved',
        reviewNotes: 'Critical security authentication flow.'
      },
      {
        test_id: 'AUTH-002',
        requirement_id: 'REQ-KEY-03',
        title: 'Generate Production API Secret Token',
        priority: 'high',
        category: 'functional',
        preconditions: ['User has workspace Admin permission'],
        steps: [
          { action: 'navigate', target: '/dashboard/api-keys', description: 'Open API settings tab' },
          { action: 'assert_visible', target: 'generate-api-key-btn', description: 'Check button exists' },
          { action: 'click', target: 'generate-api-key-btn', description: 'Click generate API key' },
          { action: 'assert_visible', target: 'key-token-display', description: 'Verify secret key token appears' }
        ],
        expected_result: 'A newly minted masked secret token string (sk_live_...) is generated and visible',
        status: 'approved',
        reviewNotes: 'RBAC capability verification.'
      }
    ]
  },
  {
    id: 'apexbank-fintech',
    name: 'ApexBank Wire Transfer',
    category: 'Fintech / Banking',
    description: 'Account balance inquiry, domestic ACH and international wire transfers with balance sanity checks.',
    url: 'https://portal.apexbank-online.com',
    mockHtml: `
      <div id="bank-app" data-testid="bank-root">
        <div data-testid="account-card">
          <span data-testid="account-balance">$12,450.00</span>
        </div>
        <form data-testid="transfer-form">
          <input data-testid="recipient-iban" placeholder="Recipient IBAN / Routing" />
          <input data-testid="transfer-amount" placeholder="Amount ($)" />
          <select data-testid="transfer-speed">
            <option value="standard">Standard (1-2 days)</option>
            <option value="instant">Instant Wire ($5 fee)</option>
          </select>
          <button data-testid="submit-transfer-btn">Initiate Transfer</button>
        </form>
        <div data-testid="transfer-receipt" style="display:none">
          Transfer Ref: #TRX-99482 Processed
        </div>
      </div>
    `,
    analysis: {
      projectId: 'apexbank-fintech',
      appName: 'ApexBank Digital Banking Portal',
      version: 'v3.8.2',
      summary: 'High-compliance financial transactional app with strict debit validation and ledger auditing.',
      techStackDetected: ['Angular 17', 'Java Spring Boot', 'PostgreSQL', 'mTLS'],
      routes: [
        {
          path: '/transfers',
          name: 'Wire Transfer Portal',
          description: 'Funds disbursement with ledger debit and recipient validation.',
          criticality: 'critical',
          interactiveElements: [
            { type: 'input', selector: 'recipient-iban', label: 'IBAN Input', purpose: 'Routing identifier' },
            { type: 'input', selector: 'transfer-amount', label: 'Amount Field', purpose: 'Disbursement amount' },
            { type: 'select', selector: 'transfer-speed', label: 'Transfer Speed', purpose: 'Fee calculation' },
            { type: 'button', selector: 'submit-transfer-btn', label: 'Initiate Transfer', purpose: 'Commits ledger transaction' }
          ],
          potentialRisks: ['Overdraft beyond authorized limit', 'Floating point rounding discrepancies', 'Replay attacks']
        }
      ],
      boundaryScenarios: [
        'Attempting to transfer $15,000.00 when available balance is $12,450.00',
        'Entering negative or zero amount (-$50 or $0.00)'
      ],
      recommendedTestSuites: [
        { name: 'Wire Transfer Core Flow', description: 'Normal transfer within balance bounds', estimatedCases: 2, priority: 'critical-path' },
        { name: 'Overdraft Boundary Test', description: 'Prevent transfer exceeding balance', estimatedCases: 2, priority: 'boundary' }
      ],
      generatedAt: new Date().toISOString()
    },
    seededTestCases: [
      {
        test_id: 'BANK-001',
        requirement_id: 'REQ-TRANSFER-01',
        title: 'Execute Valid Wire Transfer Within Available Balance',
        priority: 'critical',
        category: 'critical-path',
        preconditions: ['Account balance >= $500.00'],
        steps: [
          { action: 'navigate', target: '/transfers', description: 'Open transfer screen' },
          { action: 'assert_visible', target: 'account-balance', description: 'Check balance is displayed' },
          { action: 'fill', target: 'recipient-iban', value: 'US89APEX99281928374', description: 'Enter routing' },
          { action: 'fill', target: 'transfer-amount', value: '450.00', description: 'Enter transfer amount' },
          { action: 'click', target: 'submit-transfer-btn', description: 'Submit transfer' },
          { action: 'assert_visible', target: 'transfer-receipt', description: 'Verify transfer receipt confirmation' }
        ],
        expected_result: 'Transfer executes successfully with transaction reference receipt generated',
        status: 'approved',
        reviewNotes: 'Standard ledger transaction verification.'
      },
      {
        test_id: 'BANK-002',
        requirement_id: 'REQ-TRANSFER-02',
        title: 'Prevent Transfer Exceeding Available Balance (Overdraft Boundary)',
        priority: 'critical',
        category: 'boundary',
        preconditions: ['Account balance is $12,450.00'],
        steps: [
          { action: 'navigate', target: '/transfers', description: 'Open transfer screen' },
          { action: 'fill', target: 'recipient-iban', value: 'US89APEX99281928374', description: 'Enter recipient' },
          { action: 'fill', target: 'transfer-amount', value: '999999.00', description: 'Enter excessive amount' },
          { action: 'click', target: 'submit-transfer-btn', description: 'Attempt transfer' },
          { action: 'assert_visible', target: 'transfer-form', description: 'Form should block submission and remain on page' }
        ],
        expected_result: 'System blocks transfer with validation message and does not disburse funds',
        status: 'approved',
        reviewNotes: 'Boundary test for funds safety.'
      }
    ]
  },
  {
    id: 'observe-ai-platform',
    name: 'Observe.ai Contact Center Intelligence',
    category: 'Contact Center AI / QA Intelligence',
    description: 'Conversation intelligence, call transcript analysis, Auto-QA scoring evaluation rubrics, PCI compliance masking, and real-time agent assist.',
    url: 'https://app.observe.ai/analytics',
    mockHtml: `
      <div id="observe-app" data-testid="observe-root">
        <header data-testid="observe-header">
          <span data-testid="observe-logo">Observe.ai Intelligence</span>
          <div data-testid="interaction-filter-bar">
            <input data-testid="search-interaction-input" placeholder="Search customer calls, keywords, agents..." />
            <select data-testid="sentiment-filter-select">
              <option value="all">All Sentiments</option>
              <option value="frustrated">Frustrated</option>
              <option value="negative">Negative</option>
              <option value="positive">Positive</option>
            </select>
            <button data-testid="apply-interaction-filters-btn">Filter Calls</button>
          </div>
        </header>
        <main>
          <div data-testid="call-table-row-1">
            <span data-testid="call-agent-name">Agent Sarah Chen</span>
            <span data-testid="call-sentiment-tag">Frustrated (-0.82)</span>
            <span data-testid="call-duration">12m 40s</span>
            <button data-testid="open-call-transcript-btn">Inspect Call</button>
          </div>
          <div data-testid="transcript-panel">
            <div data-testid="speaker-audio-scrubber">00:04:12 / 00:12:40</div>
            <div data-testid="transcript-dialogue-turn-1">Customer: I was billed twice for my subscription.</div>
            <div data-testid="transcript-dialogue-turn-2">Agent: I apologize for the discrepancy. Let me verify your account.</div>
            <div data-testid="pci-redacted-token">[PCI-REDACTED-CARD: ****-****-****-9102]</div>
            <button data-testid="launch-auto-qa-rubric-btn">Evaluate Auto-QA</button>
          </div>
          <div data-testid="auto-qa-score-card">
            <span data-testid="auto-qa-overall-score">94 / 100</span>
            <span data-testid="compliance-pass-badge">PCI &amp; TCPA Compliant</span>
            <button data-testid="publish-qa-evaluation-btn">Publish QA Score</button>
            <div data-testid="qa-evaluation-confirmed" style="display:none">Evaluation Published &amp; Synced</div>
          </div>
          <div data-testid="agent-assist-prompt-card">
            <span data-testid="suggested-kb-action">Offer 20% Retention Credit</span>
            <button data-testid="insert-assist-snippet-btn">Use Script</button>
          </div>
        </main>
      </div>
    `,
    analysis: {
      projectId: 'observe-ai-platform',
      appName: 'Observe.ai Contact Center Platform',
      version: 'v4.12.0',
      summary: 'Enterprise conversation intelligence with automated agent QA scoring, speech-to-text diarization, compliance verification, and real-time guidance.',
      techStackDetected: ['React 18', 'TypeScript', 'GraphQL', 'WebRTC Audio Scrubber', 'Tailwind CSS'],
      routes: [
        {
          path: '/analytics/interactions',
          name: 'Interaction Intelligence & Call Explorer',
          description: 'Search and filter customer audio interactions, sentiment trends, silence rates, and agent performance.',
          criticality: 'critical',
          interactiveElements: [
            { type: 'input', selector: 'search-interaction-input', label: 'Call Search Field', purpose: 'Filters interactions by keyword' },
            { type: 'select', selector: 'sentiment-filter-select', label: 'Sentiment Filter Dropdown', purpose: 'Selects customer mood' },
            { type: 'button', selector: 'apply-interaction-filters-btn', label: 'Filter Calls Button', purpose: 'Refreshes call dataset' },
            { type: 'button', selector: 'open-call-transcript-btn', label: 'Inspect Call Button', purpose: 'Opens audio transcript view' }
          ],
          potentialRisks: ['Audio sync drift during scrubber seek', 'Laggy diarization on multi-speaker overlap']
        },
        {
          path: '/qa/evaluations',
          name: 'Auto-QA Rubric Scoring',
          description: 'Automated evaluation forms scoring greetings, empathy, compliance checks, and problem resolution.',
          criticality: 'critical',
          interactiveElements: [
            { type: 'button', selector: 'launch-auto-qa-rubric-btn', label: 'Launch Auto-QA Rubric', purpose: 'Calculates automated score' },
            { type: 'button', selector: 'publish-qa-evaluation-btn', label: 'Publish QA Evaluation', purpose: 'Commits score to agent scorecard' }
          ],
          potentialRisks: ['Scoring discrepancies on dispute appeals', 'Over-penalizing for false-positive silence periods']
        },
        {
          path: '/security/compliance',
          name: 'PCI & Redaction Verification',
          description: 'Detects and redacts credit card numbers, SSNs, and PII in real-time transcripts.',
          criticality: 'critical',
          interactiveElements: [
            { type: 'modal', selector: 'pci-redacted-token', label: 'PCI Redacted Token', purpose: 'Masks sensitive card data' },
            { type: 'modal', selector: 'compliance-pass-badge', label: 'Compliance Status', purpose: 'Indicates audit compliance' }
          ],
          potentialRisks: ['PII leak if regex/NER fails', 'Unmasked PAN digits reaching analytics DB']
        },
        {
          path: '/agent-assist',
          name: 'Real-Time Agent Assist',
          description: 'Live transcription prompts with next-best-action guidance and objection handling.',
          criticality: 'high',
          interactiveElements: [
            { type: 'button', selector: 'insert-assist-snippet-btn', label: 'Use Suggested Script', purpose: 'Copies resolution snippet to agent CRM' }
          ],
          potentialRisks: ['Latency spike in LLM prompt generation', 'Outdated knowledge base recommendations']
        }
      ],
      boundaryScenarios: [
        'Call recording with 100% background static or zero audio packets',
        'Customer reciting 16-digit credit card number across multiple fragmented phrases',
        'Simultaneous QA supervisor score calibration dispute submission'
      ],
      recommendedTestSuites: [
        { name: 'Interaction Search & Scrubber', description: 'Filter calls and verify transcript diarization', estimatedCases: 2, priority: 'critical-path' },
        { name: 'Auto-QA Evaluation Rubric', description: 'Score calculation and agent scorecard sync', estimatedCases: 2, priority: 'critical-path' },
        { name: 'PCI Redaction Safety Guard', description: 'Masking sensitive financial card tokens in UI', estimatedCases: 1, priority: 'boundary' },
        { name: 'Real-Time Assist Copilot', description: 'Next-best-action prompt delivery', estimatedCases: 1, priority: 'functional' }
      ],
      generatedAt: new Date().toISOString()
    },
    seededTestCases: [
      {
        test_id: 'OBS-001',
        requirement_id: 'REQ-OBS-CALL-01',
        title: 'Filter Frustrated Customer Calls & Open Audio Transcript',
        priority: 'critical',
        category: 'critical-path',
        preconditions: ['User authenticated as QA Analyst with Analytics permission'],
        steps: [
          { action: 'navigate', target: '/analytics/interactions', description: 'Navigate to Interaction Intelligence' },
          { action: 'fill', target: 'search-interaction-input', value: 'billing discrepancy', description: 'Search keywords' },
          { action: 'select', target: 'sentiment-filter-select', value: 'frustrated', description: 'Filter by Frustrated sentiment' },
          { action: 'click', target: 'apply-interaction-filters-btn', description: 'Execute query' },
          { action: 'assert_visible', target: 'call-table-row-1', description: 'Verify call row exists' },
          { action: 'click', target: 'open-call-transcript-btn', description: 'Open call details' },
          { action: 'assert_visible', target: 'transcript-panel', description: 'Verify transcript and speaker timeline render' }
        ],
        expected_result: 'Interaction table filters to frustrated calls and opens transcript scrubber view',
        status: 'approved',
        reviewNotes: 'Core workflow for Observe.ai call exploration.'
      },
      {
        test_id: 'OBS-002',
        requirement_id: 'REQ-OBS-QA-02',
        title: 'Compute Auto-QA Form Score & Publish Agent Evaluation',
        priority: 'critical',
        category: 'critical-path',
        preconditions: ['Transcript is loaded and audio diarization is completed'],
        steps: [
          { action: 'click', target: 'launch-auto-qa-rubric-btn', description: 'Trigger automated rubric scoring' },
          { action: 'assert_visible', target: 'auto-qa-score-card', description: 'Check score card generated' },
          { action: 'assert_text', target: 'auto-qa-overall-score', value: '94 / 100', description: 'Verify score calculation' },
          { action: 'click', target: 'publish-qa-evaluation-btn', description: 'Publish scorecard to agent portal' },
          { action: 'assert_visible', target: 'qa-evaluation-confirmed', description: 'Confirm successful publishing' }
        ],
        expected_result: 'Auto-QA calculates 94/100 score and successfully synchronizes evaluation to agent records',
        status: 'approved',
        reviewNotes: 'Key capability of Observe.ai Auto-QA engine.'
      },
      {
        test_id: 'OBS-003',
        requirement_id: 'REQ-OBS-PCI-03',
        title: 'Verify Automatic PCI-DSS Card Number Redaction in Transcript',
        priority: 'critical',
        category: 'boundary',
        preconditions: ['Customer uttered 16-digit payment card number during call'],
        steps: [
          { action: 'navigate', target: '/security/compliance', description: 'Inspect compliance audit view' },
          { action: 'assert_visible', target: 'pci-redacted-token', description: 'Confirm card digits are masked with token' },
          { action: 'assert_visible', target: 'compliance-pass-badge', description: 'Verify compliance audit status is passed' }
        ],
        expected_result: 'No raw PAN credit card digits are exposed in the DOM; masked token is displayed',
        status: 'approved',
        reviewNotes: 'Strict PCI-DSS compliance barrier.'
      },
      {
        test_id: 'OBS-004',
        requirement_id: 'REQ-OBS-ASSIST-04',
        title: 'Deliver Real-Time Agent Assist Next-Best-Action Recommendation',
        priority: 'high',
        category: 'functional',
        preconditions: ['Live call simulation active with billing inquiry detected'],
        steps: [
          { action: 'navigate', target: '/agent-assist', description: 'Open Real-Time Agent Assist view' },
          { action: 'assert_visible', target: 'agent-assist-prompt-card', description: 'Verify recommendation prompt appears' },
          { action: 'click', target: 'insert-assist-snippet-btn', description: 'Apply suggested script' },
          { action: 'assert_visible', target: 'observe-header', description: 'Ensure UI remains stable after insertion' }
        ],
        expected_result: 'Real-time assistant suggests retention discount and copies script to agent clipboard',
        status: 'approved',
        reviewNotes: 'Agent Copilot real-time responsiveness.'
      }
    ]
  }
];

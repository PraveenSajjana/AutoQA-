import React, { useState } from 'react';
import { SAMPLE_APPS } from '../services/sampleApps';
import { 
  Globe, 
  RotateCw, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  ShoppingCart, 
  Lock, 
  CreditCard, 
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface LiveBrowserSandboxProps {
  sampleAppId?: string;
  targetUrl?: string;
  isExecuting?: boolean;
  highlightSelector?: string;
}

export const LiveBrowserSandbox: React.FC<LiveBrowserSandboxProps> = ({
  sampleAppId = 'novashop-ecom',
  targetUrl = 'https://demo.novashop-store.io',
  isExecuting = false,
  highlightSelector,
}) => {
  // Interactive state for NovaShop
  const [cartItems, setCartItems] = useState<number>(1);
  const [couponCode, setCouponCode] = useState<string>('');
  const [discountApplied, setDiscountApplied] = useState<boolean>(false);
  const [checkoutStep, setCheckoutStep] = useState<'catalog' | 'cart' | 'checkout' | 'confirmed'>('catalog');
  const [customerName, setCustomerName] = useState<string>('Alex Morgan');
  const [customerEmail, setCustomerEmail] = useState<string>('alex.morgan@example.com');

  // Interactive state for CloudAuth
  const [authEmail, setAuthEmail] = useState<string>('admin@acmecorp.internal');
  const [authPassword, setAuthPassword] = useState<string>('••••••••••••');
  const [authStep, setAuthStep] = useState<'login' | 'mfa' | 'dashboard'>('login');
  const [mfaCode, setMfaCode] = useState<string>('482910');
  const [apiKeyVisible, setApiKeyVisible] = useState<boolean>(false);

  // Interactive state for ApexBank
  const [balance, setBalance] = useState<number>(12450.0);
  const [recipientIban, setRecipientIban] = useState<string>('US89APEX99281928374');
  const [transferAmount, setTransferAmount] = useState<string>('450.00');
  const [transferStatus, setTransferStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Interactive state for Observe.ai
  const [observeSearch, setObserveSearch] = useState('billing discrepancy');
  const [observeSentiment, setObserveSentiment] = useState('frustrated');
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [qaScorePublished, setQaScorePublished] = useState(false);
  const [assistSnippetUsed, setAssistSnippetUsed] = useState(false);

  const getHighlightClass = (selector: string) => {
    if (highlightSelector && (highlightSelector.includes(selector) || selector.includes(highlightSelector))) {
      return 'ring-4 ring-indigo-500 shadow-lg shadow-indigo-500/50 scale-[1.02] transition-all duration-300';
    }
    return 'transition-all duration-200';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Browser Chrome Header */}
      <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
          </div>
          <div className="flex items-center gap-1 ml-3 text-slate-500">
            <button className="p-1 hover:text-slate-300 rounded"><ArrowLeft className="w-3.5 h-3.5" /></button>
            <button className="p-1 hover:text-slate-300 rounded"><ArrowRight className="w-3.5 h-3.5" /></button>
            <button className="p-1 hover:text-slate-300 rounded"><RotateCw className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        {/* Address Bar */}
        <div className="flex-1 max-w-lg mx-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1 flex items-center gap-2 text-xs font-mono text-slate-300">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span className="truncate">{targetUrl}</span>
            {isExecuting && (
              <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 animate-pulse">
                Automation Active
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>1280 &times; 800</span>
        </div>
      </div>

      {/* Browser Viewport Surface */}
      <div className="bg-slate-950 p-6 min-h-[380px] text-slate-100 flex flex-col justify-between">
        {/* Sample App 1: NovaShop E-Commerce */}
        {sampleAppId === 'novashop-ecom' && (
          <div data-testid="store-root" className="space-y-6 max-w-xl mx-auto w-full">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h1 data-testid="store-logo" className="text-xl font-extrabold text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-indigo-400" /> NovaShop
              </h1>
              <div
                data-testid="cart-badge"
                className={`px-3 py-1 rounded-full bg-indigo-600/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 flex items-center gap-1.5 ${getHighlightClass('cart-badge')}`}
              >
                <span>Items:</span>
                <span className="text-white">{cartItems}</span>
              </div>
            </div>

            {checkoutStep === 'catalog' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-white">Ergonomic Wireless Mechanical Keyboard</h3>
                    <p className="text-xs text-slate-400 mt-0.5">$89.00 &bull; In Stock (24 units)</p>
                  </div>
                  <button
                    data-testid="add-to-cart-item-1"
                    onClick={() => setCartItems((prev) => prev + 1)}
                    className={`px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md ${getHighlightClass('add-to-cart-item-1')}`}
                  >
                    Add to Cart
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3" data-testid="cart-drawer">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">Promo Discount Coupon</span>
                    <span className="text-[11px] text-slate-500 font-mono">Use "SAVE20"</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      data-testid="coupon-code-input"
                      type="text"
                      placeholder="Enter coupon"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className={`flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white uppercase font-mono ${getHighlightClass('coupon-code-input')}`}
                    />
                    <button
                      data-testid="apply-coupon-btn"
                      onClick={() => setDiscountApplied(couponCode.toUpperCase() === 'SAVE20')}
                      className={`px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 ${getHighlightClass('apply-coupon-btn')}`}
                    >
                      Apply Promo
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-sm">
                    <span className="text-slate-400">Total Calculation:</span>
                    <span data-testid="cart-total" className={`font-mono font-bold text-base ${discountApplied ? 'text-emerald-400' : 'text-white'} ${getHighlightClass('cart-total')}`}>
                      {discountApplied ? '$119.20' : '$149.00'}
                    </span>
                  </div>

                  <button
                    data-testid="checkout-btn"
                    onClick={() => setCheckoutStep('checkout')}
                    className={`w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-lg ${getHighlightClass('checkout-btn')}`}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            )}

            {checkoutStep === 'checkout' && (
              <div data-testid="checkout-form" className="space-y-4 bg-slate-900 p-5 rounded-xl border border-slate-800">
                <h3 className="text-sm font-bold text-white">Customer Billing &amp; Delivery</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Full Name</label>
                    <input
                      name="fullname"
                      data-testid="checkout-name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className={`w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white ${getHighlightClass('checkout-name')}`}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Receipt Email</label>
                    <input
                      name="email"
                      data-testid="checkout-email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className={`w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white ${getHighlightClass('checkout-email')}`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setCheckoutStep('catalog')}
                    className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-medium rounded-lg"
                  >
                    Back
                  </button>
                  <button
                    data-testid="place-order-btn"
                    onClick={() => setCheckoutStep('confirmed')}
                    className={`flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-lg ${getHighlightClass('place-order-btn')}`}
                  >
                    Pay and Confirm Order
                  </button>
                </div>
              </div>
            )}

            {checkoutStep === 'confirmed' && (
              <div data-testid="order-confirmation" className={`p-6 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-2 ${getHighlightClass('order-confirmation')}`}>
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Order #84291 Placed Successfully!</h3>
                <p className="text-xs text-slate-300">Confirmation receipt emailed to {customerEmail}</p>
                <button
                  onClick={() => setCheckoutStep('catalog')}
                  className="mt-2 text-xs text-indigo-400 underline"
                >
                  Return to Storefront
                </button>
              </div>
            )}
          </div>
        )}

        {/* Sample App 2: CloudAuth SaaS */}
        {sampleAppId === 'cloudauth-saas' && (
          <div data-testid="saas-root" className="space-y-6 max-w-md mx-auto w-full">
            {authStep === 'login' && (
              <div data-testid="login-card" className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <Lock className="w-4 h-4" /> CloudAuth IAM Portal
                </div>
                <div className="space-y-2">
                  <input
                    name="email"
                    data-testid="login-email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className={`w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white ${getHighlightClass('login-email')}`}
                  />
                  <input
                    type="password"
                    data-testid="login-password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className={`w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white ${getHighlightClass('login-password')}`}
                  />
                </div>
                <button
                  data-testid="sign-in-btn"
                  onClick={() => setAuthStep('mfa')}
                  className={`w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg ${getHighlightClass('sign-in-btn')}`}
                >
                  Continue with SSO
                </button>
              </div>
            )}

            {authStep === 'mfa' && (
              <div data-testid="mfa-modal" className="p-6 rounded-xl bg-slate-900 border border-indigo-500/40 space-y-4">
                <h3 className="text-sm font-bold text-white">Enter 2FA Verification Code</h3>
                <input
                  data-testid="mfa-otp-input"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  className={`w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-center font-mono text-base text-white tracking-widest ${getHighlightClass('mfa-otp-input')}`}
                />
                <button
                  data-testid="verify-otp-btn"
                  onClick={() => setAuthStep('dashboard')}
                  className={`w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg ${getHighlightClass('verify-otp-btn')}`}
                >
                  Verify MFA
                </button>
              </div>
            )}

            {authStep === 'dashboard' && (
              <div data-testid="dashboard-view" className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <h2 data-testid="welcome-header" className="text-base font-bold text-white">Acme Corp Dashboard</h2>
                <button
                  data-testid="generate-api-key-btn"
                  onClick={() => setApiKeyVisible(true)}
                  className={`px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg ${getHighlightClass('generate-api-key-btn')}`}
                >
                  Create Key
                </button>
                {apiKeyVisible && (
                  <div data-testid="key-token-display" className={`p-3 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 ${getHighlightClass('key-token-display')}`}>
                    sk_live_983719284918274
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Sample App 3: ApexBank Fintech */}
        {sampleAppId === 'apexbank-fintech' && (
          <div data-testid="bank-root" className="space-y-5 max-w-lg mx-auto w-full">
            <div data-testid="account-card" className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Available Balance</span>
                <span data-testid="account-balance" className={`text-xl font-mono font-bold text-emerald-400 ${getHighlightClass('account-balance')}`}>
                  ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <CreditCard className="w-6 h-6 text-indigo-400" />
            </div>

            <form data-testid="transfer-form" className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Recipient IBAN / Routing</label>
                <input
                  data-testid="recipient-iban"
                  value={recipientIban}
                  onChange={(e) => setRecipientIban(e.target.value)}
                  className={`w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono ${getHighlightClass('recipient-iban')}`}
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Amount ($ USD)</label>
                <input
                  data-testid="transfer-amount"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className={`w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono ${getHighlightClass('transfer-amount')}`}
                />
              </div>

              <button
                type="button"
                data-testid="submit-transfer-btn"
                onClick={() => {
                  const amt = parseFloat(transferAmount);
                  if (amt > balance) {
                    setTransferStatus('error');
                  } else {
                    setBalance((prev) => prev - amt);
                    setTransferStatus('success');
                  }
                }}
                className={`w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-lg ${getHighlightClass('submit-transfer-btn')}`}
              >
                Initiate Transfer
              </button>

              {transferStatus === 'success' && (
                <div data-testid="transfer-receipt" className={`p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-mono ${getHighlightClass('transfer-receipt')}`}>
                  Transfer Ref: #TRX-99482 Processed
                </div>
              )}

              {transferStatus === 'error' && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-mono">
                  Error: Transfer amount exceeds available balance.
                </div>
              )}
            </form>
          </div>
        )}

        {/* Sample App 4: Observe.ai Contact Center Intelligence */}
        {sampleAppId === 'observe-ai-platform' && (
          <div data-testid="observe-root" className="space-y-4 max-w-2xl mx-auto w-full">
            {/* Header / Filter Bar */}
            <div data-testid="observe-header" className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                <span data-testid="observe-logo" className="font-extrabold text-xs font-mono tracking-tight text-white">
                  Observe.<span className="text-cyan-400">ai</span> Intelligence
                </span>
              </div>
              <div data-testid="interaction-filter-bar" className="flex items-center gap-2 text-xs">
                <input
                  data-testid="search-interaction-input"
                  value={observeSearch}
                  onChange={(e) => setObserveSearch(e.target.value)}
                  placeholder="Search calls, keywords..."
                  className={`bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white ${getHighlightClass('search-interaction-input')}`}
                />
                <select
                  data-testid="sentiment-filter-select"
                  value={observeSentiment}
                  onChange={(e) => setObserveSentiment(e.target.value)}
                  className={`bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 ${getHighlightClass('sentiment-filter-select')}`}
                >
                  <option value="all">All Sentiments</option>
                  <option value="frustrated">Frustrated</option>
                  <option value="negative">Negative</option>
                  <option value="positive">Positive</option>
                </select>
                <button
                  type="button"
                  data-testid="apply-interaction-filters-btn"
                  onClick={() => setTranscriptOpen(false)}
                  className={`px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium ${getHighlightClass('apply-interaction-filters-btn')}`}
                >
                  Filter
                </button>
              </div>
            </div>

            {/* Interaction Row */}
            <div data-testid="call-table-row-1" className={`p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs ${getHighlightClass('call-table-row-1')}`}>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span data-testid="call-agent-name" className="font-bold text-white">Agent Sarah Chen</span>
                  <span data-testid="call-sentiment-tag" className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Frustrated (-0.82)
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Duration: <span data-testid="call-duration" className="text-slate-200">12m 40s</span> &bull; Silence Rate: 4.2% &bull; Call ID: #OBS-98214
                </div>
              </div>
              <button
                type="button"
                data-testid="open-call-transcript-btn"
                onClick={() => setTranscriptOpen(true)}
                className={`px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shrink-0 transition ${getHighlightClass('open-call-transcript-btn')}`}
              >
                Inspect Call
              </button>
            </div>

            {/* Transcript & Auto-QA Scrubber Panel */}
            <div data-testid="transcript-panel" className={`p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs ${getHighlightClass('transcript-panel')}`}>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-semibold text-slate-300">Synchronized Call Audio &amp; Diarization</span>
                <span data-testid="speaker-audio-scrubber" className="font-mono text-cyan-400 text-[11px] bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/30">
                  00:04:12 / 00:12:40
                </span>
              </div>

              <div className="space-y-2 bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono leading-relaxed">
                <div data-testid="transcript-dialogue-turn-1" className="text-slate-300">
                  <span className="text-rose-400 font-bold">[00:01:14] Customer:</span> I was billed twice for my subscription this month.
                </div>
                <div data-testid="transcript-dialogue-turn-2" className="text-slate-300">
                  <span className="text-cyan-400 font-bold">[00:01:22] Agent Sarah:</span> I apologize for the discrepancy. Let me verify your account.
                </div>
                <div data-testid="pci-redacted-token" className={`p-1.5 rounded bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 font-bold flex items-center gap-1.5 ${getHighlightClass('pci-redacted-token')}`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>[PCI-REDACTED-CARD: ****-****-****-9102]</span>
                </div>
              </div>

              {/* Auto-QA & Scorecard Block */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  data-testid="launch-auto-qa-rubric-btn"
                  onClick={() => setQaScorePublished(true)}
                  className={`px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition ${getHighlightClass('launch-auto-qa-rubric-btn')}`}
                >
                  Evaluate Auto-QA
                </button>
                <div data-testid="compliance-pass-badge" className={`px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold ${getHighlightClass('compliance-pass-badge')}`}>
                  PCI &amp; TCPA Compliant
                </div>
              </div>

              {/* Auto-QA Generated Scorecard */}
              <div data-testid="auto-qa-score-card" className={`p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between ${getHighlightClass('auto-qa-score-card')}`}>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">Scorecard:</span>
                  <span data-testid="auto-qa-overall-score" className={`font-mono text-base font-extrabold text-emerald-400 ${getHighlightClass('auto-qa-overall-score')}`}>
                    94 / 100
                  </span>
                </div>
                <button
                  type="button"
                  data-testid="publish-qa-evaluation-btn"
                  onClick={() => setQaScorePublished(true)}
                  className={`px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs ${getHighlightClass('publish-qa-evaluation-btn')}`}
                >
                  Publish QA Score
                </button>
              </div>

              {qaScorePublished && (
                <div data-testid="qa-evaluation-confirmed" className={`p-2.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono text-center ${getHighlightClass('qa-evaluation-confirmed')}`}>
                  Evaluation Published &amp; Synced to Agent Scorecard #OBS-98214
                </div>
              )}

              {/* Real-Time Agent Assist Prompt */}
              <div data-testid="agent-assist-prompt-card" className={`p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between gap-2 ${getHighlightClass('agent-assist-prompt-card')}`}>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span data-testid="suggested-kb-action" className="text-indigo-200 text-xs">
                    Next Best Action: Offer 20% Retention Credit
                  </span>
                </div>
                <button
                  type="button"
                  data-testid="insert-assist-snippet-btn"
                  onClick={() => setAssistSnippetUsed(true)}
                  className={`px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold rounded ${getHighlightClass('insert-assist-snippet-btn')}`}
                >
                  {assistSnippetUsed ? 'Script Applied' : 'Use Script'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>AutoQA Deterministic Sandbox Environment</span>
          <span>DOM Observer: Active</span>
        </div>
      </div>
    </div>
  );
};

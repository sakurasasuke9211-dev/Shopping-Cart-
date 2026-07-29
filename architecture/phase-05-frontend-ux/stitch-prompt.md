# Stitch UI Prompt — Sports Mart

Copy everything below the line into Google Stitch. Attach the Decathlon reference screenshots when prompting.

---

## Prompt

Design a complete multi-screen UI for **Sports Mart**, a personalized sports equipment shopping app for adults aged **45 and above**. The product helps users find suitable gear without decision fatigue by combining a short preference questionnaire with a limited set of clear product recommendations.

Use the attached Decathlon screenshots as visual reference for **tone and theme only**: clean white retail surfaces, deep royal blue as the primary action color, charcoal/black text, light gray borders, generous whitespace, high-quality sports product photography, and professional functional e-commerce layouts. Do **not** copy Decathlon branding, logo, coupon banners, or trademarked product names. Brand everything as **Sports Mart**.

### Brand

- Company name: **Sports Mart**
- Brand must be a hero-level signal on the Opening Page — large, unmistakable, more prominent than any supporting headline
- Tagline tone: calm, trustworthy, practical — not hypey or youthful slang
- Example supporting line: “Simple recommendations for active living after 45.”

### Audience & accessibility (non-negotiable)

Design every screen for users aged 45+:

- Base body text at least **18px**; prices and product names larger and bold
- High-contrast text (near-black on white / white on deep blue)
- Large tap targets: primary buttons at least **48px** tall, preferably full-width on mobile
- Always pair icons with **visible text labels** — never icon-only for Sign In, Cart, Wishlist, Back, Delete, or Favorites
- Clear visible labels above every input
- Generous spacing; uncluttered layouts; limited content per screen
- Minimal motion only (subtle fades). No autoplay carousels, no glow effects, no confetti, no emoji UI
- Stock status must use words (“In stock” / “Out of stock”), not color alone
- Error and success messages in plain language

### Visual system

- **Theme:** Clean, professional sports retail. Bright, calm, trustworthy.
- **Background:** Mostly white with soft light-gray panels; Opening Page may use a full-bleed lifestyle sports photo with a readable dark overlay for brand text
- **Primary color:** Deep royal blue for logo wordmark, active tabs, primary CTAs, and key links
- **Text:** Charcoal / near-black for headings and body
- **Secondary:** Light gray borders, muted gray for secondary labels
- **Success accent:** Forest green for delivery status and confirmation only (sparingly)
- **Sale/alert accent:** Use red only for true urgency; keep rare
- **Typography:** Expressive but highly legible sans-serif for UI; optional sturdy serif or distinctive display face only for the Sports Mart wordmark on the Opening Page. Do **not** use Inter, Roboto, Arial, or default system UI stacks as the main brand look
- **Corners:** Slightly rounded rectangles (not pill-shaped / fully rounded) for buttons and inputs
- **Shadows:** None or one soft elevation at most — no multi-layer glam shadows
- **Cards:** Avoid decorative cards. Use card-like containers only where interaction needs a clear boundary (product result, cart line item, form panel). Never put cards in the hero
- Avoid purple gradients, cream/terracotta editorial looks, newspaper layouts, neon glow, and dark-mode-first styling

### Global chrome (most screens after Opening)

Top header inspired by the reference retail sites, adapted for Sports Mart and 45+ readability:

- Left: **Sports Mart** wordmark in deep royal blue
- Center: large search field with clear placeholder text
- Right: utility items with icon **plus** text label under each: Sign In, Support, Wishlist, Cart (show cart count as text, e.g. “Cart (2)”)
- Secondary nav text links: All Sports · Equipment · Clothing · Footwear · Accessories
- Optional small delivery location line with text, not icon-only

Keep header calm and sparse. No coupon ticker, no promo sticker row in the header.

---

## Screens to generate (in this order)

Generate **mobile-first** frames and matching **desktop** frames for each screen. Keep one job per screen. Use realistic sports product photography (walking, yoga, trekking, badminton, cycling) — product and lifestyle shots, not abstract gradients as the main visual.

### 1) Opening Page

One composition, first viewport only:

- Full-bleed hero lifestyle image of an active adult 45+ outdoors or in sport (edge-to-edge, not an inset card)
- Dominant **Sports Mart** brand treatment
- One short supporting sentence
- One CTA group only:
  - Primary: **Continue as Guest**
  - Secondary text actions: **Log in** · **Sign up**
- No stats, no promo chips, no floating badges, no product grid in the first viewport

### 2) Login

Clean centered single-column auth screen inspired by the reference login:

- Top: Back (house icon + “Back” text) and centered Sports Mart wordmark
- Large heading: **Log in**
- Tabs: **Email** / **Phone number** (active tab = bold + thick blue underline)
- Labeled email field: “Enter an email address” + placeholder “Email”
- Full-width primary blue button: **NEXT**
- Secondary outline buttons with logo + text:
  - Continue with Google
  - Continue with Facebook
  - Continue with Apple
- Footer: “No account? Create one!” + blue link **Create your Sports Mart account**
- Lots of whitespace; no sidebar clutter

### 3) Sign Up

Same visual system as Login:

- Heading: **Create account**
- Fields with large labels: Full name, Email, Password, Confirm password
- Primary CTA: **Create account**
- Secondary text link: **Continue as Guest**
- Link back to Log in

### 4) Questionnaire Overlay (shared chrome)

Design a centered modal overlay (or full-screen sheet on mobile) that appears over a lightly dimmed app background.

Shared overlay rules for every questionnaire step:

- One question per step only
- Large question as the sole headline
- Progress in plain text: “Step X of 7”
- Large **Back** and **Next** buttons always visible
- High-contrast selected states (filled blue or strong blue outline) — not tiny chips
- No multi-column forms inside the overlay

Generate these questionnaire steps as separate frames:

#### 4a) Select Age Group
- Question: “Which age group are you in?”
- Two large options: **45–55 years** · **55+ years**

#### 4b) Select Primary Sport
- Question: “Which sport do you want equipment for?”
- Single-select large list/grid: Walking, Trekking, Hiking, Badminton, Table Tennis, Yoga, Pickleball, Golf, Paddleball, Camping, Cycling

#### 4c) Select Additional Sports
- Question: “Any other sports you’re interested in?”
- Multi-select, optional; same sport list; note “Optional — choose up to 3”

#### 4d) Select Product Type
- Question: “What type of product do you need?”
- Large options: Equipment, Clothing, Footwear, Accessories, Support and recovery, Fitness technology

#### 4e) Select Experience Level
- Question: “What is your experience level?”
- Three large options: Beginner, Intermediate, Experienced

#### 4f) Select Budget
- Question: “What is your budget?”
- Three large preset bands (Low / Medium / High) plus optional min/max fields with clear labels
- Primary CTA on this step can still say **Next**

#### 4g) Submit Preferences (extra preferences)
- Question: “Any extra preferences?”
- Multi-select labeled options (not tiny pills): Lightweight, Beginner-friendly, Easy to use, High cushioning, Wide fit, Non-slip, Portable, Comfort-focused, Weather-resistant
- Final primary CTA: **Show my recommendations**

### 5) Personalized Recommendation Screen

Clean results page adapted from the reference product listing, but simpler for 45+:

- Header with Sports Mart + search + labeled utilities
- Page title: **Recommended for you**
- Short supporting line: “Based on your answers — we’ve limited the list to make choosing easier.”
- Optional text button: **Refine preferences**
- Section: **Top picks** — max 6 product results
- Section: **More options** — max 4
- Section: **Helpful accessories** — max 3
- Short **Why these products?** paragraph at the bottom or side (method explanation, not a wall of filters)

Product result presentation (borderless / light container, not heavy retail card clutter):

- Large product image on light gray background
- Brand in bold
- Product name
- Sport + category as plain text
- Star rating + review count in readable size
- Price large and bold
- One main benefit line
- Availability text: “In stock”
- Personalized explanation text always visible under the product info
- Two large labeled buttons: **View product** · **Add to cart**

Desktop: 2–3 products per row maximum (not dense 4-up).  
Mobile: single column.  
Do **not** include a dense left filter accordion full of tiny checkboxes on this screen — personalization already happened in the questionnaire.

### 6) Product Details

Split layout inspired by the reference PDP, enlarged for readability:

- Left (desktop): large product image, light neutral background, edge-aware but not a floating card collage
- Right:
  - Brand + product name
  - Price (large)
  - Rating + review count
  - Short plain-language description
  - Main benefits as a short readable list (not tiny chips)
  - Size selector as large rectangular options with clear text
  - Color options with text labels, not color-only dots
  - Availability text
  - Personalized recommendation explanation (if arrived from recommendations)
  - Large primary CTA: **Add to cart**
  - Large secondary CTA: **Buy now**
- Below or beside: Delivery & services with labeled icons (Standard delivery, Pay on delivery) — keep short

### 7) Cart Review

Two-column desktop / stacked mobile, calm and spacious:

- Left: cart line items with large image, brand, name, size selector, large quantity stepper (+ / − with number), price, labeled Delete action
- Right summary panel:
  - Order summary heading
  - Item total
  - Grand total in large bold type
  - Full-width primary CTA: **Proceed to checkout**
- Empty state with clear message + button back to recommendations

Avoid reward-login clutter and coupon ticket walls. Keep the job to reviewing the cart.

### 8) Checkout

Single-column form, few fields, large labels:

- Contact: name, email, phone
- Shipping: address line, city, postal code
- Order summary
- Primary CTA: **Place order**
- Clear validation messages under fields

### 9) Payment

Simple, reassuring payment screen:

- Order total prominently displayed
- Mock payment method choice with large labeled options (e.g. Card, UPI, Cash on delivery) — visual only for MVP mock
- Primary CTA: **Pay now**
- Trust-building short note: “Secure mock payment for demo”

### 10) Order Confirmation

Calm success screen:

- Large heading: **Your order is confirmed**
- Order ID in readable text
- Short item list + total
- Primary CTA: **Back to home**
- Secondary CTA: **Continue shopping**
- No confetti, no emoji bursts, no coupon spam

---

## Output requirements for Stitch

1. Generate separate frames for every screen listed above (Opening, Login, Sign Up, Questionnaire steps 4a–4g, Recommendations, Product Details, Cart Review, Checkout, Payment, Order Confirmation).
2. Provide both **mobile** and **desktop** variants.
3. Keep visual language consistent across the whole flow.
4. Use Sports Mart branding everywhere the reference shows a retail brand.
5. Prioritize legibility, large controls, and low cognitive load over decorative density.
6. Deliver screens that a developer can implement directly into a React web app.

---

## Short negative prompt / avoid list

Avoid: Decathlon logo or wordmark, purple gradients, neon glow, glassmorphism, tiny text, dense 4-column product walls for this audience, icon-only navigation, floating promo stickers on heroes, pill-shaped tag clouds, dark-mode default, emoji-heavy UI, cluttered coupon carousels on the opening screen.

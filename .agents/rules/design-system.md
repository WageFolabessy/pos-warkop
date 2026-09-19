# Apple Standard Design System Rule for POS Warkop

All UI components and styles in this repository MUST strictly follow the Apple Standard Design System detailed in `DESIGN_SYSTEM.md`.

## Key Enforcement Rules

1. **Color Restrictions:**
   - **ONLY Accent Color:** Apple Blue `#0071e3` (Hover: `#0077ED`). Exclusively for primary action CTA buttons, focus rings, and active indicators.
   - **Neutral Palette ONLY:** `white`, `gray-50` through `gray-900`, `black`.
   - **Destructive/Error ONLY:** `red-50`, `red-200`, `red-600`, `red-700`.
   - **Strictly FORBIDDEN:** All `stone-*`, `amber-*`, `emerald-*`, `orange-*`, `green-*`, `yellow-*`, `purple-*`, and `blue-*` (except `#0071e3`).
   - *Exceptions:* Physical thermal receipt `#thermal-receipt` in `ReceiptModal.tsx` and the black background of the QRIS SVG pattern.

2. **Typography Restrictions:**
   - Font Family: System font stack (`-apple-system, BlinkMacSystemFont, 'SF Pro', system-ui, sans-serif`).
   - Allowed Weights ONLY: `font-normal` (400), `font-medium` (500), `font-semibold` (600).
   - FORBIDDEN Weights: `font-bold` (700), `font-extrabold` (800), `font-black` (900).

3. **Shapes & Shadows:**
   - Action buttons MUST be pill-shaped (`rounded-full`).
   - Cards and containers MUST be `rounded-xl`.
   - Heavy drop shadows (`shadow-md`, `shadow-lg`, `shadow-2xl`) are FORBIDDEN. Use subtle borders (`border-gray-200`).

4. **Icons & Badges:**
   - Emojis are PERMANENTLY BANNED from structural UI.
   - Use Lucide icons with neutral colors (`text-gray-400`, `text-gray-500`) or white in primary buttons.
   - Status indicators must be plain neutral text or neutral pill badges—never traffic-light colored blocks.

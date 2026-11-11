# Ledger-Core interface system

This interface is a compact workbench for a signed-in user managing ledger accounts and money movement. The account currently in context stays visible in the header. The balance gets the strongest visual emphasis; operation forms remain calm and explicit.

## Foundations

- Color tokens live in `src/index.css` under `:root`. Forest green signals primary actions and account context; warm white and pale green support the surface hierarchy. Red is reserved for errors and destructive actions.
- Body type uses the existing Inter/system stack. Georgia is reserved for product and section headings. Monetary figures use tabular numerals.
- The content area caps at 1216px. Panels use a 12px radius, one subtle border, and minimal shadow. Inner data surfaces use smaller radii.
- Spacing follows a 4px base rhythm, with 24px between related work areas and 32–40px outer page space.

## Interaction patterns

- Shared form controls have a minimum 44px height, visible labels, inline errors, clear disabled states, and immediate keyboard focus outlines.
- Primary, secondary, ghost, and danger actions use the shared `LoadingButton` component. Loading keeps the action label visible.
- Account context, backend health, and user identity sit in the shared header. Technical product background remains available under “About this project.”
- The tab strip remains horizontally scrollable on narrow screens; panels collapse to one column below the desktop breakpoint.
- Animations are limited to short color transitions and existing loading indicators, with reduced-motion support in CSS.

## Page composition

- Sign in and registration: editorial product panel beside the existing authentication form on desktop; stacked on tablet and mobile.
- Account: paired create and select tasks.
- Dashboard: balance surface first, followed by account facts and refresh controls.
- Money movement: deposit and withdrawal side by side on desktop; transfer gets a full-width section beneath.
- Transfer lookup: a single focused search surface.
- Reconciliation: admin controls lead the data table, which scrolls horizontally only inside its own container when needed.

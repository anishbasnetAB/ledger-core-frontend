# Ledger-Core interface system

This interface is a compact workbench for a signed-in user managing ledger accounts and money movement. The account currently in context stays visible in the header. The balance gets the strongest visual emphasis; operation forms remain calm and explicit.

## Foundations

- Color tokens live in `src/index.css` under `:root`. Saturated forest green signals primary actions and account context; lime appears only as a small accent on dark surfaces. Warm white and tinted green support the surface hierarchy. Disabled actions use a distinct green tint with readable text. Red is reserved for errors and destructive actions.
- Body type uses the existing Inter/system stack. Georgia is reserved for product and section headings. Monetary figures use tabular numerals.
- The content area caps at 1216px. Focused single tasks center at 860px; the transfer form caps at 768px. Panels use a 14px radius, one subtle border, and a soft shadow. Inner data surfaces use smaller radii.
- Spacing follows a 4px base rhythm, with 24px between related work areas and 32–40px outer page space.

## Interaction patterns

- Shared form controls have a minimum 44px height, visible labels, inline errors, clear disabled states, and immediate keyboard focus outlines.
- Primary, secondary, ghost, and danger actions use the shared `LoadingButton` component. Loading keeps the action label visible.
- Account context, backend health, and user identity sit in the shared header. Verification time and “About this project” share a compact metadata row.
- The tab strip remains horizontally scrollable on narrow screens; panels collapse to one column below the desktop breakpoint.
- Animations are limited to short color transitions and existing loading indicators, with reduced-motion support in CSS.

## Page composition

- Sign in and registration: editorial product panel beside the existing authentication form on desktop; stacked on tablet and mobile.
- Account: paired create and select tasks.
- Dashboard: balance surface first, followed by account facts. The balance surface contains the sole refresh control.
- Money movement: deposit and withdrawal side by side on desktop; transfer gets a full-width section beneath.
- Transfer lookup: a single focused search surface.
- Reconciliation: admin controls lead the data table, which scrolls horizontally only inside its own container when needed.

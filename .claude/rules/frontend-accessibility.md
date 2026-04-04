---
scope: apps/web/src/components/**
---

# Frontend Accessibility Rules

- Every interactive element must have an accessible name (aria-label, aria-labelledby, or visible label)
- Use semantic HTML: `<button>` not `<div onClick>`, `<nav>` not `<div class="nav">`
- Color contrast: minimum 4.5:1 for normal text, 3:1 for large text
- Touch targets: minimum 44x44px on mobile
- Focus management: visible focus styles on all interactive elements
- Keyboard navigation: all functionality accessible via Tab, Enter, Escape
- Use `prefers-reduced-motion` media query for animations
- Loading states: use skeleton components with `aria-busy="true"`
- Error messages: associate with fields via `aria-describedby`
- All user-facing text must use i18n keys (never hardcode Spanish or English strings)

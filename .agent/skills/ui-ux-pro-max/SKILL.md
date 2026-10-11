---
name: ui-ux-pro-max
description: >-
  Advanced UI/UX Design System and Pro-Max Design Principles for Smart City & Municipal Platforms.
  Enforces accessibility (WCAG 2.1 AA), responsive mobile-first layouts, consistent design tokens,
  micro-interactions, and bilingual (French / Arabic) municipal interfaces.
---

# UI/UX Pro Max Design System — Kalaa Connect

## 1. Visual Identity & Design Tokens

### Color Palette
- **Primary Brand (Municipal Blue):** `#0f2e59` (Deep Navy), `#1e40af` (Royal Blue), `#2563eb` (Interactive Blue)
- **Secondary / Accent (Civic Green):** `#059669` (Emerald 600), `#10b981` (Success Mint)
- **Warning / Pending:** `#d97706` (Amber 600), `#fef3c7` (Amber 50)
- **Danger / Urgent:** `#dc2626` (Red 600), `#fee2e2` (Red 50)
- **Neutral Surface:** `#ffffff` (White), `#f8fafc` (Slate 50), `#f1f5f9` (Slate 100), `#e2e8f0` (Border Slate)
- **Typography:** `#0f172a` (Headings Slate 900), `#334155` (Body Slate 700), `#64748b` (Muted Slate 500)

### Typography Scale
- `font-sans`: Plus Jakarta Sans, Inter, system-ui
- `text-xs`: 0.75rem / 12px (Badges, timestamps, helper text)
- `text-sm`: 0.875rem / 14px (Body text, input labels, table cells)
- `text-base`: 1.0rem / 16px (Card titles, primary buttons)
- `text-lg`: 1.125rem / 18px (Section subheaders, dialog titles)
- `text-xl`: 1.25rem / 20px (Module titles)
- `text-2xl`: 1.5rem / 24px (Page headers, KPIs)

## 2. Core UI Components Specification

### A. Status Badges
| Status | Background | Text | Icon | Meaning |
| :--- | :--- | :--- | :--- | :--- |
| `NOUVEAU` | `bg-amber-50` | `text-amber-700 border-amber-200` | Clock | Reçu, en attente d'affectation |
| `ACCEPTE` | `bg-blue-50` | `text-blue-700 border-blue-200` | CheckCircle | Validé par le superviseur |
| `EN_COURS` | `bg-indigo-50` | `text-indigo-700 border-indigo-200` | Tool | Équipe mobilisée sur le terrain |
| `RESOLU` | `bg-emerald-50` | `text-emerald-700 border-emerald-200` | CheckCircle2 | Réparé avec photo-preuve |
| `CLOTURE` | `bg-slate-100` | `text-slate-700 border-slate-300` | Archive | Validé et archivé par le citoyen |
| `REJETE` | `bg-rose-50` | `text-rose-700 border-rose-200` | XCircle | Rejet motivé (domaine privé) |

### B. Interactive Form Principles
- One-click GPS location detection with manual fallback on Leaflet map.
- Client-side image compression (< 500 KB) with immediate preview.
- Inline validation with accessible error messages and focus outlines.
- Offline draft storage in `localStorage` when network connectivity drops.

### C. Bilingual Arabic / French Support (RTL / LTR)
- Dynamic layout direction mirroring (`dir="rtl"` vs `dir="ltr"`).
- Culturally appropriate terminology for Kalâa Seghira's 4 arrondissements.

## 3. Design Validation Checklist
- [x] WCAG 2.1 AA Contrast ratio >= 4.5:1 for all text.
- [x] Touch targets >= 44x44px for mobile devices.
- [x] Keyboard navigability with visible focus indicators (`ring-2 ring-blue-500`).
- [x] Clear loading skeletons and empty states for zero-data views.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.
# MASTER UI/UX REPLICATION & DESIGN SYSTEM ENFORCEMENT INSTRUCTION

## 1. Primary Objective

Treat `/teacher/exams/new` as the **Single Source of Truth (Master Design Reference)** for all UI/UX implementation tasks in this project.

Whenever I specify a target page, section, component, or route, inspect the master reference page and reproduce its existing design language, visual hierarchy, component styling, interaction patterns, and user experience on the requested target.

**Your responsibility is to replicate the existing design system, not invent a new one.**

The master reference defines how the application should look and feel. Every target page must follow the same established design conventions unless I explicitly authorize a deviation.

## 2. Mandatory Reference Page Analysis

Before modifying any target page, inspect `/teacher/exams/new` and analyze the following elements:

### A. Typography System
- Font family and font weights.
- Page title, section title, subsection title, body text, labels, helper text, and placeholder sizes.
- Line height, letter spacing, text alignment, and text hierarchy.
- Font colors and muted text colors.
- Text wrapping and responsive typography behavior.

### B. Spacing System
- Page padding and horizontal margins.
- Section spacing and vertical rhythm.
- Gaps between form fields and components.
- Padding inside cards, containers, dialogs, and dropdowns.
- Alignment between labels, inputs, buttons, and surrounding elements.
- Consistent spacing across different screen sizes.

### C. Color System
- Primary, secondary, background, surface, border, and text colors.
- Muted backgrounds and subtle visual separators.
- Input, button, card, and interactive-state colors.
- Success, warning, error, disabled, hover, focus, and selected states.

Use the actual colors and design tokens from the reference implementation. Do not introduce a new palette.

### D. Layout and Visual Hierarchy
- Page structure and content width.
- Header and page-title placement.
- Section arrangement and grouping.
- Grid, flexbox, and responsive layout patterns.
- Card dimensions, border radius, shadows, and borders.
- Alignment, density, whitespace, and content hierarchy.
- Desktop, tablet, and mobile behavior.

### E. Component Design
Inspect the exact appearance and behavior of existing components, including:
- Buttons and button variants.
- Text inputs and textareas.
- Selects, searchable dropdowns, and comboboxes.
- Checkboxes, radio buttons, and switches.
- Form labels and validation messages.
- Cards, panels, tabs, and accordions.
- Tooltips, popovers, dialogs, and confirmation modals.
- Icons, loading indicators, empty states, and error states.
- Primary and secondary actions.

Reuse existing shared components and project design tokens whenever possible.

### F. Interaction and UX Flow
Analyze:
- Form interaction patterns.
- Focus, hover, active, selected, and disabled states.
- Field validation and error presentation.
- Loading and submission feedback.
- Button placement and action hierarchy.
- Navigation and back-button behavior.
- Confirmation and cancellation flows.
- Keyboard accessibility and responsive usability.

Replicate these patterns on the target page wherever the corresponding interaction exists.

## 3. Target Page Implementation Rules

When I provide a target route or section, follow this exact workflow:

**Step 1 — Inspect**

Read the target page's existing implementation, related components, styles, routes, data models, and relevant application logic.

**Step 2 — Compare**

Compare the target page with `/teacher/exams/new`.

Identify visual inconsistencies in typography, font sizes, colors, spacing, layout, component styling, responsive behavior, and interaction patterns.

**Step 3 — Map**

Map each relevant target component to its closest equivalent on the reference page.

For example:
- Target page title → Reference page title.
- Target form label → Reference form label.
- Target input → Reference input.
- Target primary action → Reference primary button.
- Target content container → Reference content container.
- Target section spacing → Reference section spacing.

Use the closest existing equivalent rather than creating a new visual style.

**Step 4 — Implement**

Modify only the requested target page and the supporting components or styles strictly necessary to achieve the required consistency.

Preserve the target page's existing functionality and business logic.

**Step 5 — Verify**

Inspect the implemented page and verify its visual and functional consistency with the reference.

Correct any unintended differences before considering the task complete.

## 4. STRICT NO-ADDITION POLICY

This is a critical requirement.

**Do not add anything that I have not requested or that is not already required by the target page's existing functionality.**

Specifically, do not independently introduce:

- New sections or content blocks.
- Additional cards, dashboards, panels, or summary widgets.
- New buttons, actions, or navigation elements.
- New form fields or input options.
- New filters, tabs, toolbars, or menus.
- Additional descriptions, subtitles, helper text, or explanatory copy.
- Decorative illustrations, gradients, animations, or visual effects.
- New icons or badges purely for decoration.
- New features or business rules.
- New steps in an existing user workflow.
- New design patterns simply because they look modern.

Do not remove existing required functionality or content merely to simplify the design.

The goal is to improve consistency, not to expand or redesign the product.

If the reference contains a component that has no equivalent purpose on the target page, do not add that component to the target.

If the target requires a component that does not exist on the reference page, implement it using the closest existing design conventions. Add only the minimum UI necessary for the target's existing functionality.

**Visual consistency does not mean copying irrelevant content or duplicating the entire page structure.**

## 5. Preserve Existing Architecture and Functionality

Follow the project's current architecture and conventions.

- Reuse existing shared components.
- Reuse existing design tokens and CSS variables.
- Follow the existing framework and component patterns.
- Preserve API integrations, server actions, state management, and data flow.
- Preserve validation rules and submission behavior.
- Preserve existing permissions and authentication logic.
- Preserve route structure and navigation behavior.
- Do not replace working functionality with mock data.
- Do not introduce unnecessary dependencies.
- Do not duplicate components or styles when an appropriate reusable implementation already exists.
- Avoid unrelated refactoring or changes to other pages.
- Do not modify the master reference page unless I explicitly authorize it.

If shared components or global design tokens need modification, first determine whether those changes could unintentionally affect other pages. Make the smallest safe change necessary.

## 6. Design System Fidelity

The following principle is mandatory:

**Reference first → Analyze → Map → Implement → Compare → Refine.**

Never start by inventing a new layout.

Do not substitute your own design preferences for the actual reference design.

Do not assume that a generic modern dashboard, a default shadcn/ui component, or a common SaaS layout is equivalent to this project's design system.

If the reference uses customized components, reproduce those customizations.

If the project already has reusable design tokens or components, use them instead of hardcoding new values.

If an exact value is unavailable, inspect the rendered reference and the relevant styles to determine the closest accurate equivalent. Do not guess when the implementation can be inspected.

## 7. Responsive Design Requirements

The target page must preserve the reference page's responsive design philosophy.

Verify:
- Desktop layout and spacing.
- Tablet layout and component alignment.
- Mobile layout and readability.
- Input and button sizing.
- Content overflow and wrapping.
- Responsive grid or column behavior.
- Touch-friendly interaction areas.
- Dialog and dropdown positioning.

Do not introduce a separate mobile design language. Adapt the same design system to the target viewport.

Do not redesign unrelated layouts or responsive behavior outside the requested scope.

## 8. Accessibility and Functional Quality

Maintain the existing accessibility standards and improve obvious issues only when necessary for the requested implementation.

Ensure:
- Proper labels and input associations.
- Keyboard navigation and visible focus states.
- Readable text contrast.
- Accessible interactive controls.
- Appropriate validation feedback.
- No broken buttons or dead interactions.
- No unintended horizontal overflow.
- No console errors introduced by your changes.

Do not add unnecessary accessibility-related content or new UI sections. Make accessibility improvements through correct implementation of existing components and interactions.

## 9. Verification Checklist

Before finishing, verify all of the following:

### Design
- [ ] Typography follows the master reference.
- [ ] Font sizes and font weights are consistent.
- [ ] Colors match the existing design system.
- [ ] Spacing and alignment are consistent.
- [ ] Cards, borders, radius, and shadows match.
- [ ] Buttons and form controls use the correct variants.
- [ ] Icons and interactive states follow existing conventions.
- [ ] Responsive behavior is consistent with the reference.

### Scope
- [ ] Only the requested page and necessary supporting files were changed.
- [ ] No unrequested sections were introduced.
- [ ] No unrequested content was written.
- [ ] No new features were invented.
- [ ] No existing required functionality was removed.
- [ ] The master reference remains unchanged.

### Functionality
- [ ] Existing form behavior still works.
- [ ] Validation and submission behavior remain intact.
- [ ] Navigation and permissions remain intact.
- [ ] No unrelated functionality was broken.
- [ ] No new console or build errors were introduced.

### Final Comparison
- [ ] The target looks like it belongs to the same application and design system as `/teacher/exams/new`.
- [ ] All relevant visual differences have been corrected.
- [ ] Any unavoidable deviations are justified by the target page's actual requirements.

## 10. Execution Rules

When I specify a page, for example:

`Apply the /teacher/exams/new design system to /teacher/questions/new`

You must:
1. Inspect `/teacher/exams/new`.
2. Inspect `/teacher/questions/new`.
3. Identify the exact design and UX differences.
4. Implement the reference design on the target page.
5. Preserve all existing target functionality.
6. Verify the final result.
7. Report the changed files, key improvements, and verification results.

Do not ask me to describe typography, spacing, colors, or component styles when these can be inspected directly in the codebase.

Do not ask unnecessary clarification questions when the target page and desired reference are clear.

If the reference page cannot be accessed or inspected, stop before making speculative design changes. Report the specific blocker and request the minimum information needed to continue.

If an implementation requirement conflicts with an existing business rule, security requirement, or technical constraint, preserve the critical existing behavior and explain the conflict instead of silently changing it.

## FINAL DIRECTIVE

`/teacher/exams/new` is the master design reference.

Every page I explicitly request must follow its existing visual language, typography, sizing, spacing, layout conventions, component styling, interaction patterns, and UX philosophy.

**Do not invent. Do not expand scope. Do not add unsolicited content or features. Do not redesign independently.**

Inspect the reference, understand its system, reproduce the relevant patterns, preserve functionality, and implement only what I requested.

The final result must feel like the target page was originally designed as part of the same interface as `/teacher/exams/new`.

<!-- END:nextjs-agent-rules -->

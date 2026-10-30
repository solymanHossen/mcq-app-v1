# Master UI/UX Design System & Responsive Implementation Rules

## 1. Master Design Reference

The route `/teacher/exams/new` is the single source of truth for the application's UI/UX design system.

Whenever I request a UI/UX implementation for another page, section, component, or route, you MUST inspect `/teacher/exams/new` and use its existing design as the reference.

The objective is to make every requested page look and feel like it belongs to the same application.

You MUST replicate the reference page's relevant design conventions, including:

- Typography, font family, font sizes, font weights, and line heights.
- Colors, backgrounds, borders, and visual hierarchy.
- Spacing, padding, margins, and gaps.
- Container widths, alignment, and layout structure.
- Card styles, border radii, shadows, and separators.
- Buttons, inputs, selects, dropdowns, and other form controls.
- Icons, labels, helper text, and validation messages.
- Hover, focus, active, selected, disabled, loading, and error states.
- Responsive behavior across desktop, tablet, and mobile.
- Interaction patterns, accessibility, and UX flow.

**Reference first. Analyze second. Implement third. Verify last.**

Never independently redesign a requested page when an appropriate design pattern already exists in the reference.

---

## 2. Responsive Design Is Mandatory

Every requested UI/UX implementation MUST be responsive.

Responsive behavior is part of the design system, not an optional enhancement.

Inspect how `/teacher/exams/new` adapts to different viewport sizes and reproduce its responsive design principles on the requested target page.

Do not implement a desktop-only interface and consider the task complete.

### 2.1 Desktop

On desktop, preserve the reference design's intended layout, proportions, spacing, and visual hierarchy.

Verify:

- Appropriate content width and horizontal alignment.
- Consistent page padding and section spacing.
- Correct grid and column proportions.
- Proper alignment of form labels, fields, and actions.
- Consistent button sizes and placement.
- No unnecessary empty space or excessive content density.
- No unintended overflow or horizontal scrolling.

Do not introduce additional columns, panels, cards, or widgets that do not belong to the requested page.

### 2.2 Tablet

On tablet-sized screens, adapt the existing layout without introducing a new visual style.

Verify:

- Grid columns adapt appropriately to available space.
- Form fields remain readable and usable.
- Buttons and actions remain accessible.
- Cards and containers fit within the viewport.
- Navigation and surrounding layout do not overlap the content.
- Spacing remains consistent with the reference design.
- No text clipping, element collision, or horizontal overflow occurs.

Stack or resize components only when necessary to maintain usability and preserve the reference design's layout philosophy.

### 2.3 Mobile

On mobile devices, ensure that the requested page remains fully usable.

Verify:

- Content fits within the viewport.
- No unintended horizontal scrolling occurs.
- Text remains readable without unnecessary zooming.
- Inputs, selects, and other controls remain usable.
- Buttons have sufficient touch-friendly interaction areas.
- Form fields stack appropriately when required.
- Labels and helper text wrap naturally.
- Long titles and button labels do not break the layout.
- Dialogs, dropdowns, and popovers fit within the available screen.
- Primary and secondary actions remain accessible.
- Existing navigation and page structure work correctly on small screens.
- Fixed or sticky elements do not obscure important content.
- Keyboard appearance does not make critical form actions inaccessible.

Do not hide required content or functionality simply to make the page fit a smaller screen.

Do not introduce a separate mobile design system. Adapt the same visual language to the smaller viewport.

### 2.4 Responsive Breakpoints

Inspect the project's existing responsive breakpoints, CSS conventions, and utility classes before implementing changes.

- Reuse the existing breakpoint system.
- Reuse existing responsive utilities and layout patterns.
- Follow the project's established styling conventions.
- Do not introduce arbitrary breakpoints when existing ones are sufficient.
- Avoid unnecessary device-specific overrides.
- Avoid excessive media queries and duplicated CSS.
- Prevent conflicting styles between breakpoints.

If the project uses Tailwind CSS, follow the existing Tailwind configuration and responsive utility conventions.

If the project uses another styling approach, follow its existing architecture.

Never introduce a new styling framework solely for a responsive implementation.

### 2.5 Responsive Component Behavior

Inspect and reproduce the responsive behavior of relevant components, including:

- Page containers and section layouts.
- Forms and field groups.
- Buttons and action groups.
- Cards and content panels.
- Navigation and page headers.
- Tables and data lists, where applicable.
- Tabs, dropdowns, dialogs, and popovers.
- Pagination and filters, where applicable.

Only implement components that are relevant to the target page's existing functionality.

Do not add components simply because they appear on the reference page.

### 2.6 Responsive Verification

When browser or screenshot tools are available, inspect the actual rendered page at representative viewport widths:

- Mobile: 375px and 430px.
- Tablet: 768px.
- Desktop: 1024px and 1440px.

These are verification viewport sizes, not mandatory CSS breakpoints.

Check for:

- Horizontal overflow.
- Clipped or overlapping content.
- Incorrect spacing or alignment.
- Unreadable or excessively small text.
- Broken grids and form layouts.
- Inaccessible buttons or controls.
- Dialogs extending beyond the viewport.
- Inconsistent typography or component sizing.
- Differences from the reference page's responsive behavior.

If automated visual comparison is available, compare the reference and target at equivalent viewport sizes.

If a specific viewport cannot be tested, report that limitation honestly instead of claiming successful verification.

---

## 3. Typography and Sizing Consistency

Inspect the reference implementation before changing typography.

Match the existing:

- Font family.
- Font weights.
- Page title and section heading sizes.
- Body text and secondary text sizes.
- Input text and placeholder sizes.
- Label and helper text sizes.
- Line heights and letter spacing.
- Text colors and hierarchy.
- Responsive typography behavior.

Do not arbitrarily increase font sizes, introduce new font families, or change heading hierarchy.

Use existing design tokens, CSS variables, shared typography classes, or reusable components whenever possible.

If the reference uses different typography levels for desktop and mobile, reproduce that behavior where appropriate.

---

## 4. Spacing, Colors, and Layout

Match the reference page's:

- Page padding and margins.
- Content width and alignment.
- Vertical and horizontal spacing.
- Form field gaps.
- Section separation.
- Card padding.
- Border thickness and color.
- Border radius.
- Shadow intensity.
- Background and surface colors.
- Button dimensions.
- Layout density and whitespace.

Do not introduce a new color palette, arbitrary spacing values, decorative gradients, or unrelated visual effects.

Prefer existing design tokens and component styles over hardcoded values.

When exact values are available in the codebase, use them instead of estimating.

---

## 5. Strict No-Unrequested-Additions Policy

This rule is mandatory.

**Do not invent, add, remove, or expand UI content beyond the explicitly requested scope.**

Never independently introduce:

- New sections.
- Additional cards or dashboard widgets.
- Unrequested form fields.
- New buttons or actions.
- Additional tabs, filters, or toolbars.
- New navigation elements.
- Unrequested helper text or descriptions.
- Decorative icons or badges.
- Illustrations, animations, or visual effects.
- New features or business rules.
- New steps in the user workflow.

Do not remove existing required content or functionality.

If the target page requires an element that does not exist on the reference page, implement only the minimum necessary element using the closest established design conventions.

Do not copy irrelevant reference-page content into the target.

**The goal is design consistency, not feature expansion or content duplication.**

---

## 6. Preserve Existing Functionality

UI/UX changes must not break the existing application.

Preserve:

- Business logic.
- API integrations.
- Server actions and data flow.
- State management.
- Form validation and submission.
- Authentication and authorization.
- Permissions and role restrictions.
- Existing routes and navigation.
- Loading, success, and error handling.
- Existing accessibility behavior.

Do not replace working functionality with mock data.

Do not introduce unnecessary dependencies.

Do not refactor unrelated modules or modify unrelated pages.

Do not modify `/teacher/exams/new` unless explicitly authorized.

---

## 7. Mandatory Implementation Workflow

Whenever a target route is provided, follow this workflow.

### Step 1: Inspect the Reference

Inspect `/teacher/exams/new` in the codebase.

Identify its actual typography, layout, spacing, colors, components, interaction patterns, and responsive implementation.

Inspect the rendered interface when browser tools are available.

Do not rely exclusively on assumptions or generic design conventions.

### Step 2: Inspect the Target

Inspect the requested target route and its related components, styles, state, validation, and business logic.

Understand the existing functionality before changing its appearance.

### Step 3: Compare and Map

Map each relevant target element to the closest existing pattern in the reference.

Examples:

- Target page title → Reference page title.
- Target section heading → Reference section heading.
- Target form field → Reference form field.
- Target primary button → Reference primary button.
- Target content container → Reference content container.
- Target field spacing → Reference field spacing.
- Target mobile layout → Reference mobile layout principles.

Identify differences before making changes.

### Step 4: Implement

Apply the reference design system to the requested target.

Reuse existing components and tokens whenever possible.

Modify only the requested page and supporting files strictly necessary for the implementation.

Maintain existing behavior and avoid unrelated changes.

### Step 5: Verify

Check the implemented page against the reference.

Verify typography, sizing, spacing, colors, layout, component states, responsive behavior, and existing functionality.

Correct unintended inconsistencies before finishing.

### Step 6: Report

Provide a concise summary containing:

1. The target route modified.
2. The files changed.
3. The design and responsive improvements implemented.
4. The functional checks completed.
5. Any verification that could not be performed.

Do not claim that visual or responsive testing passed unless it was actually performed.

---

## 8. Technical Quality and Accessibility

Follow the existing project architecture and conventions.

Ensure:

- Semantic and maintainable components.
- Accessible labels and form controls.
- Keyboard navigation and visible focus states.
- Readable text contrast.
- Appropriate validation feedback.
- Correct responsive layout behavior.
- No unintended overflow.
- No broken interactive elements.
- No new console errors or build errors introduced by the changes.

Prefer small, targeted changes over unnecessary rewrites.

If shared components or global design tokens must change, assess the impact on other pages before modifying them.

---

## 9. Definition of Done

A requested UI/UX task is complete only when:

- The reference page has been inspected.
- The target page has been inspected.
- The relevant design patterns have been reproduced.
- Typography and sizing are consistent.
- Colors, spacing, and layout are consistent.
- Responsive behavior has been implemented.
- Mobile usability has been considered.
- Existing functionality has been preserved.
- No unsolicited content or features have been introduced.
- Relevant visual and functional checks have been completed.
- Unverified behavior or limitations have been reported honestly.

---

## 10. Final Non-Negotiable Directive

`/teacher/exams/new` is the application's Master Design Reference.

For every page I explicitly request, reproduce its relevant:

- Design System.
- Typography and sizing.
- Colors and spacing.
- Layout and component styling.
- Interaction patterns.
- UX flow.
- Responsive behavior.

Do not independently invent a design.

Do not add unrequested content or features.

Do not break existing functionality.

Do not modify unrelated pages.

Inspect the reference, analyze the target, implement the established design patterns, verify the result, and report the outcome.

**Every requested page must look and behave like a natural part of the same application, with consistent UI/UX across desktop, tablet, and mobile.**
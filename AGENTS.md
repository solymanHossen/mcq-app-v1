# AGENTS.md
# MASTER UI/UX DESIGN SYSTEM, SHADCN/UI & RESPONSIVE IMPLEMENTATION RULES

## 1. CORE OBJECTIVE

The route `/teacher/exams/new` is the application's **Single Source of Truth (Master Design Reference)** for all UI/UX implementation tasks.

Whenever I request a new page, existing page modification, section, component, or route, you MUST inspect `/teacher/exams/new` and follow its existing design language, visual hierarchy, component styling, interaction patterns, and responsive behavior.

Your responsibility is to reproduce the established design system on the requested target page.

**Do not invent a new design system. Do not independently redesign pages. Do not introduce your own visual preferences.**

Every requested page must look and feel like it was originally designed as part of the same application.

### Design Authority

Follow this hierarchy:

1. `/teacher/exams/new` — Master visual and UX reference.
2. Existing project design tokens and CSS variables.
3. Existing shadcn/ui component architecture.
4. Existing reusable components and established project conventions.
5. Minimal custom implementation only when genuinely necessary.

The master reference defines the visual appearance. shadcn/ui provides the component foundation.

---

## 2. MANDATORY MASTER REFERENCE ANALYSIS

Before implementing any requested UI/UX changes, inspect `/teacher/exams/new` thoroughly.

Analyze the following design characteristics.

### 2.1 Typography System

Identify and reproduce:

- Font family.
- Font weights.
- Page title font size.
- Section heading font size.
- Subheading font size.
- Body text size.
- Form label size.
- Input text size.
- Placeholder size.
- Helper text size.
- Description and secondary text size.
- Line height.
- Letter spacing.
- Text colors.
- Text hierarchy.
- Text alignment.
- Responsive typography behavior.

Maintain consistent typography across all requested pages.

Do not arbitrarily increase or decrease font sizes.

Do not introduce new fonts unless explicitly requested.

### 2.2 Spacing System

Inspect and reproduce:

- Page padding.
- Horizontal margins.
- Content width.
- Section spacing.
- Vertical rhythm.
- Component gaps.
- Form field spacing.
- Card padding.
- Container padding.
- Button spacing.
- Input dimensions.
- Alignment between labels and controls.
- Responsive spacing behavior.

Use existing spacing tokens and utility classes whenever possible.

Avoid arbitrary spacing values.

### 2.3 Color System

Identify the actual colors used by the reference:

- Primary colors.
- Secondary colors.
- Page background.
- Surface background.
- Card background.
- Border colors.
- Primary text.
- Secondary text.
- Muted text.
- Input background.
- Button colors.
- Focus colors.
- Hover colors.
- Active colors.
- Selected colors.
- Disabled colors.
- Success states.
- Warning states.
- Error states.

Use the existing project's color variables, CSS tokens, and component variants.

Do not introduce an independent color palette.

### 2.4 Layout and Visual Hierarchy

Inspect:

- Page structure.
- Main content width.
- Header positioning.
- Page title placement.
- Section arrangement.
- Container alignment.
- Grid and flex layouts.
- Column proportions.
- Card dimensions.
- Border radius.
- Shadow styles.
- Border thickness.
- Content density.
- Whitespace.
- Responsive layout behavior.

Reproduce the relevant layout patterns without copying irrelevant content or sections.

### 2.5 Component Styling

Inspect the exact appearance and behavior of:

- Buttons.
- Inputs.
- Textareas.
- Selects.
- Searchable dropdowns.
- Labels.
- Checkboxes.
- Radio groups.
- Switches.
- Cards.
- Dialogs.
- Confirmation dialogs.
- Dropdown menus.
- Popovers.
- Tabs.
- Accordions.
- Tooltips.
- Badges.
- Separators.
- Tables.
- Skeleton loaders.
- Empty states.
- Error states.
- Loading states.
- Form validation messages.

Use the closest existing component pattern for each relevant target element.

### 2.6 Interaction and UX Flow

Inspect:

- Form interaction patterns.
- Focus behavior.
- Hover behavior.
- Active and selected states.
- Disabled states.
- Loading feedback.
- Validation behavior.
- Submission behavior.
- Button hierarchy.
- Confirmation flows.
- Cancellation flows.
- Navigation behavior.
- Keyboard interactions.
- Accessibility.
- Responsive interactions.

Replicate the corresponding patterns on the target page.

---

## 3. MANDATORY SHADCN/UI COMPONENT SYSTEM

**Every UI/UX implementation MUST follow the project's existing shadcn/ui component architecture.**

shadcn/ui is the mandatory component foundation for all requested UI work.

Do not create an independent component library or a parallel design system.

### 3.1 Inspect Before Creating

Before creating any component:

1. Inspect the existing component directory.
2. Identify installed shadcn/ui components.
3. Inspect existing shared components.
4. Inspect component variants and supported props.
5. Inspect project aliases and configuration.
6. Inspect existing styling conventions.
7. Reuse the closest existing component.

Do not assume a default shadcn/ui installation. Follow the project's actual configuration.

### 3.2 Reuse Existing Components

Use existing components whenever appropriate, including:

- Button
- Input
- Textarea
- Label
- Select
- Checkbox
- Radio Group
- Switch
- Form
- Card
- Dialog
- Alert Dialog
- Dropdown Menu
- Popover
- Command
- Tabs
- Accordion
- Tooltip
- Badge
- Separator
- Skeleton
- Table
- Sheet
- Breadcrumb
- Pagination

Only use components required by the target page.

Do not add components merely because they are available.

### 3.3 Component Design Rules

- Reuse existing component variants.
- Preserve established component APIs.
- Follow existing component composition patterns.
- Use existing form wrappers and validation patterns.
- Reuse shared layout primitives.
- Reuse existing design tokens.
- Follow existing icon library conventions.
- Maintain accessibility and keyboard behavior.
- Keep component styling consistent with the master reference.

Do not replace an existing shadcn/ui component with manually styled HTML when an appropriate component is already available.

Native HTML elements are acceptable when appropriate and when a shadcn/ui component is unnecessary or unsuitable.

### 3.4 shadcn/ui Visual Consistency

**shadcn/ui provides the component foundation; `/teacher/exams/new` defines the visual design.**

Do not blindly apply default shadcn/ui styles.

Customize existing components only as necessary to match the master reference.

Match:

- Typography.
- Colors.
- Spacing.
- Dimensions.
- Borders.
- Radius.
- Shadows.
- Component states.
- Responsive behavior.

Do not modify the master reference simply to make it look like default shadcn/ui.

### 3.5 Avoid Duplicate Components

Never create another component when an equivalent shared component already exists.

Avoid:

- Duplicate button systems.
- Duplicate form components.
- Duplicate modal systems.
- Duplicate input wrappers.
- Duplicate design tokens.
- Parallel styling systems.
- Unnecessary wrapper components.
- Repeated hardcoded styles.

If a new reusable component is genuinely necessary, build it using the existing shadcn/ui conventions.

### 3.6 Styling Priority

Always follow this order:

1. Existing shared shadcn/ui component.
2. Existing component variant or supported props.
3. Existing design tokens or CSS variables.
4. Existing project utility classes.
5. Minimal targeted component customization.
6. New reusable component only when necessary.

Avoid unnecessary dependencies, excessive `!important`, duplicated CSS, and uncontrolled global styling changes.

---

## 4. MANDATORY RESPONSIVE DESIGN

Responsive design is NOT optional.

Every requested page MUST work correctly across desktop, tablet, and mobile.

The target page must follow the same responsive design philosophy as `/teacher/exams/new`.

Do not implement a desktop-only interface.

### 4.1 Desktop Responsiveness

Verify:

- Content width and alignment.
- Horizontal padding.
- Section spacing.
- Grid and column proportions.
- Form layout.
- Button placement.
- Card dimensions.
- Navigation alignment.
- Proper whitespace.
- No unintended horizontal overflow.

### 4.2 Tablet Responsiveness

Verify:

- Responsive grid behavior.
- Appropriate column stacking.
- Form readability.
- Button accessibility.
- Card and container dimensions.
- Navigation behavior.
- Content wrapping.
- Proper spacing.
- No overlapping components.

### 4.3 Mobile Responsiveness

Verify:

- No unintended horizontal scrolling.
- No clipped content.
- Readable typography.
- Proper content stacking.
- Usable form controls.
- Touch-friendly buttons.
- Correct input widths.
- Natural text wrapping.
- Accessible primary and secondary actions.
- Responsive dialog dimensions.
- Correct dropdown and popover positioning.
- No overlapping navigation.
- No hidden required content.
- No fixed elements obscuring important content.

Do not remove required functionality to make a page fit on mobile.

Do not create an entirely different mobile design language.

### 4.4 Responsive Breakpoints

Inspect the existing project's breakpoint configuration.

Use the existing breakpoint system.

If the project uses Tailwind CSS, follow the existing Tailwind responsive utility conventions.

If the project uses another styling system, follow its established conventions.

Suggested viewport verification sizes:

| Device | Width |
|---|---:|
| Mobile | 375px |
| Large Mobile | 430px |
| Tablet | 768px |
| Small Desktop | 1024px |
| Desktop | 1440px |

These are testing viewport sizes, not mandatory CSS breakpoints.

Do not introduce arbitrary breakpoints when existing ones are sufficient.

### 4.5 Responsive Component Behavior

Ensure that relevant components behave correctly at different screen sizes:

- Page containers.
- Page headers.
- Forms.
- Form field groups.
- Buttons.
- Cards.
- Tables.
- Tabs.
- Dropdowns.
- Dialogs.
- Sheets.
- Popovers.
- Navigation.
- Pagination.

Do not introduce irrelevant components.

### 4.6 Responsive Verification

When browser or screenshot tools are available, inspect the actual rendered interface at representative viewport sizes.

Check:

- Layout consistency.
- Typography consistency.
- Component alignment.
- Horizontal overflow.
- Element collisions.
- Text clipping.
- Form usability.
- Dialog positioning.
- Navigation usability.
- Touch interaction.
- Visual consistency with the reference.

Do not claim responsive verification passed unless it was actually performed.

If browser verification is unavailable, perform the strongest available code-level checks and report the limitation honestly.

---

## 5. STRICT NO-UNREQUESTED-ADDITIONS POLICY

This is one of the most important rules.

**Do not add anything I have not requested or that is not required by the target page's existing functionality.**

Never independently introduce:

- New sections.
- New content blocks.
- Additional dashboard widgets.
- Additional cards or summary panels.
- Unrequested form fields.
- New buttons or actions.
- New tabs or filters.
- New toolbars.
- Additional navigation elements.
- Unrequested helper text.
- New descriptions or subtitles.
- Decorative icons.
- Unnecessary badges.
- Illustrations.
- Gradients.
- Unnecessary animations.
- Extra visual effects.
- New features.
- New business rules.
- Additional workflow steps.

Do not add content simply to make a page look more modern or visually complete.

Do not remove existing required content or functionality.

### Important Distinction

Design replication does not mean copying irrelevant content from the reference page.

If the target requires an element that does not exist on the reference page, implement only the minimum necessary element using the closest established design conventions.

If an element on the reference has no equivalent purpose on the target, do not add it.

**Improve consistency, not product scope.**

---

## 6. PRESERVE EXISTING FUNCTIONALITY

UI/UX implementation must not break existing functionality.

Preserve:

- Business logic.
- API integrations.
- Server actions.
- State management.
- Form validation.
- Form submission.
- Authentication.
- Authorization.
- Role permissions.
- Route structure.
- Navigation.
- Data models.
- Existing event handlers.
- Loading states.
- Error handling.
- Success feedback.
- Existing accessibility behavior.

Additional requirements:

- Do not replace working functionality with mock data.
- Do not change API contracts unnecessarily.
- Do not remove existing validation.
- Do not introduce unnecessary dependencies.
- Do not refactor unrelated modules.
- Do not modify unrelated pages.
- Do not change the master reference page without explicit permission.

Only modify supporting files when strictly necessary for the requested implementation.

### Shared Component Safety

Before changing a shared component or global design token, inspect where it is used.

Determine whether the change could unintentionally affect other pages.

Prefer targeted changes when a global change is not required.

---

## 7. MANDATORY IMPLEMENTATION WORKFLOW

Every requested UI/UX task MUST follow this workflow.

### STEP 1 — INSPECT THE MASTER REFERENCE

Inspect `/teacher/exams/new`.

Read its implementation and related components, styles, design tokens, and responsive utilities.

Identify its actual design and UX conventions.

Inspect the rendered page if browser tools are available.

Do not rely exclusively on assumptions.

### STEP 2 — INSPECT THE TARGET PAGE

Inspect the requested target route.

Read its:

- Existing implementation.
- Related components.
- Styles.
- Form logic.
- State management.
- API integrations.
- Validation.
- Permissions.
- Navigation.
- Responsive behavior.

Understand its current functionality before making modifications.

### STEP 3 — INSPECT SHADCN/UI COMPONENTS

Identify the appropriate existing shadcn/ui components.

Inspect their variants, props, shared wrappers, and customization patterns.

Determine which components can be reused directly.

Do not create duplicates.

### STEP 4 — COMPARE BOTH PAGES

Identify inconsistencies between the target and master reference.

Compare:

- Typography.
- Font sizes.
- Colors.
- Spacing.
- Layout.
- Component styles.
- Dimensions.
- Borders.
- Radius.
- Shadows.
- Interaction states.
- Responsive behavior.
- UX flow.

### STEP 5 — MAP THE COMPONENTS

Map target elements to their closest reference equivalents.

Examples:

- Target page title → Reference page title.
- Target section title → Reference section title.
- Target input → Reference input.
- Target button → Reference button.
- Target content container → Reference container.
- Target form layout → Reference form layout.
- Target mobile behavior → Reference responsive behavior.

Use the closest existing equivalent.

### STEP 6 — IMPLEMENT

Apply the established design system.

Use existing shadcn/ui components and shared components.

Preserve all target functionality.

Implement responsive behavior.

Modify only the requested target page and necessary supporting files.

Do not add unrelated content or features.

### STEP 7 — VERIFY

Compare the implementation against the master reference.

Verify:

- Visual consistency.
- Typography.
- Component styling.
- Spacing.
- Layout.
- Responsive behavior.
- Interactive states.
- Existing functionality.
- Accessibility.
- Console and build errors introduced by the changes.

Fix unintended inconsistencies.

### STEP 8 — REPORT

Provide a concise implementation report.

Include:

1. Target route.
2. Modified files.
3. Components reused or created.
4. Design improvements.
5. Responsive improvements.
6. Functional verification.
7. Any limitations or unverified items.

Do not claim tests passed unless they were actually executed.

---

## 8. ACCESSIBILITY AND CODE QUALITY

Maintain the project's existing accessibility and code quality standards.

Ensure:

- Semantic HTML.
- Proper form labels.
- Correct input associations.
- Keyboard navigation.
- Visible focus states.
- Readable contrast.
- Accessible interactive controls.
- Correct validation feedback.
- Appropriate touch targets.
- Consistent component behavior.
- Maintainable code.
- Reusable components where appropriate.
- No unnecessary duplication.

Do not add new UI content merely to demonstrate accessibility.

Implement accessibility through the correct use of existing components and interaction patterns.

---

## 9. CODE CHANGE SCOPE CONTROL

Follow strict change-scope discipline.

Before modifying files:

- Identify the target route.
- Identify directly related components.
- Identify required supporting files.
- Identify possible shared-component side effects.

During implementation:

- Avoid unrelated refactoring.
- Avoid unnecessary renaming.
- Avoid changing unrelated business logic.
- Avoid modifying unrelated routes.
- Avoid introducing new dependencies.
- Avoid changing global styling without necessity.

After implementation:

- Review the changed files.
- Ensure modifications are relevant to the requested task.
- Check for unintended side effects.
- Confirm the master reference remains unchanged.

If a technical limitation prevents exact replication, preserve existing functionality and explain the limitation instead of silently introducing an alternative design.

If the master reference cannot be inspected, stop before making speculative design changes and report the specific blocker.

---

## 10. DEFINITION OF DONE

A requested UI/UX task is complete only when all applicable requirements below are satisfied.

### Master Reference

- [ ] `/teacher/exams/new` has been inspected.
- [ ] Target page has been inspected.
- [ ] Actual design patterns have been identified.
- [ ] Relevant reference styles have been reproduced.

### Design Consistency

- [ ] Typography is consistent.
- [ ] Font sizes are consistent.
- [ ] Colors are consistent.
- [ ] Spacing is consistent.
- [ ] Layout is consistent.
- [ ] Cards and containers are consistent.
- [ ] Buttons and form controls are consistent.
- [ ] Interactive states are consistent.
- [ ] UX flow follows established conventions.

### shadcn/ui

- [ ] Existing shadcn/ui components were inspected.
- [ ] Appropriate components were reused.
- [ ] Existing variants and conventions were followed.
- [ ] No unnecessary duplicate components were created.
- [ ] No independent component system was introduced.

### Responsive Design

- [ ] Desktop layout is usable.
- [ ] Tablet layout is usable.
- [ ] Mobile layout is usable.
- [ ] No unintended horizontal overflow.
- [ ] No clipped or overlapping content.
- [ ] Forms remain usable.
- [ ] Buttons remain accessible.
- [ ] Dialogs and dropdowns fit the viewport.
- [ ] Responsive behavior follows the reference design.

### Scope and Functionality

- [ ] Only relevant files were modified.
- [ ] No unrequested content was added.
- [ ] No unrequested features were introduced.
- [ ] Existing functionality is preserved.
- [ ] Existing validation is preserved.
- [ ] Existing permissions are preserved.
- [ ] No unrelated pages were modified.
- [ ] Master reference remains unchanged.

### Verification

- [ ] Relevant functionality was checked.
- [ ] Relevant visual checks were performed.
- [ ] Available responsive checks were performed.
- [ ] New errors introduced by the changes were checked.
- [ ] Unverified items are reported honestly.

---

## 11. EXAMPLE OF EXPECTED EXECUTION

When I provide:

`Apply the /teacher/exams/new design system to /teacher/questions/new`

You MUST:

1. Inspect `/teacher/exams/new`.
2. Inspect `/teacher/questions/new`.
3. Inspect the existing shadcn/ui components.
4. Compare the two page designs.
5. Identify relevant design differences.
6. Map target components to reference components.
7. Implement the same typography, sizing, spacing, colors, layout, component styling, and UX patterns.
8. Implement responsive behavior for desktop, tablet, and mobile.
9. Preserve all existing functionality.
10. Avoid adding any unrequested content or features.
11. Verify the implementation.
12. Report the modified files and verification results.

Do not ask me to describe design properties that you can inspect directly from the codebase.

Do not ask unnecessary clarification questions when the target route and reference are clear.

---

## 12. FINAL NON-NEGOTIABLE DIRECTIVE

`/teacher/exams/new` is the permanent Master Design Reference for all requested UI/UX implementation tasks.

**Every requested page MUST follow these three requirements simultaneously:**

1. **Visual Reference:** Match the design language, typography, colors, spacing, layout, component styling, and UX patterns of `/teacher/exams/new`.
2. **Component Architecture:** Use the existing shadcn/ui component system and the project's established reusable components.
3. **Responsive Behavior:** Maintain consistent usability and design quality across desktop, tablet, and mobile.

### Never:

- Invent a new design system.
- Independently redesign the interface.
- Add unrequested sections.
- Add unrequested content.
- Invent new features.
- Duplicate existing components.
- Ignore shadcn/ui conventions.
- Ignore mobile responsiveness.
- Break existing functionality.
- Modify unrelated pages.
- Modify the master reference without permission.

### Always:

- Inspect the reference.
- Inspect the target.
- Reuse existing components.
- Follow the established design tokens.
- Preserve existing business logic.
- Implement responsive behavior.
- Verify the result.
- Report actual changes honestly.

**FINAL PRINCIPLE:**

`/teacher/exams/new` defines HOW THE APPLICATION LOOKS AND BEHAVES.

`shadcn/ui` defines HOW THE UI COMPONENTS ARE BUILT.

The target page defines WHAT CONTENT AND FUNCTIONALITY MUST REMAIN.

Your job is to bring all three together without inventing anything outside the requested scope.

Every requested page must look, behave, and respond like a natural part of the same professionally designed application.

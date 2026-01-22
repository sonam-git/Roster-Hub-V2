# Professional UI Design System - Quick Reference

## Overview
This design system defines the professional AWS-like UI standards used across RosterHub's authentication pages (Home, Login, Signup, ForgetPassword).

---

## Color Palette

### Primary Colors
```
Blue-600:   #2563eb  (Primary action, links, focus states)
Gray-900:   #1f2937  (Primary text - light mode)
White:      #ffffff  (Backgrounds - light mode)
Gray-50:    #f9fafb  (Subtle backgrounds - light mode)
```

### Dark Mode
```
Gray-800:   #1f2937  (Backgrounds)
Gray-700:   #374151  (Input backgrounds)
White:      #ffffff  (Primary text)
Gray-400:   #9ca3af  (Secondary text)
```

### Semantic Colors
```
Success:    #10b981  (green-600)
Error:      #dc2626  (red-600)
Warning:    #f59e0b  (amber-600)
Info:       #3b82f6  (blue-500)
```

### Border Colors
```
Light Mode: #d1d5db  (gray-300)
Dark Mode:  #4b5563  (gray-600)
```

---

## Typography

### Font Family
```css
font-family: system-ui, -apple-system, sans-serif
/* No custom fonts imported */
```

### Font Sizes
```
Hero Title:      text-4xl (2.25rem / 36px)
Page Title:      text-2xl (1.5rem / 24px)
Section Title:   text-lg (1.125rem / 18px)
Body:            text-base (1rem / 16px)
Small:           text-sm (0.875rem / 14px)
Extra Small:     text-xs (0.75rem / 12px)
```

### Font Weights
```
Semibold:  font-semibold (600) - Headings, emphasis
Medium:    font-medium (500)   - Labels, subheadings
Regular:   font-normal (400)   - Body text
```

### Text Transform
```
✓ Use: Sentence case
✗ Avoid: UPPERCASE, Title Case (except proper nouns)
```

---

## Spacing

### Component Spacing
```
Section Gap:        gap-12 (3rem / 48px)
Card Padding:       p-8 (2rem / 32px)
Form Element Gap:   space-y-4 (1rem / 16px)
Button Padding:     px-4 py-2 (1rem × 0.5rem)
Input Padding:      px-3 py-2 (0.75rem × 0.5rem)
```

### Container Widths
```
Max Content:  max-w-6xl (72rem / 1152px)
Form Card:    max-w-md (28rem / 448px)
```

---

## Border Radius

### Standard Radii
```
Small:   rounded-md (0.375rem / 6px)  - Inputs, buttons
Medium:  rounded-lg (0.5rem / 8px)    - Cards, containers
Large:   rounded-xl (0.75rem / 12px)  - Only for special cases
```

### Usage
```
Inputs:     rounded-md
Buttons:    rounded-md
Cards:      rounded-lg
Badges:     rounded-md or rounded-full
```

---

## Shadows

### Standard Shadows
```
Light:  shadow-sm  - Default for cards and buttons
None:   shadow-none - For nested elements
```

### Usage
```
✓ Use: shadow-sm for elevation
✗ Avoid: shadow-xl, shadow-2xl, multiple shadows
```

---

## Buttons

### Primary Button
```jsx
className="
  w-full px-4 py-2
  bg-blue-600 hover:bg-blue-700
  text-white font-medium
  rounded-md shadow-sm
  transition-colors
  disabled:opacity-50 disabled:cursor-not-allowed
"
```

### Secondary Button (if needed)
```jsx
className="
  w-full px-4 py-2
  bg-white dark:bg-gray-700
  text-gray-900 dark:text-white
  border border-gray-300 dark:border-gray-600
  font-medium rounded-md
  hover:bg-gray-50 dark:hover:bg-gray-600
  transition-colors
"
```

### Button States
- Default: Solid color
- Hover: Slightly darker
- Disabled: 50% opacity
- Loading: Show spinner, disable interaction

---

## Form Inputs

### Text Input
```jsx
className="
  w-full px-3 py-2
  rounded-md
  border border-gray-300 dark:border-gray-600
  bg-white dark:bg-gray-700
  text-gray-900 dark:text-white
  placeholder-gray-400 dark:placeholder-gray-500
  focus:outline-none
  focus:ring-2 focus:ring-blue-500
  focus:border-transparent
  transition-colors
"
```

### Label
```jsx
className="
  block text-sm font-medium
  text-gray-700 dark:text-gray-300
  mb-1
"
```

### Helper Text
```jsx
className="
  text-xs
  text-gray-500 dark:text-gray-400
  mt-1
"
```

---

## Alert Messages

### Error Alert
```jsx
<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg text-sm">
  {/* Error content */}
</div>
```

### Success Alert
```jsx
<div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg text-sm">
  {/* Success content */}
</div>
```

### Info Alert
```jsx
<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 px-4 py-3 rounded-lg text-sm">
  {/* Info content */}
</div>
```

---

## Cards/Containers

### Main Card
```jsx
className="
  bg-white dark:bg-gray-800
  rounded-lg shadow-sm
  border border-gray-200 dark:border-gray-700
  p-8
"
```

### Feature Card
```jsx
className="
  bg-gray-100 dark:bg-gray-800
  rounded-lg
  border border-gray-200 dark:border-gray-700
  p-6
  shadow-sm hover:shadow-md
  transition-all duration-200
"
```

---

## Links

### Standard Link
```jsx
className="
  text-blue-600 dark:text-blue-400
  hover:text-blue-700 dark:hover:text-blue-300
  font-medium
  transition-colors
"
```

### Navigation Link (if needed)
```jsx
className="
  text-gray-600 dark:text-gray-300
  hover:text-gray-900 dark:hover:text-white
  font-medium
  transition-colors
"
```

---

## Icons & Decorations

### Icon Sizing
```
Small:   w-4 h-4 (16px)
Medium:  w-5 h-5 (20px)
Large:   w-6 h-6 (24px)
```

### Icon Colors
```
Primary:    text-blue-600 dark:text-blue-400
Secondary:  text-gray-600 dark:text-gray-400
Success:    text-green-600 dark:text-green-400
Error:      text-red-600 dark:text-red-400
```

### Rules
```
✗ No emojis in UI
✓ Use SVG icons only
✓ Keep icons consistent in size within sections
```

---

## Backgrounds

### Page Background
```jsx
className="
  relative overflow-hidden min-h-screen
  bg-gradient-to-b from-gray-50 to-white
  dark:from-gray-900 dark:to-gray-800
"
```

### Pattern (Subtle)
```jsx
<div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60'...")`
}} />
```

---

## Transitions

### Standard Transitions
```
Colors:     transition-colors
All:        transition-all duration-200
```

### Rules
```
✗ No transform effects (scale, translate)
✗ No animation effects (pulse, bounce, ping)
✓ Use simple color/opacity transitions only
```

---

## Layout

### Two-Column Layout
```jsx
<div className="grid lg:grid-cols-2 gap-12 items-center w-full max-w-6xl mx-auto">
  {/* Left: Branding */}
  <div className="hidden lg:flex flex-col space-y-8">
    {/* Content */}
  </div>
  
  {/* Right: Form */}
  <div className="w-full lg:w-auto">
    {/* Form card */}
  </div>
</div>
```

### Container
```jsx
className="
  relative z-10
  container mx-auto
  px-4 sm:px-6 lg:px-8
  py-12
  min-h-screen
  flex flex-col justify-center
"
```

---

## Accessibility

### Focus States
```
✓ Always visible focus ring
✓ High contrast (ring-2 ring-blue-500)
✓ No outline-none without alternative focus indicator
```

### Color Contrast
```
✓ Minimum 4.5:1 for text
✓ Minimum 3:1 for large text
✓ Test in both light and dark modes
```

### ARIA & Semantic HTML
```
✓ Proper label associations
✓ Meaningful alt text
✓ Semantic HTML elements
✓ Keyboard navigation support
```

---

## Do's and Don'ts

### ✓ Do
- Use single blue accent color
- Keep backgrounds solid or subtle gradients
- Use sentence case for all text
- Maintain consistent spacing
- Provide clear focus states
- Support dark mode
- Test accessibility
- Keep it simple

### ✗ Don't
- Use multiple bright colors
- Add colorful gradients everywhere
- Use UPPERCASE text
- Include emojis in UI
- Add animations/transforms
- Use backdrop-blur effects
- Create complex shadows
- Override default fonts unnecessarily

---

## Example Component

### Professional Login Form
```jsx
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 w-full max-w-md mx-auto">
  <div className="mb-6">
    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
      Sign in
    </h2>
    <p className="text-sm text-gray-600 dark:text-gray-400">
      Enter your credentials to access your account
    </p>
  </div>

  <form className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Email address
      </label>
      <input
        type="email"
        className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        placeholder="Enter your email"
      />
    </div>

    <button
      type="submit"
      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-colors"
    >
      Sign in
    </button>
  </form>
</div>
```

---

## Version Control

- Version: 1.0
- Last Updated: January 21, 2026
- Status: Active
- Applies to: Login, Signup, Home (logged out), ForgetPassword pages

---

## Resources

- Tailwind CSS Documentation: https://tailwindcss.com
- AWS Design System Reference
- WCAG 2.1 Guidelines for Accessibility

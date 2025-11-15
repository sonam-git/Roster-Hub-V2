# Quick Reference Guide - Responsive Implementation

## Breakpoints Quick Reference

```javascript
// tailwind.config.js
screens: {
  xs: '480px',   // Extra small devices
  sm: '640px',   // Small devices  
  md: '768px',   // Medium devices
  lg: '976px',   // Large devices (desktop threshold)
  xl: '1440px',  // Extra large devices
}
```

## Common Responsive Patterns

### Show/Hide Elements

```jsx
// Show only on mobile (<976px)
<div className="lg:hidden">Mobile content</div>

// Show only on desktop (≥976px)
<div className="hidden lg:flex">Desktop content</div>

// Show on small, hide on large
<div className="block lg:hidden">Small screen content</div>
```

### Responsive Layouts

```jsx
// Single column on mobile, 2 columns on desktop
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

// Stack on mobile, row on desktop
<div className="flex flex-col lg:flex-row gap-4">

// Full width on mobile, max-width on desktop
<div className="w-full max-w-4xl mx-auto px-4">
```

### Responsive Spacing

```jsx
// Smaller padding on mobile, larger on desktop
<div className="p-4 lg:p-8">

// Responsive margins
<div className="mt-4 lg:mt-8 mb-6 lg:mb-12">
```

### Responsive Typography

```jsx
// Smaller text on mobile, larger on desktop
<h1 className="text-2xl lg:text-3xl font-bold">

// Responsive line heights
<p className="text-sm lg:text-base leading-relaxed lg:leading-loose">
```

## Component-Specific Patterns

### TopHeader Navigation

```jsx
// Desktop horizontal nav (≥976px)
<nav className="hidden lg:flex items-center gap-6">
  {/* Desktop menu items */}
</nav>

// Mobile bottom nav (<976px)
<nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[1000]">
  {/* Mobile menu items */}
</nav>
```

### Chat Components

```jsx
// Chat icon - mobile only
<button className="lg:hidden fixed bottom-20 right-4 z-[1001]">
  {/* Chat icon */}
</button>

// Chat popup - responsive positioning
<div className="fixed bottom-0 lg:bottom-8 right-0 lg:right-8 w-full lg:w-96">
  {/* Chat content */}
</div>
```

### Modals

```jsx
// Modal overlay
<div className="fixed inset-0 z-[9999] bg-black/50">
  {/* Modal content with responsive sizing */}
  <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl">
    {/* Modal content */}
  </div>
</div>
```

## Z-Index Reference

| Component | Class | Z-Index | Usage |
|-----------|-------|---------|-------|
| Bottom Nav | `z-[1000]` | 1000 | Fixed navigation |
| Chat Icon | `z-[1001]` | 1001 | Floating button |
| Chat Popup | `z-[1002]` | 1002 | Chat panel |
| Modal Overlay | `z-[9999]` | 9999 | Blocking layer |
| Modal Content | `z-[10000]` | 10000 | Top layer |

## Auth-Based Rendering

```jsx
// Show only when logged in
{Auth.loggedIn() && (
  <div>Authenticated content</div>
)}

// Show only when not logged in
{!Auth.loggedIn() && (
  <div>Guest content</div>
)}

// Different content based on auth
{Auth.loggedIn() ? (
  <UserMenu />
) : (
  <LoginButton />
)}
```

## Navigation Patterns

### Programmatic Navigation

```jsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Navigate to route
navigate('/game-schedule');

// Navigate back
navigate(-1);

// Navigate with state
navigate('/game-details', { state: { from: 'list' } });
```

### Route Parameters

```jsx
// In route definition
<Route path="/game-update/:gameId" element={<GameUpdatePage />} />

// In component
import { useParams } from 'react-router-dom';
const { gameId } = useParams();
```

## Dark Mode Patterns

```jsx
// Conditional classes based on theme
<div className={`
  ${isDarkMode 
    ? "bg-gray-800 text-white border-gray-700" 
    : "bg-white text-gray-900 border-gray-200"
  }
`}>
```

### Common Dark Mode Colors

| Purpose | Light | Dark |
|---------|-------|------|
| Background | `bg-gray-50` / `bg-white` | `bg-gray-900` / `bg-gray-800` |
| Text | `text-gray-900` | `text-white` / `text-gray-100` |
| Secondary Text | `text-gray-600` | `text-gray-300` / `text-gray-400` |
| Borders | `border-gray-200` / `border-gray-300` | `border-gray-700` / `border-gray-600` |
| Hover BG | `hover:bg-gray-100` | `hover:bg-gray-700` |

## Form Patterns

### Responsive Form Layouts

```jsx
// Single column mobile, two columns desktop
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>
    <label>First Field</label>
    <input type="text" />
  </div>
  <div>
    <label>Second Field</label>
    <input type="text" />
  </div>
</div>
```

### Responsive Buttons

```jsx
// Stack on mobile, row on desktop
<div className="flex flex-col sm:flex-row gap-3">
  <button className="flex-1">Cancel</button>
  <button className="flex-1">Submit</button>
</div>
```

## Loading States

```jsx
// Loading spinner
<div className="flex items-center justify-center">
  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
</div>

// Loading text
<div className="flex items-center gap-2">
  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
  <span>Loading...</span>
</div>
```

## Error States

```jsx
// Error message box
<div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50">
  <div className="flex items-start gap-2">
    <span className="text-red-500">⚠️</span>
    <p className="text-red-600 dark:text-red-400 text-sm">
      {error.message}
    </p>
  </div>
</div>
```

## Testing Shortcuts

### Chrome DevTools

```
1. F12 or Cmd+Opt+I (Mac) / Ctrl+Shift+I (Windows)
2. Click device toggle icon (Cmd+Shift+M / Ctrl+Shift+M)
3. Select device preset or enter custom dimensions
4. Test at: 375px, 768px, 1024px, 1440px
```

### Responsive Testing URLs

```
Local: http://localhost:3000
Development: [Your dev URL]
Production: [Your prod URL]
```

### Quick Test Checklist

- [ ] 320px (iPhone SE)
- [ ] 375px (iPhone 12)
- [ ] 768px (iPad)
- [ ] 1024px (iPad Pro)
- [ ] 1440px (Desktop)
- [ ] Dark mode at each size
- [ ] Navigation works at each breakpoint
- [ ] Chat opens/closes properly
- [ ] Modals display correctly
- [ ] Forms are usable

## Common Issues & Solutions

### Issue: Element cut off on mobile
**Solution**: Check for fixed widths, use `w-full` or `max-w-*`

### Issue: Text too small on mobile
**Solution**: Use responsive text sizes `text-sm lg:text-base`

### Issue: Buttons too close together
**Solution**: Add proper gap classes `gap-3 lg:gap-4`

### Issue: Modal doesn't show
**Solution**: Check z-index hierarchy, ensure overlay has proper z-index

### Issue: Navigation overlaps content
**Solution**: Add proper padding-top or margin-top to main content

### Issue: Chat icon not visible
**Solution**: Verify `lg:hidden` class and z-index is high enough

## File Locations

```
Breakpoint Config: /client/tailwind.config.js
Top Navigation: /client/src/components/TopHeader/index.jsx
Bottom Navigation: /client/src/components/TopHeader/index.jsx (mobile section)
Chat Components: /client/src/components/ChatPopup/index.jsx
Chat Styles: /client/src/assets/css/chatModal.css
Sidebar: /client/src/components/Header/index.jsx
Routes: /client/src/App.jsx
Game Update: /client/src/pages/GameUpdatePage.jsx
```

## Quick Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Format code
npm run format
```

## Documentation Files

1. `RESPONSIVE_SUMMARY.md` - Overall summary
2. `MOBILE_RESPONSIVE_FIXES.md` - Detailed responsive implementation
3. `GAME_UPDATE_REFACTOR.md` - Game update full-page design
4. `TOPHEADER_AUTH_CHANGES.md` - Navigation and auth patterns
5. `TESTING_GUIDE.md` - Testing procedures
6. `QUICK_REFERENCE.md` - This file

---

**Pro Tip**: When in doubt, start with mobile layout first, then enhance for larger screens using `lg:` prefix.

**Remember**: Test on real devices whenever possible. Browser responsive mode is helpful but not always accurate for touch interactions and rendering.

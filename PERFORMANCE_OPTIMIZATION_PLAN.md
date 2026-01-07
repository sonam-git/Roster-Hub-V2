# Performance Optimization Plan

## Current Scores
- **Desktop:** 77/100
- **Mobile:** 55/100

## Critical Issues to Fix

### 1. Image Optimization (Est. savings: 67 KiB)
- Profile avatar is 900x883px but displayed at 48x49px
- Solution: Create optimized WebP versions with proper sizing

### 2. Font Loading (Est. savings: 150-600ms)
- Google Fonts blocking render
- Solution: Preconnect, font-display: swap, self-host critical fonts

### 3. Unused CSS (Est. savings: 24 KiB)
- 23.8 KiB unused CSS in main bundle
- Solution: PurgeCSS, critical CSS extraction

### 4. Unused JavaScript (Est. savings: 275 KiB)
- 200 KiB unused in main bundle
- 75 KiB unused in Google Sign-In
- Solution: Code splitting, lazy loading, tree shaking

### 5. Layout Shift (CLS: 0.22)
- Footer causing 0.216 shift
- Web fonts causing shifts
- Solution: Reserve space, font-display: optional

### 6. Contrast Issues (Accessibility)
- "Top Players", "Upcoming Games", "Post Now" buttons
- h4 heading hierarchy issue

## Implementation Priority
1. Quick wins (fonts, preconnect)
2. Image optimization
3. CSS/JS optimization
4. Layout shift fixes
5. Accessibility contrast fixes

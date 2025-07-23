# Traditional Chinese Study - Enhanced Design System

## 🎨 Overview

This document outlines the comprehensive design system for the Traditional Chinese Study application, which seamlessly blends traditional Chinese aesthetics with modern web design principles.

## 🌈 Color Palette

### Traditional Chinese Colors
Our color system is inspired by traditional Chinese colors with cultural significance:

- **朱红 (Vermillion Red)** `#E53E3E` - Primary brand color, represents prosperity and good fortune
- **翠绿 (Jade Green)** `#00A86B` - Secondary color, symbolizes harmony and growth
- **明黄 (Imperial Yellow)** `#FFD700` - Accent color, represents imperial power and wisdom
- **墨黑 (Ink Black)** `#1A202C` - Text color, symbolizes knowledge and depth
- **米白 (Rice White)** `#FFFEF7` - Background color, represents purity and simplicity
- **竹绿 (Bamboo Green)** `#7C9885` - Success color, symbolizes resilience and growth
- **梅紫 (Plum Purple)** `#8B5A96` - Info color, represents elegance and nobility
- **云灰 (Cloud Gray)** `#E2E8F0` - Border color, symbolizes tranquility

### Semantic Color System
```css
--primary-color: var(--color-vermillion);
--secondary-color: var(--color-jade-green);
--accent-color: var(--color-imperial-yellow);
--success-color: var(--color-bamboo-green);
--warning-color: #ED8936;
--danger-color: var(--color-vermillion);
--info-color: var(--color-plum-purple);
```

### WCAG AA Compliance
All color combinations meet WCAG AA accessibility standards:
- Normal text: 4.5:1 contrast ratio minimum
- Large text: 3.0:1 contrast ratio minimum
- Interactive elements: Clear focus indicators

## 📝 Typography System

### Font Families
- **Chinese Text**: `'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif`
- **Chinese Sans**: `'Noto Sans SC', 'Source Han Sans SC', 'PingFang SC', sans-serif`
- **English Text**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Monospace**: `'JetBrains Mono', 'Fira Code', 'Consolas', monospace`

### Typography Classes
- `.chinese-title` - Main headings with cultural styling
- `.chinese-text` - Body text with optimal Chinese character spacing
- `.chinese-calligraphy` - Decorative text with traditional aesthetics
- `.classical-text` - Formatted classical literature text
- `.hanzi-display` - Large character display for practice
- `.pinyin-text` - Pinyin annotation styling

### Font Scale
```css
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
--font-size-2xl: 1.5rem;    /* 24px */
--font-size-3xl: 1.875rem;  /* 30px */
--font-size-4xl: 2.25rem;   /* 36px */
--font-size-5xl: 3rem;      /* 48px */
--font-size-6xl: 3.75rem;   /* 60px */
```

## 🔘 Button System

### Button Variants
- `.btn-chinese.btn-primary` - Primary actions (vermillion gradient)
- `.btn-chinese.btn-secondary` - Secondary actions (jade green gradient)
- `.btn-chinese.btn-accent` - Accent actions (imperial yellow gradient)
- `.btn-chinese.btn-outline` - Outlined buttons
- `.btn-chinese.btn-ghost` - Minimal buttons

### Button Sizes
- `.btn-sm` - Small buttons (compact interfaces)
- Default - Standard size buttons
- `.btn-lg` - Large buttons (primary actions)
- `.btn-icon` - Icon-only buttons

### Button Features
- Gradient backgrounds with cultural colors
- Hover animations with shimmer effects
- Focus indicators for accessibility
- Disabled states with reduced opacity
- Icon support with proper spacing

## 🃏 Card System

### Card Variants
- `.card-chinese.card-classic` - For classical literature content
- `.card-chinese.card-practice` - For practice and interactive content
- `.card-chinese.card-progress` - For progress and statistics
- `.card-chinese.card-featured` - For highlighted content
- `.card-chinese.card-minimal` - For simple content display

### Card Components
- `.card-chinese-header` - Card header with title and subtitle
- `.card-chinese-body` - Main content area
- `.card-chinese-footer` - Action buttons and metadata
- `.card-difficulty-badge` - Difficulty level indicators
- `.card-stats` - Statistics display within cards

### Card Features
- Subtle shadows and borders
- Hover animations with elevation
- Cultural gradient accents
- Interactive states for clickable cards
- Responsive layout support

## 🎯 Interactive Components

### HanziWriter Container
```css
.hanzi-writer-container {
  /* Enhanced container for character writing practice */
  background: var(--surface-color);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-lg);
  /* Cultural pattern overlay */
}
```

### Pinyin Practice Interface
```css
.pinyin-practice-container {
  /* Styled container for pinyin learning */
  background: var(--surface-color);
  border-radius: var(--radius-xl);
  /* Purple accent for pinyin content */
}
```

### Stroke Animator
```css
.stroke-animator-container {
  /* Container for stroke animation display */
  background: linear-gradient(135deg, var(--surface-color), rgba(229, 62, 62, 0.01));
  /* Progress bar for stroke animation */
}
```

## 🎨 Design Tokens

### Spacing Scale
```css
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-2xl: 3rem;     /* 48px */
--spacing-3xl: 4rem;     /* 64px */
```

### Border Radius
```css
--radius-sm: 0.25rem;    /* 4px */
--radius-md: 0.5rem;     /* 8px */
--radius-lg: 0.75rem;    /* 12px */
--radius-xl: 1rem;       /* 16px */
--radius-full: 9999px;
```

### Shadows
```css
--shadow-sm: 0 1px 2px 0 rgba(26, 32, 44, 0.05);
--shadow-md: 0 4px 6px -1px rgba(26, 32, 44, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(26, 32, 44, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(26, 32, 44, 0.1);
```

### Transitions
```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
```

## 🌙 Dark Mode Support

### Automatic Detection
```css
@media (prefers-color-scheme: dark) {
  /* Automatic dark mode based on system preference */
}
```

### Manual Toggle
```css
[data-theme="dark"] {
  /* Manual dark mode toggle support */
}
```

### Dark Mode Colors
- Background: `#0F1419`
- Surface: `#1A202C`
- Text: Adjusted for proper contrast
- Shadows: Enhanced for dark backgrounds

## ♿ Accessibility Features

### Focus Management
- Visible focus indicators on all interactive elements
- Logical tab order throughout the application
- Skip links for keyboard navigation

### Color Contrast
- All text meets WCAG AA standards (4.5:1 minimum)
- Large text meets WCAG AA standards (3.0:1 minimum)
- Interactive elements have clear visual states

### Screen Reader Support
- Semantic HTML structure
- ARIA labels and landmarks
- Live regions for dynamic content
- Alternative text for images

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  /* Respects user's motion preferences */
  * { animation-duration: 0.01ms !important; }
}
```

## 📱 Responsive Design

### Breakpoints
- Mobile: `max-width: 768px`
- Tablet: `768px - 1200px`
- Desktop: `min-width: 1200px`

### Mobile Optimizations
- Touch-friendly button sizes (minimum 44px)
- Optimized font sizes for mobile reading
- Simplified layouts for small screens
- Swipe gestures for character navigation

## 🎭 Cultural Design Elements

### Traditional Patterns
- Subtle gradient overlays inspired by traditional art
- Cultural color combinations
- Traditional Chinese iconography (🏮🐉📚✍️🎵)

### Typography Harmony
- Balanced Chinese and English typography
- Proper character spacing for readability
- Cultural font choices that respect tradition

### Visual Hierarchy
- Clear information architecture
- Cultural color coding for different content types
- Consistent spacing and alignment

## 🚀 Performance Considerations

### CSS Optimization
- CSS custom properties for consistent theming
- Efficient animations using transform and opacity
- Minimal repaints and reflows

### Loading States
- Skeleton screens with shimmer effects
- Progressive enhancement
- Graceful degradation

## 📋 Usage Guidelines

### Implementation
1. Use CSS custom properties for consistent theming
2. Apply semantic classes for component styling
3. Follow the established spacing and typography scales
4. Ensure accessibility standards are met

### Best Practices
1. Test with real Chinese content
2. Verify color contrast ratios
3. Test keyboard navigation
4. Validate responsive behavior
5. Check dark mode compatibility

## 🔗 Resources

- [Design Showcase Page](/design-showcase) - Interactive demonstration
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Traditional Chinese Colors](https://en.wikipedia.org/wiki/Traditional_colors_of_China)
- [Chinese Typography Best Practices](https://www.w3.org/International/articles/typography/chinese.en)

---

**Design System Version**: 1.0.0  
**Last Updated**: 2024-07-20  
**Maintained by**: Traditional Chinese Study Team

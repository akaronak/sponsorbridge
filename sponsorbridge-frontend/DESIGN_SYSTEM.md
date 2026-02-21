# SponsorBridge Design System

## 🎨 Design Philosophy

SponsorBridge follows modern SaaS design principles inspired by Stripe, Notion, and Linear:
- **Minimal & Clean** - Remove unnecessary elements
- **Spacious** - Generous whitespace for breathing room
- **Professional** - Trust-building visual hierarchy
- **Accessible** - WCAG compliant, keyboard navigable
- **Responsive** - Mobile-first approach

---

## 🎯 Color Palette

### Primary Colors
- **Blue 600** (`#0284c7`) - Primary action, CTAs
- **Blue 700** (`#0369a1`) - Hover states, active states
- **Blue 50** (`#f0f9ff`) - Light backgrounds, hero sections

### Neutral Colors
- **Gray 900** (`#111827`) - Primary text
- **Gray 600** (`#4b5563`) - Secondary text
- **Gray 400** (`#9ca3af`) - Tertiary text, disabled states
- **Gray 50** (`#f9fafb`) - Light backgrounds
- **Gray 100** (`#f3f4f6`) - Borders, dividers

### Semantic Colors
- **Green 500** (`#10b981`) - Success, checkmarks
- **Red 500** (`#ef4444`) - Errors, destructive actions
- **Yellow 500** (`#eab308`) - Warnings

---

## 📐 Typography

### Font Family
- **Primary:** Inter (system-ui fallback)
- **Weight:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold), 900 (black)

### Font Sizes & Line Heights
```
Display (7xl): 72px / 80px
Display (6xl): 60px / 64px
Display (5xl): 48px / 52px
Heading (4xl): 36px / 40px
Heading (3xl): 30px / 36px
Heading (2xl): 24px / 32px
Heading (xl): 20px / 28px
Body (lg): 18px / 28px
Body (base): 16px / 24px
Body (sm): 14px / 20px
Caption (xs): 12px / 16px
```

### Usage Guidelines
- **Hero Headlines:** 5xl-7xl, bold (700-800)
- **Section Titles:** 3xl-4xl, bold (700)
- **Card Titles:** xl-2xl, semibold (600)
- **Body Text:** base-lg, regular (400)
- **Labels:** sm, semibold (600)
- **Captions:** xs, regular (400)

---

## 🔲 Spacing System

All spacing follows an 8px base unit:
```
0px   = 0
4px   = 1
8px   = 2
12px  = 3
16px  = 4
20px  = 5
24px  = 6
32px  = 8
40px  = 10
48px  = 12
64px  = 16
80px  = 20
96px  = 24
128px = 32
```

### Common Patterns
- **Section Padding:** py-20 (80px top/bottom)
- **Container Padding:** px-4 sm:px-6 lg:px-8
- **Card Padding:** p-8 (32px)
- **Gap Between Items:** gap-6 (24px) or gap-8 (32px)

---

## 🎛️ Components

### Buttons

#### Primary Button
```tsx
<button className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
  Action
</button>
```

#### Secondary Button
```tsx
<button className="px-8 py-4 border-2 border-gray-300 text-gray-900 font-semibold rounded-lg hover:border-gray-400 transition">
  Action
</button>
```

#### Button Sizes
- **Large:** px-8 py-4 (32px padding)
- **Medium:** px-6 py-3 (24px padding)
- **Small:** px-4 py-2 (16px padding)

### Cards

#### Feature Card
```tsx
<div className="p-8 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition">
  {/* Content */}
</div>
```

#### Company Logo Card
```tsx
<div className="flex items-center justify-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition border border-gray-200">
  {/* Logo */}
</div>
```

### Badges

#### Info Badge
```tsx
<span className="inline-block px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-semibold">
  Label
</span>
```

---

## 📱 Responsive Breakpoints

```
Mobile:  < 640px  (default)
Tablet:  640px+   (sm:)
Desktop: 768px+   (md:)
Large:   1024px+  (lg:)
XL:      1280px+  (xl:)
2XL:     1536px+  (2xl:)
```

### Mobile-First Approach
- Design for mobile first
- Use `sm:`, `md:`, `lg:` prefixes for larger screens
- Test on actual devices

---

## ✨ Animations & Transitions

### Hover Effects
```tsx
// Smooth color transition
className="hover:bg-blue-700 transition"

// Lift effect
className="hover:shadow-lg hover:-translate-y-1 transition"

// Icon animation
className="group-hover:translate-x-1 transition"
```

### Timing
- **Default:** 300ms ease
- **Fast:** 150ms ease
- **Slow:** 500ms ease

---

## 🎯 Layout Patterns

### Hero Section
```tsx
<section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
  <div className="max-w-4xl mx-auto text-center">
    {/* Content */}
  </div>
</section>
```

### Feature Grid
```tsx
<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
  {/* Cards */}
</div>
```

### Container
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>
```

---

## 🔍 Accessibility

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Focus states are visible (outline: 2px solid #0284c7)
- Tab order is logical

### Color Contrast
- Text on background: 4.5:1 minimum (WCAG AA)
- Large text: 3:1 minimum
- Icons with meaning have alt text

### Semantic HTML
- Use `<button>` for buttons, not `<div>`
- Use `<a>` for links
- Use proper heading hierarchy (h1, h2, h3)

---

## 📊 Company Logos Section

### Design Approach
- **Grid:** 2 columns (mobile), 3 columns (tablet), 5 columns (desktop)
- **Card Size:** 120px × 120px minimum
- **Background:** Gray-50 with hover effect
- **Border:** 1px gray-200, hover to gray-300
- **Spacing:** 24px gap between cards

### Logo Representation
- Use emoji/initials for demo
- Replace with actual logos in production
- Maintain consistent sizing
- Add subtle hover effects

---

## 🎨 Gradient Usage

### Primary Gradient
```css
background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
```

### Subtle Gradient
```css
background: linear-gradient(to-b, #f0f9ff, #ffffff);
```

### Text Gradient
```css
background: linear-gradient(to-r, #0284c7, #0369a1);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

---

## 📋 Best Practices

### Do's ✅
- Use consistent spacing (multiples of 8px)
- Maintain color hierarchy
- Keep typography consistent
- Use whitespace effectively
- Test on multiple devices
- Use semantic HTML
- Provide focus states
- Use descriptive alt text

### Don'ts ❌
- Don't mix font families
- Don't use too many colors
- Don't crowd content
- Don't forget mobile
- Don't use auto-playing videos
- Don't use low contrast text
- Don't ignore accessibility
- Don't use outdated patterns

---

## 🚀 Performance

### Image Optimization
- Use WebP format when possible
- Lazy load images below the fold
- Optimize SVGs
- Use appropriate sizes

### CSS
- Tailwind CSS is already optimized
- Purges unused styles in production
- Minimal CSS output

### JavaScript
- React with Vite for fast builds
- Code splitting for routes
- Lazy load components

---

## 📚 Resources

- [Tailwind CSS Docs](https://tailwindcss.com)
- [Inter Font](https://rsms.me/inter/)
- [Lucide Icons](https://lucide.dev)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 🔄 Version History

- **v1.0** - Initial design system
  - Color palette
  - Typography scale
  - Spacing system
  - Component patterns
  - Responsive guidelines

---

**Last Updated:** February 16, 2026
**Status:** Active

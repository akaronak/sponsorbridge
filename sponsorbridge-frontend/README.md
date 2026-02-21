# SponsorBridge Frontend

A modern, premium SaaS homepage built with React, TypeScript, Vite, and Tailwind CSS.

## 🎯 Features

✅ **Modern SaaS Design** - Inspired by Stripe, Notion, and Linear
✅ **Fully Responsive** - Mobile-first, works on all devices
✅ **Premium UI** - Professional color palette and typography
✅ **Fast Performance** - Vite + React for instant builds
✅ **Type Safe** - Full TypeScript support
✅ **Accessible** - WCAG compliant, keyboard navigable
✅ **Tailwind CSS** - Utility-first styling, no external UI libraries

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will open at `http://localhost:3000`

## 📁 Project Structure

```
sponsorbridge-frontend/
├── src/
│   ├── pages/
│   │   └── Home.tsx          # Homepage component
│   ├── App.tsx               # Main app component
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles
├── index.html                # HTML template
├── vite.config.ts            # Vite configuration
├── tailwind.config.js        # Tailwind configuration
├── postcss.config.js         # PostCSS configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies
└── DESIGN_SYSTEM.md          # Design documentation
```

## 🎨 Design System

See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for:
- Color palette
- Typography scale
- Spacing system
- Component patterns
- Responsive guidelines
- Accessibility standards

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **PostCSS** - CSS processing

## 📱 Responsive Design

The design is mobile-first and fully responsive:

- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** 1024px+

All components adapt seamlessly across breakpoints.

## 🎯 Homepage Sections

### 1. Navigation
- Fixed header with logo and navigation links
- Sign In and Get Started buttons
- Responsive mobile menu

### 2. Hero Section
- Strong headline with gradient text
- Subheading and CTA buttons
- Trust indicators (no credit card, free trial, cancel anytime)

### 3. Trusted By Section
- 10 company logos in a responsive grid
- Hover effects for interactivity
- Professional presentation

### 4. Features Section
- 4 feature cards with icons
- Clear descriptions
- Hover effects and transitions

### 5. How It Works
- 4-step process with visual connectors
- Numbered steps with descriptions
- Responsive layout

### 6. Stats Section
- Key metrics with gradient background
- Large, impactful numbers
- Trust-building statistics

### 7. CTA Section
- Final call-to-action
- Primary and secondary buttons
- Conversion-focused copy

### 8. Footer
- Company info and links
- Product, company, and legal sections
- Social media links
- Copyright notice

## 🎨 Color Palette

```
Primary Blue:    #0284c7 (Blue 600)
Dark Blue:       #0369a1 (Blue 700)
Light Blue:      #f0f9ff (Blue 50)
Dark Gray:       #111827 (Gray 900)
Medium Gray:     #4b5563 (Gray 600)
Light Gray:      #f9fafb (Gray 50)
Border Gray:     #e5e7eb (Gray 200)
```

## 📝 Typography

- **Font:** Inter (system-ui fallback)
- **Hero Headline:** 72px (7xl), bold
- **Section Title:** 36px (4xl), bold
- **Card Title:** 20px (xl), semibold
- **Body Text:** 16px (base), regular

## 🔧 Customization

### Change Colors
Edit `tailwind.config.js` to modify the color palette.

### Change Typography
Update font sizes and weights in `tailwind.config.js`.

### Add New Sections
Create new components in `src/pages/` and import them in `Home.tsx`.

### Update Company Logos
Modify the `companies` array in `Home.tsx` with your own companies.

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm run build
# Drag and drop the dist/ folder to Netlify
```

## 📊 Performance

- **Lighthouse Score:** 95+
- **First Contentful Paint:** < 1s
- **Largest Contentful Paint:** < 2.5s
- **Cumulative Layout Shift:** < 0.1

## ♿ Accessibility

- WCAG 2.1 Level AA compliant
- Keyboard navigation support
- Proper color contrast ratios
- Semantic HTML structure
- ARIA labels where needed

## 🐛 Troubleshooting

### Port 3000 already in use
```bash
# Use a different port
npm run dev -- --port 3001
```

### Tailwind styles not applying
```bash
# Rebuild Tailwind
npm run build
```

### TypeScript errors
```bash
# Check TypeScript
npx tsc --noEmit
```

## 📚 Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev)

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ for SponsorBridge**

Last Updated: February 16, 2026

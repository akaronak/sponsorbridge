# Premium Hero Section - Advanced Customization Guide

## Architecture Deep Dive

### Animation Pipeline

```
User InteractionEvent
├── Mouse Movement
│   ├── Track cursor position (20 events/sec)
│   ├── Calculate parallax offset
│   └── Animate: gradient blobs, card tilt
├── Scroll
│   ├── Track scroll distance
│   ├── Calculate parallax multiplier
│   └── Animate: card y-position
└── Page Load
    ├── Trigger headline stagger
    ├── Animate subtext
    ├── Slide CTA buttons
    └── Fade card entrance
```

### Component Hierarchy

```
Home.tsx
└── PremiumHero (full viewport, z-10)
    ├── Background Layer (z-0)
    │   ├── Gradient Blob 1 (animated, 20s cycle)
    │   ├── Gradient Blob 2 (animated, 25s cycle)
    │   └── Grid Overlay (static, 5% opacity)
    ├── Floating Cards Layer (z-1)
    │   ├── FloatingCard (pos: top 10%, left 5%)
    │   ├── FloatingCard (pos: top 50%, right 8%)
    │   └── FloatingCard (pos: bottom 15%, left 8%)
    └── Content Layer (z-10)
        ├── Headline (staggered words)
        ├── Subtext (fade + slide)
        ├── CTA Container (slide up)
        └── Social Proof (static)
```

---

## Animation Timing Reference

### Entry Animations Timeline

```javascript
GSAP Timeline (on mount):

0.0s ─────────── Word "Where" appears (opacity 0→1, y: 30→0)
0.1s ─────────── Word "College" appears
0.2s ─────────── Word "Events" appears
0.3s ─────────── Word "Meet" appears
0.4s ───────┬─── Word "Serious" appears
0.5s       │     Word "Sponsors" appears
0.4s ──────┤     Subtext starts (parallel, fade 0→1, y: 20→0)
0.6s ──────┼──── CTA buttons appear (fade 0→1, y: 20→0)
0.2s ──────┼──── Card 1 entrance (opacity 0→1, y: 50→0)
0.3s ──────┼──── Card 2 entrance
0.4s ──────┴──── Card 3 entrance

Duration: 1.2s total to fully render hero
```

**Visual timing curve:**
```
Opacity: ▁▂▃▄▅▆▇█  (ease: power3.out)
Y-position: ↓↓↓↓↓  (ease: power3.out)
```

### Looping Animations (Infinite)

#### Gradient Blob 1 Animation

```javascript
gsap.to(gradient1Ref.current, {
  x: 100,           // Move right 100px
  y: 50,            // Move down 50px
  duration: 20,     // 20 seconds complete cycle
  repeat: -1,       // Loop forever
  yoyo: true,       // Go backwards after reaching end
  ease: 'sine.inOut' // Smooth S-curve
});

// Total cycle time: 40s (20s forward + 20s backward)
```

**Breath Pattern:**
```
Cycle A (0-20s):  Blob moves to (100, 50) ↘
Cycle B (20-40s): Blob moves back to (0, 0) ↖
Repeat forever
```

#### Gradient Blob 2 Animation

```javascript
gsap.to(gradient2Ref.current, {
  x: -100,          // Move left 100px
  y: -50,           // Move up 50px
  duration: 25,     // Offset from Blob 1 for variety
  repeat: -1,
  yoyo: true,
  ease: 'sine.inOut'
});

// Total cycle time: 50s (opposite direction)
```

#### Card Floating Animation

```javascript
gsap.to(cardRef.current, {
  y: 20,                    // Move up 20px
  duration: 3 + delay,      // 3-4 seconds depending on card
  repeat: -1,               // Loop forever
  yoyo: true,               // Go up, then down
  ease: 'sine.inOut'        // Smooth breathing
});

// Card 1: duration 3.2s (delay 0.2)
// Card 2: duration 3.3s (delay 0.3)
// Card 3: duration 3.4s (delay 0.4)
// = Staggered floating creates organic motion
```

---

## GSAP Animation Options Explained

### Common GSAP Properties

```typescript
gsap.to(element, {
  // POSITION
  x: 100,                   // Move horizontally (pixels)
  y: 50,                    // Move vertically
  rotation: 45,             // Rotate (degrees)
  rotationX: 10,            // 3D rotation X axis
  rotationY: 15,            // 3D rotation Y axis
  
  // SIZE & OPACITY
  scale: 1.1,               // Scale (1 = 100%)
  opacity: 0.5,             // Transparency (0-1)
  
  // TIMING
  duration: 0.6,            // Seconds
  delay: 0.2,               // Wait before starting
  stagger: 0.1,             // Delay between iterations
  
  // EASING (feel)
  ease: 'power3.out',       // Common: power1/2/3, back, elastic
  
  // CONTROL
  repeat: -1,               // -1 = infinite, 0 = once
  yoyo: true,               // Reverse after playing
  
  // OPTIMIZATION
  overwrite: 'auto',        // Don't stack animations
  
  // 3D
  transformPerspective: 1200, // Camera distance (px)
  transformStyle: 'preserve-3d' // Enable 3D
});
```

### Easing Curves Reference

```
power1.out  ╔═════       (fast start, slow end)
power2.out  ╔══════      (faster start)
power3.out  ╔═══════     (fastest start) ← USED IN HERO
power4.out  ╔════════    (extreme start)

back.out    ╔════╴       (slight overshoot)
elastic.out ╔═╱╲╱╲      (bouncy)

sine.inOut  ╱═══════╲    (smooth S-curve) ← USED FOR FLOATING
```

---

## Parallax Mechanics

### Mouse Parallax: Step by Step

```typescript
// Step 1: Capture mouse position
const handleMouseMove = (e: MouseEvent) => {
  const rect = container.getBoundingClientRect();
  
  // Step 2: Normalize to -0.5 to +0.5
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;
  
  // Step 3: Store for card component
  setMousePos({ x: x * 20, y: y * 20 });
  // x range: -10 to +10
  // y range: -10 to +10
}

// Step 4: Apply to gradient blobs
gsap.to(gradient1Ref.current, {
  x: 100 + x * 10,  // Base position + mouse influence
  y: 50 + y * 10,
  duration: 0.8,
  overwrite: 'auto' // Don't stack with infinite animation
});
```

**Visual explanation:**
```
Mouse at (0%, 0%)       Mouse at (50%, 50%)     Mouse at (100%, 100%)
Gradient at (0, 0)      Gradient at (10, 10)    Gradient at (20, 20)

Cursor influence: ±10px per blob, ±8°-10° per card
Response time: 0.8 seconds (smooth, not instant)
```

### Scroll Parallax: Step by Step

```typescript
const handleScroll = () => {
  const scrollY = window.scrollY;
  
  // Move card up proportionally to scroll
  gsap.to(card, {
    y: scrollY * 0.3,
    //   ↑ parallax multiplier
    // 0.1 = moves 1/10 as fast as page scroll (very subtle)
    // 0.3 = moves 3/10 as fast (moderate)
    // 0.5 = moves 1/2 as fast (strong, cinematic)
    duration: 0.5,
    overwrite: 'auto'
  });
}
```

**Example motion:**
```
Page position: 0px → 100px → 200px → 300px
Card movement: 0px → 30px → 60px → 90px

Result: Camera illusion. Cards appear to be in foreground
        getting pushed up relative to background.
```

---

## Performance Optimization Techniques

### Memory Efficient Animations

✅ **DO THIS:**

```typescript
// Use gsap.context() for automatic cleanup
const ctx = gsap.context(() => {
  gsap.to(element, { delay: 0.2, ... });
  gsap.fromTo(other, { ... }, { ... });
  // All animations cleaned up on unmount
}, componentRef);

useEffect(() => {
  return () => ctx.revert(); // ← CRITICAL
}, []);
```

❌ **DON'T DO THIS:**

```typescript
// Animations leak memory
gsap.to(element, { delay: 0.2, ... });

// Or creating new GSAP instances repeatedly
window.addEventListener('scroll', () => {
  gsap.to(card, { y: scrollY }); // ← Creates new animation each frame!
});
```

### GPU Acceleration

✅ **Properties that use GPU:**
- `transform: translate()` (x, y, z)
- `transform: scale()`
- `transform: rotate()`
- `opacity`
- `filter: blur()`

❌ **Properties that DON'T use GPU (slow):**
- `top`, `left`, `width`, `height` (layout recalculation)
- `box-shadow` (complex rendering)
- `text-shadow`

**Our implementation uses:**
```typescript
// GPU: Fast
gsap.to(element, { x: 100, y: 50, opacity: 0.5 });

// NOT GPU: Avoid
gsap.to(element, { left: '100px', top: '50px' });
```

### Event Listener Optimization

```typescript
// ❌ Inefficient: Event fires 60+ times/sec
window.addEventListener('mousemove', (e) => {
  gsap.to(element, { x: e.clientX }); // Creates new animation each time!
});

// ✅ Efficient: Store position, animate separately
const [pos, setPos] = useState({ x: 0, y: 0 });
const animRef = useRef();

window.addEventListener('mousemove', (e) => {
  setPos({ x: e.clientX, y: e.clientY }); // Update state
});

useEffect(() => {
  // Animate to new position when state changes
  gsap.to(animRef.current, {
    x: pos.x,
    y: pos.y,
    duration: 0.8,
    overwrite: 'auto' // Don't create new animations
  });
}, [pos]);
```

---

## 3D Depth Effects

### Perspective Stacking

```typescript
// Layer 1: Far background (moves slowly)
<div style={{ transform: 'translateZ(-1000px)' }}>
  {/* Gradient blobs */}
</div>

// Layer 2: Mid-ground (floating cards)
<div style={{ transformPerspective: '1200px' }}>
  <div style={{ rotationX: 5, rotationY: 10 }}>
    {/* Cards with 3D tilt */}
  </div>
</div>

// Layer 3: Foreground (text)
<div style={{ transform: 'translateZ(100px)' }}>
  {/* Headline, CTA, etc */}
</div>
```

### CSS 3D Properties

```css
/* Enable 3D space */
.container {
  perspective: 1200px;      /* Camera distance from screen */
  transform-style: preserve-3d; /* Allow child 3D transforms */
}

.card {
  /* 3D rotation */
  transform: rotationX(5deg) rotationY(10deg);
  
  /* Depth inside container */
  transform: translateZ(50px); /* Move towards camera */
  
  /* 3D transforms */
  backface-visibility: hidden; /* Hide back of element (optimization) */
}
```

---

## Color & Styling Deep Dive

### Gradient Animation

```typescript
// Static gradient (doesn't animate)
const staticGradient = 'linear-gradient(135deg, #4f46e5, #2563eb)';

// Animated gradient (CSS animation)
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.animated {
  background: 'linear-gradient(135deg, #4f46e5, #2563eb)';
  background-size: 200% 200%;
  animation: gradientShift 3s ease infinite;
}

// Better: GSAP gradient animation
gsap.to('.gradient-text', {
  backgroundPosition: '100% 50%',
  duration: 3,
  repeat: -1,
  yoyo: true,
  ease: 'sine.inOut'
});
```

### Glassmorphism Breakdown

```css
/* Technique: Frosted glass effect */
.card {
  /* 1. Semi-transparent background */
  background: rgba(255, 255, 255, 0.05);
  
  /* 2. Blur the backdrop (GPU intensive) */
  backdrop-filter: blur(16px);
  
  /* 3. Border with transparency */
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  /* 4. Subtle shadow for depth */
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

/* On hover: Increase glow */
.card:hover {
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.5);
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.2);
}
```

### Glow Blob Mathematics

```typescript
// Radial gradient = circular fade
<div style={{
  background: 'radial-gradient(
    circle at 50% 50%,           // Center point
    rgba(99, 102, 241, 0.5),     // Inner color (opaque)
    transparent 70%              // Fade to transparent at 70% radius
  )',
  borderRadius: '50%',            // Make it circular
  filter: 'blur(100px)',          // Gaussian blur
  opacity: 0.4                    // Overall transparency
}} />

// Result: Soft, diffuse glow without hard edges
```

---

## Responsive Considerations

### Mobile-Specific Issues

```typescript
// Problem: Touch devices don't have "hover"
// Solution: Check for touch capability

const isTouchDevice = () => {
  return (('ontouchstart' in window) ||
          (navigator.maxTouchPoints > 0) ||
          (navigator.msMaxTouchPoints > 0));
};

// Disable tilt effect on mobile
{!isTouchDevice() && (
  <FloatingCard mouseX={mousePos.x} mouseY={mousePos.y} ... />
)}

// Or reduce effect on mobile
if (isTouchDevice()) {
  const rotateX = (mouseY / 20);  // Less rotation on mobile
  const rotateY = (mouseX / 20);
}
```

### Viewport-Specific Scaling

```typescript
// Get viewport dimensions
const vw = window.innerWidth;  // viewport width
const vh = window.innerHeight; // viewport height

// Scale based on viewport
const cardPosition = {
  top: `${10 + (vw > 1024 ? 0 : 5)}%`,  // Adjust for smaller screens
  left: `${5 + (vw > 768 ? 0 : 10)}%`
};

// Reduce animation speed on slower devices
const getAnimationSpeed = () => {
  const cores = navigator.hardwareConcurrency || 2;
  return cores > 4 ? 0.8 : 1.2;  // Slower on weak devices
};
```

---

## Debugging & Testing

### Check Animation Performance

```javascript
// In browser console
// 1. Check FPS
gsap.ticker.fps()  // Returns frames per second

// 2. List all active animations
gsap.timeline().getChildren()  // All running tweens

// 3. Pause all animations
gsap.globalTimeline.pause()

// 4. Resume
gsap.globalTimeline.play()

// 5. Check memory
performance.memory  // Chrome DevTools memory usage
```

### Visual Debugging

```typescript
// Add visual guides to see parallax
<div style={{
  position: 'fixed',
  top: '50px',
  left: '10px',
  fontSize: '12px',
  color: 'lime',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  padding: '10px',
  fontFamily: 'monospace',
  zIndex: 999
}}>
  Mouse: {mousePos.x.toFixed(1)}, {mousePos.y.toFixed(1)}
  Scroll: {scrollY}
  FPS: {fps}
</div>
```

---

## Advanced Customization Examples

### Example 1: Magnetic Buttons

```typescript
// CTA button follows cursor slightly
const buttonRef = useRef<HTMLButtonElement>(null);

const handleMouseMove = (e: MouseEvent) => {
  if (!buttonRef.current) return;
  
  const rect = buttonRef.current.getBoundingClientRect();
  const x = e.clientX - (rect.left + rect.width / 2);
  const y = e.clientY - (rect.top + rect.height / 2);
  const magnitude = Math.sqrt(x * x + y * y);
  
  // Only magnetize if close enough
  if (magnitude < 100) {
    gsap.to(buttonRef.current, {
      x: x * 0.2,
      y: y * 0.2,
      duration: 0.3
    });
  }
};
```

### Example 2: Reveal Text on Scroll

```typescript
// Headlines appear as user scrolls into view
const observerCallback = (entries: IntersectionObserverEntry[]) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Start animation when element enters viewport
      gsap.to(entry.target, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out'
      });
    }
  });
};

const observer = new IntersectionObserver(observerCallback);
observer.observe(headlineRef.current);
```

### Example 3: Parallax Depth Layers

```typescript
// Multiple layers move at different speeds
useEffect(() => {
  window.addEventListener('scroll', () => {
    gsap.to(layer1, { y: scrollY * 0.3 }); // Slow
    gsap.to(layer2, { y: scrollY * 0.5 }); // Medium
    gsap.to(layer3, { y: scrollY * 0.8 }); // Fast
  });
}, []);
```

---

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| GSAP | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| CSS 3D | ✅ 12+ | ✅ 10+ | ✅ 4+ | ✅ 12+ |
| backdrop-filter | ✅ 76+ | ❌ No | ✅ 9+ | ✅ 79+ |
| perspective | ✅ Full | ✅ Full | ✅ Full | ✅ Full |

**Fallback for unsupported:**
```typescript
if (!CSS.supports('backdrop-filter', 'blur(10px)')) {
  // Use solid background instead of glassmorphism
  element.style.background = 'rgba(0, 0, 0, 0.5)';
}
```

---

## Conclusion

This hero section demonstrates enterprise-grade motion design. Key principles:

✅ **Purpose-driven** - Every animation serves UX  
✅ **Optimized** - 60fps on standard devices  
✅ **Accessible** - No motion that causes discomfort  
✅ **Customizable** - Easy to adjust colors, timing, positioning  
✅ **Professional** - Inspired by YC-backed SaaS leaders  

For questions or customization needs, refer to the full documentation or GSAP guides.

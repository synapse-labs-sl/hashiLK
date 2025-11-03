# Hashi.lk Design System
## "Bridge of Opportunity" Visual Identity

---

## 🌉 Core Concept

The design system embodies the "Bridge of Opportunity" theme - representing Hashi.lk's role as a connector between buyers and sellers, products and services across Sri Lanka. Every visual element subtly references bridges, connection, and growth.

---

## 🎨 Visual Identity

### Logo & Icon

**Bridge Icon:**
- Two interlocking "H" shapes forming a bridge arch
- Subtle Gokkola weave pattern as abstract texture in the lines
- Upward curve suggesting growth and aspiration
- Foundation dots representing stability and trust

**Logotype:**
- Font: Montserrat (bold for "Hashi", light for ".lk")
- The "H" in "Hashi" visually aligns with the bridge icon
- ".lk" appears smaller and lighter in weight
- Maintains brand consistency across all touchpoints

### Color Palette

**Primary - Ocean Blue**
- Default: `#0B4F6C` - Deep, professional blue
- Light: `#1A6B8A` - Hover states, lighter elements
- Dark: `#053B52` - Headers, emphasis
- Represents: Trust, reliability, depth

**Accent - Burnt Orange**
- Default: `#D97706` - Warm, energetic orange
- Light: `#F59E0B` - Highlights, CTAs
- Dark: `#B45309` - Pressed states
- Represents: Energy, creativity, Sri Lankan spice heritage

**Secondary - Emerald Green**
- Default: `#059669` - Fresh, vibrant green
- Light: `#10B981` - Success states
- Dark: `#047857` - Active states
- Represents: Growth, local relevance, prosperity

**Monochrome Variants:**
- Fully legible black and white versions available
- Maintains accessibility standards (WCAG AA)

---

## 📐 UI Principles

### Layout & Structure
- **Simple & Elegant:** Clean layouts with ample whitespace
- **Modern:** Contemporary design patterns
- **Scalable:** Responsive from mobile to desktop
- **Readable:** Clear typography hierarchy

### Typography

**Font Family:** Montserrat (primary), Lato, Open Sans (fallbacks)

**Hierarchy:**
- H1: 3.5rem (56px) - Bold - Page titles
- H2: 2.5rem (40px) - Bold - Section headers
- H3: 1.5rem (24px) - Semibold - Card titles
- Body: 1rem (16px) - Regular - Content
- Small: 0.875rem (14px) - Regular - Captions

**Weights:**
- 300 (Light) - Subtitles, secondary text
- 400 (Regular) - Body text
- 500 (Medium) - Emphasized text
- 600 (Semibold) - Subheadings
- 700 (Bold) - Headings
- 800 (Extrabold) - Hero text

### Components

#### Buttons

**Primary Button:**
```css
- Background: Ocean Blue gradient
- Rounded: Full (pill shape)
- Padding: 1rem 2rem
- Shadow: Bridge shadow (soft, elevated)
- Hover: Lifts up (-translate-y), enhanced shadow
- Transition: 300ms smooth
```

**Accent Button:**
```css
- Background: Burnt Orange
- Same styling as primary
- Used for CTAs, important actions
```

**Outline Button:**
```css
- Border: 2px Ocean Blue
- Background: Transparent → Blue on hover
- Text color inverts on hover
```

#### Cards

**Standard Card:**
```css
- Background: White
- Border radius: 1rem (rounded-2xl)
- Shadow: Bridge shadow
- Hover: Enhanced shadow, slight lift
- Transition: 300ms all properties
```

**Bridge Card:**
```css
- Rounded top: 1.5rem
- Top border: 1px gradient (Primary → Accent → Emerald)
- Represents bridge deck
- Used for featured content
```

#### Forms

**Input Fields:**
```css
- Border: 2px gray-200
- Border radius: 0.75rem (rounded-xl)
- Focus: Primary border + ring
- Padding: 0.75rem 1rem
- Transition: 300ms
```

### Animations & Transitions

**Bridge Curve Animation:**
- Smooth bezier curves (ease-in-out)
- 300ms duration standard
- Hover states: Scale (1.05-1.1), translate-y (-2px to -4px)

**Loading States:**
- Pulse animation for skeletons
- Fade-in for content appearance

### Navigation

**Navbar:**
- Sticky positioning
- Gradient background (Primary dark → Primary → Primary light)
- Bridge shadow for depth
- Language switcher with rounded pills
- Hover effects with underline animation

**Nav Links:**
```css
- Relative positioning
- After pseudo-element for underline
- Width: 0 → 100% on hover
- Accent color underline
- 300ms transition
```

### Local Motifs

**Gokkola Weave Pattern:**
- Subtle background texture
- 3% opacity
- Diamond/lattice pattern
- Applied to sections for cultural identity
- Non-intrusive, adds depth

**Bridge Arches:**
- SVG curves in hero sections
- Clip-path for decorative elements
- Represents connection and flow

---

## 🎯 Component Library

### Hero Section
- Gradient background (Primary colors)
- Decorative bridge arch (SVG)
- Large search bar with rounded corners
- Toggle buttons for Products/Services
- Bottom bridge curve transition

### Category Cards
- Icon/emoji at top
- Hover: Icon scales (1.25x)
- Text color changes to Primary/Accent
- Bridge card styling
- Cursor pointer

### Product/Service Cards
- Image with zoom on hover
- Rounded corners (xl)
- Badge overlays (condition, category)
- Price in large, bold text
- Location indicator
- Bridge card with gradient top border

### Footer
- Gradient background (Primary dark → Primary)
- Gokkola pattern background
- Logo with bridge icon
- Multi-column layout
- Accent color for section headers
- Subtle divider line

---

## 📱 Responsiveness

**Mobile-First Approach:**
- Base styles for mobile (320px+)
- Breakpoints:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px

**Scaling:**
- Grid columns: 1 → 2 → 3 → 4
- Font sizes scale proportionally
- Touch-friendly targets (min 44px)
- Hamburger menu on mobile

---

## ♿ Accessibility

**Standards:**
- WCAG 2.1 AA compliance
- Color contrast ratios: 4.5:1 minimum
- Focus indicators on all interactive elements
- Semantic HTML structure
- Alt text for all images
- Keyboard navigation support

**Focus States:**
- Ring: 2px Primary color
- Offset: 2px
- Visible on all interactive elements

---

## 🎨 Design Tokens

```javascript
colors: {
  primary: {
    DEFAULT: '#0B4F6C',
    light: '#1A6B8A',
    dark: '#053B52'
  },
  accent: {
    DEFAULT: '#D97706',
    light: '#F59E0B',
    dark: '#B45309'
  },
  emerald: {
    DEFAULT: '#059669',
    light: '#10B981',
    dark: '#047857'
  }
}

shadows: {
  bridge: '0 4px 20px rgba(11, 79, 108, 0.15)',
  hover: '0 8px 30px rgba(11, 79, 108, 0.25)'
}

borderRadius: {
  bridge: '0 0 50% 50%',
  arch: '50% 50% 0 0'
}
```

---

## 🌟 Brand Promise

The design system visually supports Hashi.lk's brand promise:
- **Trust:** Ocean blue, professional aesthetics
- **Connection:** Bridge motifs throughout
- **Growth:** Upward curves, vibrant accents
- **Local Identity:** Gokkola patterns, Sri Lankan colors
- **Modern:** Clean, contemporary design
- **Accessible:** Inclusive, readable, usable by all

---

## 📋 Usage Guidelines

1. **Always use the bridge logo** with proper spacing
2. **Maintain color consistency** - don't create new color variants
3. **Use Montserrat font** for all text
4. **Apply Gokkola pattern** subtly in backgrounds
5. **Implement smooth transitions** (300ms standard)
6. **Ensure accessibility** in all implementations
7. **Test on mobile first** before desktop
8. **Use bridge metaphors** in copy and visuals

---

## 🚀 Implementation

All design tokens are configured in:
- `client/tailwind.config.js` - Tailwind configuration
- `client/src/index.css` - Custom CSS classes
- `client/src/components/BridgeLogo.jsx` - Logo component

Reusable components:
- `BridgeLogo` - Brand logo
- `ProductCard` - Product display
- `ServiceCard` - Service display
- `Navbar` - Navigation header
- `Footer` - Site footer

---

*This design system embodies the spirit of Hashi.lk - bridging opportunities, connecting communities, and building trust across Sri Lanka.*

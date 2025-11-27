# UI Style Guide - A Voxel Christmas

## Design Philosophy

The UI follows a **winter wonderland aesthetic** with:
- **Dark, translucent backgrounds** with backdrop blur for depth
- **Cool color palette** (blues, whites, light grays)
- **Subtle glow effects** for magical winter atmosphere
- **Smooth transitions** and hover states
- **Consistent spacing and typography**

---

## Color Palette

### Primary Colors
- **Background Dark**: `rgba(5, 5, 16, 0.95)` - Main dark background
- **Background Gradient**: `linear-gradient(135deg, rgba(5, 5, 16, 0.95) 0%, rgba(20, 30, 50, 0.98) 100%)`
- **Text Primary**: `#fff` (white)
- **Text Secondary**: `#aaddff` (light blue)
- **Text Tertiary**: `#aaa` (light gray)
- **Text Disabled**: `#666` (medium gray)

### Accent Colors
- **Primary Accent**: `rgba(200, 220, 255, 0.3)` - Light blue glow
- **Secondary Accent**: `rgba(150, 200, 255, 0.2)` - Deeper blue
- **Warning/Quit**: `rgba(255, 50, 50, 0.2)` - Red tint for destructive actions
- **Border Standard**: `rgba(255, 255, 255, 0.2)` - Subtle white border
- **Border Highlight**: `rgba(255, 255, 255, 0.4)` - Brighter border for active states

---

## Button Types

### 1. Primary Action Button (Play Button / Splash Button)

**Use Case**: Main call-to-action buttons that require user attention.

**Base Styles**:
```css
background: linear-gradient(135deg, rgba(200, 220, 255, 0.2) 0%, rgba(150, 200, 255, 0.3) 100%);
border: 2px solid rgba(255, 255, 255, 0.3);
color: #fff;
padding: 15px 40px;
font-size: 1.1rem;
border-radius: 12px;
cursor: pointer;
font-weight: 600;
letter-spacing: 1px;
backdrop-filter: blur(10px);
transition: all 0.3s ease;
```

**Hover State**:
```css
background: linear-gradient(135deg, rgba(200, 220, 255, 0.3) 0%, rgba(150, 200, 255, 0.4) 100%);
border-color: rgba(255, 255, 255, 0.5);
transform: translateY(-2px);
box-shadow: 0 4px 20px rgba(150, 200, 255, 0.3);
```

**Active State**:
```css
transform: translateY(0);
```

**Special Effects** (for Play Button):
- Multiple box-shadows for glow: `0 0 20px rgba(200, 220, 255, 0.6), 0 0 40px rgba(150, 200, 255, 0.4), 0 0 60px rgba(200, 220, 255, 0.2)`
- Text shadow: `0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(200, 220, 255, 0.6)`
- Optional: Pulsing glow animation (`snowGlow` keyframes)
- Optional: Decorative snowflake emojis in pseudo-elements

---

### 2. Secondary UI Button (`.ui-btn`)

**Use Case**: Standard UI controls (Hide UI, Fullscreen, etc.)

**Base Styles**:
```css
background: rgba(255, 255, 255, 0.1);
color: white;
border: 1px solid rgba(255, 255, 255, 0.2);
padding: 10px 20px;
border-radius: 8px;
cursor: pointer;
font-size: 0.9rem;
transition: background 0.2s;
backdrop-filter: blur(4px);
```

**Hover State**:
```css
background: rgba(255, 255, 255, 0.2);
```

**Disabled State**:
```css
pointer-events: none;
cursor: default;
opacity: 0;
```

---

### 3. Menu Button (`.menu-btn`)

**Use Case**: Menu items in title screen (Settings, About, etc.)

**Base Styles**:
```css
background: rgba(20, 20, 30, 0.6);
border: 1px solid #444;
color: #666;
padding: 15px 0;
font-size: 1rem;
letter-spacing: 2px;
text-transform: uppercase;
backdrop-filter: blur(4px);
cursor: not-allowed;
border-radius: 4px;
transition: all 0.3s;
```

**Note**: Menu buttons are typically disabled. Only the Play button should be interactive.

---

### 4. Destructive Action Button (Quit Button)

**Use Case**: Actions that close/exit the application

**Base Styles** (extends `.ui-btn`):
```css
background: rgba(255, 50, 50, 0.2);
border-color: rgba(255, 100, 100, 0.4);
```

**Hover State**:
```css
background: rgba(255, 50, 50, 0.4);
border-color: rgba(255, 100, 100, 0.6);
```

---

### 5. Close Button (`.close-btn`)

**Use Case**: Close buttons in panels/modals

**Base Styles**:
```css
background: transparent;
border: none;
color: #aaa;
font-size: 2rem;
line-height: 1;
cursor: pointer;
padding: 0;
width: 30px;
height: 30px;
display: flex;
align-items: center;
justify-content: center;
border-radius: 4px;
transition: all 0.2s;
```

**Hover State**:
```css
color: #fff;
background: rgba(255, 255, 255, 0.1);
```

---

### 6. Toggle Button (Tech Toggle)

**Use Case**: Toggle buttons for panels/info displays

**Base Styles**:
```css
background: rgba(255, 255, 255, 0.1);
color: white;
border: 1px solid rgba(255, 255, 255, 0.2);
padding: 8px 15px;
border-radius: 8px;
cursor: pointer;
font-size: 0.85rem;
transition: background 0.2s;
backdrop-filter: blur(4px);
```

**Hover State**:
```css
background: rgba(255, 255, 255, 0.2);
```

---

## Panel Styling

### Panel Container

**Base Styles**:
```css
background: rgba(5, 5, 16, 0.95);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.2);
border-radius: 12px;
box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
padding: 0;
```

### Panel Header

**Base Styles**:
```css
display: flex;
justify-content: space-between;
align-items: center;
padding: 20px 25px;
border-bottom: 1px solid rgba(255, 255, 255, 0.1);
```

**Header Text**:
```css
color: #fff;
font-size: 1.5rem;
font-weight: 600;
letter-spacing: 1px;
margin: 0;
```

### Panel Content

**Base Styles**:
```css
padding: 25px;
```

---

## Typography

### Headings
- **H1**: `4.5rem`, `font-weight: 800`, gradient text (`linear-gradient(to bottom, #fff 40%, #cceeff 100%)`)
- **H2**: `1.5rem` to `2.5rem`, `font-weight: 600`, white color
- **Letter Spacing**: `1px` to `4px` for headings

### Body Text
- **Primary**: `1rem` to `1.2rem`, color `#fff` or `#e0e0e0`
- **Secondary**: `0.9rem` to `1rem`, color `#aaddff`
- **Tertiary**: `0.85rem`, color `#aaa`
- **Font Family**: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`

---

## Spacing Guidelines

### Padding
- **Buttons**: `10px 20px` (small), `15px 40px` (large)
- **Panels**: `20px 25px` (header), `25px` (content)
- **Containers**: `40px` (splash screen)

### Gaps
- **Menu Items**: `15px` vertical gap
- **Toggle Items**: `20px` vertical gap
- **Tech Boxes**: `6px` vertical gap

### Border Radius
- **Buttons**: `8px` (standard), `12px` (primary)
- **Panels**: `12px`
- **Small Elements**: `4px` to `6px`

---

## Effects & Animations

### Backdrop Filter
- **Standard**: `blur(4px)` for buttons
- **Enhanced**: `blur(10px)` for panels
- **Maximum**: `blur(20px)` for splash screens

### Transitions
- **Standard**: `0.2s` to `0.3s ease`
- **Smooth**: `all 0.3s ease` for complex interactions

### Glow Effects
- **Primary Glow**: `0 0 20px rgba(200, 220, 255, 0.6)`
- **Secondary Glow**: `0 0 40px rgba(150, 200, 255, 0.4)`
- **Text Glow**: `0 0 10px rgba(255, 255, 255, 0.8)`

### Hover Transform
- **Lift Effect**: `translateY(-2px)` on hover
- **Reset**: `translateY(0)` on active

---

## State Management

### Visibility Classes
- **Hidden**: `opacity: 0`, `pointer-events: none`, `visibility: hidden`
- **Visible**: `opacity: 1`, `pointer-events: auto`, `visibility: visible`

### Disabled States
- **Visual**: `opacity: 0` or `color: #666`
- **Interaction**: `pointer-events: none`, `cursor: default` or `cursor: not-allowed`

---

## Best Practices

### DO ✅
- Use consistent color values from the palette
- Apply backdrop-filter for depth
- Include smooth transitions (0.2s - 0.3s)
- Use appropriate border-radius (8px-12px)
- Add hover states with subtle transforms
- Maintain consistent padding and spacing
- Use letter-spacing for uppercase text
- Apply glow effects sparingly (primary actions only)

### DON'T ❌
- Use solid backgrounds (prefer rgba with transparency)
- Skip hover states on interactive elements
- Use harsh color transitions
- Mix different border-radius values inconsistently
- Forget to add disabled states
- Overuse glow effects (reserve for special buttons)
- Use opacity without backdrop-filter for depth

---

## Quick Reference

### Button Template (Primary)
```css
.my-button {
    background: linear-gradient(135deg, rgba(200, 220, 255, 0.2) 0%, rgba(150, 200, 255, 0.3) 100%);
    border: 2px solid rgba(255, 255, 255, 0.3);
    color: #fff;
    padding: 15px 40px;
    font-size: 1.1rem;
    border-radius: 12px;
    cursor: pointer;
    font-weight: 600;
    letter-spacing: 1px;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
}

.my-button:hover {
    background: linear-gradient(135deg, rgba(200, 220, 255, 0.3) 0%, rgba(150, 200, 255, 0.4) 100%);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(150, 200, 255, 0.3);
}

.my-button:active {
    transform: translateY(0);
}
```

### Button Template (Secondary)
```css
.my-ui-button {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.2s;
    backdrop-filter: blur(4px);
}

.my-ui-button:hover {
    background: rgba(255, 255, 255, 0.2);
}
```

### Panel Template
```css
.my-panel {
    background: rgba(5, 5, 16, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
    padding: 0;
}

.my-panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 25px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.my-panel-content {
    padding: 25px;
}
```

---

## Version History

- **v1.0** (2024-12-XX): Initial style guide created from existing button patterns


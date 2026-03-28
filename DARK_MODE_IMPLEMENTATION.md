# Dark Mode Implementation - AgroVault

## Overview
Dark mode has been successfully implemented across the AgroVault application using `next-themes`.

## Features

### 🌓 Theme Toggle Locations
1. **Desktop Sidebar** - Bottom section, above Settings link
2. **Mobile Navigation** - Rightmost button in the bottom nav bar

### 🎨 Color Scheme

#### Light Mode (Default)
- **Background**: Pure white (#FCFCFC)
- **Foreground**: Deep navy (#1E2839)
- **Primary**: Vibrant green (#00B050)
- **Cards**: White with subtle borders
- **Muted**: Light gray backgrounds

#### Dark Mode
- **Background**: Deep slate (#0f172a)
- **Foreground**: Light gray (#f1f5f9)
- **Primary**: Brighter green (#00c862) - adjusted for better contrast
- **Cards**: Slightly lighter slate (#151f32)
- **Muted**: Dark muted backgrounds with lighter text

### ⚙️ Configuration

**Theme Provider** (`components/providers.tsx`):
- `attribute="class"` - Uses CSS class-based theming
- `defaultTheme="system"` - Respects system preference
- `enableSystem` - Auto-detects system dark mode
- `disableTransitionOnChange` - Prevents flash on theme switch

**Theme Storage**: User preference is automatically saved in localStorage

## Files Modified

1. **`app/globals.css`**
   - Added `.dark` CSS class with dark mode color variables
   - All colors use HSL format for consistency

2. **`components/providers.tsx`**
   - Wrapped app with ThemeProvider

3. **`components/sidebar.tsx`**
   - Added theme toggle button with Moon/Sun icons
   - Shows "Dark Mode" / "Light Mode" text

4. **`components/mobile-nav.tsx`**
   - Added theme toggle button in mobile navigation
   - Compact icon + label design

5. **`components/theme-toggle.tsx`** (New)
   - Reusable theme toggle component
   - Can be used in other parts of the app

## Usage

### Manual Toggle
Users can click the theme toggle button in:
- Desktop: Sidebar (bottom section)
- Mobile: Bottom navigation bar (rightmost button)

### System Preference
The app automatically respects the user's system theme preference on first visit.

### Keyboard Shortcut (Future Enhancement)
Consider adding a keyboard shortcut (e.g., `Cmd+Shift+L`) for quick theme switching.

## Testing

1. **Desktop**:
   - Open any dashboard page
   - Click the theme toggle in the sidebar
   - Verify all components switch colors properly
   - Check sensor readings, charts, and cards

2. **Mobile**:
   - Open on mobile device or responsive mode
   - Click the theme toggle in bottom nav
   - Verify mobile navigation and all pages

3. **Persistence**:
   - Switch theme
   - Refresh the page
   - Theme should persist

4. **System Preference**:
   - Clear localStorage
   - Change system theme
   - Reload page - should match system

## Color Variables

All colors use CSS variables in HSL format:
```css
:root {
  --background: 0 0% 99%;
  --foreground: 210 12% 18%;
  --primary: 133 100% 29%;
  /* ... */
}

.dark {
  --background: 222 47% 11%;
  --foreground: 210 40% 98%;
  --primary: 133 100% 35%;
  /* ... */
}
```

## Accessibility

- ✅ Sufficient contrast ratios in both modes
- ✅ Icons clearly indicate current state
- ✅ Labels describe action ("Dark Mode" / "Light Mode")
- ✅ Respects user system preferences
- ✅ No flashing on theme switch

## Future Enhancements

1. **Theme Selector Dropdown**: Allow users to choose specific themes
2. **Custom Color Schemes**: Let users customize primary colors
3. **Auto-switch**: Schedule theme changes based on time of day
4. **Animation**: Add smooth transitions between themes (currently disabled for performance)

## Troubleshooting

**Issue**: Some components don't switch colors
- **Solution**: Ensure they use CSS variables (e.g., `bg-background`, `text-foreground`) instead of hardcoded colors

**Issue**: Flash of wrong theme on load
- **Solution**: Already prevented with `disableTransitionOnChange`

**Issue**: Theme doesn't persist
- **Solution**: Check localStorage permissions in browser

## Dependencies

- `next-themes`: ^0.4.6 (already installed)

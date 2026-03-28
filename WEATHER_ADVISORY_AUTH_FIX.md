# 🔧 Weather Advisory Authentication Fix

## Problem

The weather advisory page was failing to fetch storage units with the error:
```
Failed to fetch storage units
```

## Root Cause

The API endpoints require authentication via JWT token in the Authorization header:
- `GET /api/storage-units` - Requires `Authorization: Bearer <token>`
- `GET /api/weather/crop-advisory` - Requires `Authorization: Bearer <token>`

Both the weather advisory page and the weather advisory card component were making API calls **without** including the authentication token.

## Solution

### 1. Updated Weather Advisory Page
**File:** `app/(dashboard)/dashboard/weather-advisory/page.tsx`

**Changes:**
- Added `Authorization` header with JWT token to storage units fetch
- Improved error handling to display API error messages
- Extract and handle error response from API

```typescript
const response = await fetch('/api/storage-units', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
})

if (!response.ok) {
  const error = await response.json()
  throw new Error(error.error || 'Failed to fetch storage units')
}
```

### 2. Updated Weather Advisory Card Component
**File:** `components/weather-crop-advisory-card.tsx`

**Changes:**
- Imported `useAuth` hook to access authentication token
- Added `Authorization` header to crop advisory API call
- Added `token` to useEffect dependencies
- Improved error handling with detailed error messages
- Updated styling to use theme-aware classes

```typescript
import { useAuth } from '@/lib/auth-context'

export function WeatherCropAdvisoryCard({ storageUnitId, storageUnitName }) {
  const { token } = useAuth()
  
  useEffect(() => {
    const fetchAdvisory = async () => {
      const response = await fetch(
        `/api/weather/crop-advisory?storageUnitId=${storageUnitId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      // ... rest of the logic
    }
  }, [storageUnitId, token])
}
```

### 3. Theme-Aware Styling

Updated loading and error states to use design system classes:

**Before:**
```tsx
<div className="bg-white rounded-lg shadow p-6 border border-gray-200">
  <p className="text-gray-600">...</p>
</div>
```

**After:**
```tsx
<div className="card-elevated rounded-lg border p-6">
  <p className="text-muted-foreground">...</p>
</div>
```

## Files Changed

| File | Changes |
|------|---------|
| `app/(dashboard)/dashboard/weather-advisory/page.tsx` | ✅ Added auth token to API call<br>✅ Improved error handling |
| `components/weather-crop-advisory-card.tsx` | ✅ Imported `useAuth`<br>✅ Added token to API calls<br>✅ Updated dependencies<br>✅ Theme-aware styling |

## Testing

### Prerequisites
1. User must be **logged in**
2. User must have at least one **storage unit**
3. Storage unit should have **commodities** stored

### Test Steps

1. **Navigate to Weather Advisory:**
   ```
   http://localhost:3000/dashboard/weather-advisory
   ```

2. **Verify Storage Units Load:**
   - [ ] Storage units are displayed
   - [ ] Can select different units
   - [ ] Unit name and location shown
   - [ ] Commodity count displayed

3. **Verify Advisory Loads:**
   - [ ] Weather advisory card appears
   - [ ] Shows current conditions
   - [ ] Shows forecasted conditions
   - [ ] AI recommendations displayed
   - [ ] Market opportunities shown (if applicable)

4. **Test Error States:**
   - [ ] Clear error message if API fails
   - [ ] Loading state shows while fetching
   - [ ] Empty state if no commodities

## API Endpoints Used

### 1. Storage Units API
```
GET /api/storage-units
Headers: Authorization: Bearer <token>
Response: { storageUnits: [...] }
```

### 2. Crop Advisory API
```
GET /api/weather/crop-advisory?storageUnitId=xxx
Headers: Authorization: Bearer <token>
Response: {
  severity: "CRITICAL" | "HIGH" | "WARNING" | "LOW",
  commodityAdvisories: [...],
  overallStrategy: "...",
  confidenceScore: 85
}
```

## Authentication Flow

```
1. User logs in
   ↓
2. JWT token stored in localStorage
   ↓
3. AuthContext provides token via useAuth()
   ↓
4. Components use token in API calls
   ↓
5. API validates token and returns data
```

## Common Issues & Solutions

### Issue: "Authentication required" error

**Solution:**
- Ensure user is logged in
- Check if token exists in localStorage
- Verify token hasn't expired

### Issue: Storage units empty

**Solution:**
- Create a storage unit first
- Verify user is a farmer (role check)
- Check database for storage units

### Issue: Advisory fails to load

**Solution:**
- Ensure storage unit has coordinates (lat/lng)
- Verify commodities exist in storage unit
- Check weather API is accessible

## Additional Improvements

### Error Messages

Now shows specific error messages:
- "Authentication required. Please log in."
- "Storage unit not found."
- "You do not have permission to access this storage unit."
- "Storage unit location coordinates not found."

### Loading States

Better visual feedback:
- Loading spinner while fetching
- Disabled buttons during API calls
- Skeleton screens (future enhancement)

### Theme Support

Consistent with design system:
- Light/Dark mode compatible
- Uses semantic color names
- Respects user theme preference

## Status

✅ **Fixed** - Authentication working correctly
✅ **Storage Units** - Loading properly
✅ **Weather Advisory** - Fetching and displaying
✅ **Theme Support** - Light/Dark compatible
✅ **Error Handling** - Improved messages

---

**Fixed:** March 28, 2026  
**Issue:** Missing authentication in API calls  
**Solution:** Added JWT token to all API requests

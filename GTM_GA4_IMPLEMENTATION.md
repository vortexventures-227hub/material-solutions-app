# GTM + GA4 Implementation Guide

**Created:** 2026-03-28 9:35 PM EDT  
**Author:** Axis  
**Purpose:** Exact code for Cipher to add tracking to Vortex

---

## Overview

Google Tag Manager (GTM) + Google Analytics 4 (GA4) provide:
- Website traffic tracking
- Conversion measurement (lead forms, phone clicks)
- User behavior analysis
- Marketing channel attribution

**Total implementation time:** ~1 hour

---

## Step 1: Create Accounts

### 1.1 Google Analytics 4
1. Go to https://analytics.google.com
2. Create new GA4 property: "Material Solutions"
3. Set timezone: America/New_York
4. Industry: Industrial Equipment
5. Get **Measurement ID** (format: `G-XXXXXXXXXX`)

### 1.2 Google Tag Manager
1. Go to https://tagmanager.google.com
2. Create container: "MaterialsSolutionsNJ.com"
3. Container type: Web
4. Get **Container ID** (format: `GTM-XXXXXXX`)

---

## Step 2: Frontend Implementation

### 2.1 Add GTM to `public/index.html`

**Location:** Immediately after opening `<head>` tag

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Google Tag Manager -->
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
  <!-- End Google Tag Manager -->
  
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  ...
</head>
```

**Location:** Immediately after opening `<body>` tag

```html
<body>
  <!-- Google Tag Manager (noscript) -->
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <!-- End Google Tag Manager (noscript) -->
  
  <div id="root"></div>
  ...
</body>
```

**Replace `GTM-XXXXXXX` with actual Container ID from Step 1.2**

---

## Step 3: GTM Configuration

### 3.1 Add GA4 Tag in GTM

1. Log into GTM
2. **Tags** → New Tag
3. Tag Configuration:
   - Type: **Google Analytics: GA4 Configuration**
   - Measurement ID: `G-XXXXXXXXXX` (from Step 1.1)
4. Triggering:
   - Trigger: **All Pages**
5. Save tag as "GA4 Config"
6. **Submit** changes (top right)

### 3.2 Create Conversion Events

#### Event 1: Lead Form Submission

**Tag:**
- Type: **Google Analytics: GA4 Event**
- Configuration Tag: GA4 Config
- Event Name: `lead_form_submit`
- Event Parameters:
  - `form_name`: `{{Form Name}}`
  - `lead_source`: `{{Page Path}}`

**Trigger:**
- Type: **Custom Event**
- Event name: `lead_submitted`

**Save as:** "GA4 - Lead Form Submit"

#### Event 2: Phone Click

**Tag:**
- Type: **Google Analytics: GA4 Event**
- Configuration Tag: GA4 Config
- Event Name: `phone_click`
- Event Parameters:
  - `phone_number`: `{{Click URL}}`

**Trigger:**
- Type: **Click - All Elements**
- Click URL contains: `tel:`

**Save as:** "GA4 - Phone Click"

#### Event 3: Inventory View

**Tag:**
- Type: **Google Analytics: GA4 Event**
- Configuration Tag: GA4 Config
- Event Name: `view_item`
- Event Parameters:
  - `item_id`: `{{Page Path}}`
  - `item_name`: `{{Page Title}}`

**Trigger:**
- Type: **Page View**
- Page Path matches RegEx: `/inventory/.*`

**Save as:** "GA4 - Inventory View"

---

## Step 4: Add Event Tracking to Frontend

### 4.1 Utility Function

Create `src/utils/analytics.js`:

```javascript
/**
 * Push custom events to Google Tag Manager dataLayer
 */
export function trackEvent(eventName, eventParams = {}) {
  if (window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...eventParams
    });
  } else {
    console.warn('GTM dataLayer not available');
  }
}

/**
 * Track page views (for SPA navigation)
 */
export function trackPageView(path, title) {
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'page_view',
      page_path: path,
      page_title: title
    });
  }
}
```

### 4.2 Update Lead Form Component

**File:** `src/components/LeadForm.js`

**Before:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  const response = await api.post('/api/leads', formData);
  // ... handle response
};
```

**After:**
```javascript
import { trackEvent } from '../utils/analytics';

const handleSubmit = async (e) => {
  e.preventDefault();
  const response = await api.post('/api/leads', formData);
  
  if (response.status === 201) {
    // Track successful lead submission
    trackEvent('lead_submitted', {
      form_name: 'Contact Form',
      lead_source: window.location.pathname
    });
  }
  
  // ... handle response
};
```

### 4.3 Track Phone Clicks

**File:** `src/components/Navigation.js` (or wherever phone number appears)

**Before:**
```jsx
<a href="tel:+15551234567">Call Us</a>
```

**After:**
```jsx
import { trackEvent } from '../utils/analytics';

<a 
  href="tel:+15551234567"
  onClick={() => trackEvent('phone_click', { phone_number: '+15551234567' })}
>
  Call Us
</a>
```

### 4.4 Track SPA Navigation (React Router)

**File:** `src/App.js`

```javascript
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from './utils/analytics';

function App() {
  const location = useLocation();
  
  useEffect(() => {
    trackPageView(location.pathname, document.title);
  }, [location]);
  
  return (
    // ... rest of app
  );
}
```

---

## Step 5: Test Implementation

### 5.1 GTM Preview Mode
1. In GTM, click **Preview** (top right)
2. Enter site URL: `http://localhost:3000`
3. GTM debugger opens in new tab
4. Verify tags fire on page load

### 5.2 Test Conversions
1. Submit a lead form → Check GTM preview for `lead_submitted` event
2. Click phone number → Check for `phone_click` event
3. Navigate to inventory page → Check for `view_item` event

### 5.3 Real-Time Reports (GA4)
1. In GA4, go to **Reports** → **Realtime**
2. Trigger events on site
3. Verify events appear in real-time dashboard within 30 seconds

---

## Step 6: Environment Variables (Optional)

If you want to disable tracking in development:

**File:** `.env.development`
```
REACT_APP_GTM_ID=
```

**File:** `.env.production`
```
REACT_APP_GTM_ID=GTM-XXXXXXX
```

**File:** `public/index.html`
```html
<script>
  if ('%REACT_APP_GTM_ID%') {
    (function(w,d,s,l,i){...})(window,document,'script','dataLayer','%REACT_APP_GTM_ID%');
  }
</script>
```

---

## Step 7: GA4 Goals Configuration

### 7.1 Create Conversions
1. In GA4, go to **Configure** → **Events**
2. Mark these as conversions:
   - `lead_submitted` ✅
   - `phone_click` ✅
3. Go to **Configure** → **Conversions**
4. Verify both appear as conversion events

### 7.2 Create Custom Audiences
1. **Configure** → **Audiences**
2. Create:
   - **High-Intent Visitors** (viewed 3+ inventory pages in 7 days)
   - **Lead Form Abandoners** (visited form page but didn't submit)
   - **Returning Visitors** (2+ sessions in 30 days)

---

## Step 8: Verification Checklist

- [ ] GTM container loads on every page
- [ ] GA4 Config tag fires on page load
- [ ] Lead form submission tracked
- [ ] Phone clicks tracked
- [ ] Inventory page views tracked
- [ ] SPA navigation tracked (React Router)
- [ ] Real-time events visible in GA4
- [ ] Conversions marked in GA4
- [ ] No console errors related to tracking

---

## Expected Events

| Event | Trigger | Parameters |
|-------|---------|------------|
| `page_view` | Every page/route change | `page_path`, `page_title` |
| `lead_submitted` | Lead form submit success | `form_name`, `lead_source` |
| `phone_click` | Click on tel: link | `phone_number` |
| `view_item` | Visit inventory page | `item_id`, `item_name` |

---

## Debugging

### GTM Not Loading?
- Check browser console for errors
- Verify GTM-XXXXXXX ID is correct
- Check network tab for `gtm.js` request
- Ensure no ad blockers are active

### Events Not Firing?
- Open GTM Preview mode
- Check dataLayer in console: `console.log(window.dataLayer)`
- Verify trigger conditions match
- Check for JavaScript errors preventing execution

### GA4 Not Showing Data?
- Wait up to 24 hours for full processing
- Check **Realtime** reports for immediate data
- Verify Measurement ID is correct
- Ensure you're looking at correct property

---

## Future Enhancements

1. **Enhanced E-commerce** — Track inventory adds, removes, checkouts
2. **User ID Tracking** — Track logged-in users across sessions
3. **Custom Dimensions** — Segment by lead source, budget range, etc.
4. **Cross-Domain Tracking** — If MaterialsSolutionsNJ.com links to separate checkout domain

---

*This guide provides exact copy-paste code for Cipher to implement.*

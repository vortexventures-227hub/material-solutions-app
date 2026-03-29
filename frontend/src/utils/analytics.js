/**
 * Analytics utility for Google Tag Manager + GA4 tracking
 */

/**
 * Push custom events to Google Tag Manager dataLayer
 * @param {string} eventName - The name of the event to track
 * @param {Object} eventParams - Additional parameters to pass with the event
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
 * Track page views for SPA navigation
 * @param {string} path - The current page path
 * @param {string} title - The page title
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

/**
 * Track inventory item views
 * @param {string} itemId - Unique identifier for the item
 * @param {string} itemName - Name/title of the item
 */
export function trackInventoryView(itemId, itemName) {
  trackEvent('view_item', {
    item_id: itemId,
    item_name: itemName
  });
}

/**
 * Track phone number clicks
 * @param {string} phoneNumber - The phone number clicked
 */
export function trackPhoneClick(phoneNumber) {
  trackEvent('phone_click', {
    phone_number: phoneNumber
  });
}

/**
 * Track lead form submissions
 * @param {string} formName - Name of the form
 * @param {string} leadSource - Source page or path
 */
export function trackLeadSubmission(formName, leadSource) {
  trackEvent('lead_submitted', {
    form_name: formName,
    lead_source: leadSource
  });
}

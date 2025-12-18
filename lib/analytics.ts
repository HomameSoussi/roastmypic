// Simple analytics tracking utility
// This can be extended to integrate with services like Google Analytics, Mixpanel, etc.

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: number;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private maxEvents = 100;

  // Track an event
  track(event: string, properties?: Record<string, any>) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: Date.now(),
    };

    this.events.push(analyticsEvent);

    // Keep only the last maxEvents
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event, properties);
    }

    // Send to backend for storage
    this.sendToBackend(analyticsEvent);
  }

  private async sendToBackend(event: AnalyticsEvent) {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    } catch (error) {
      // Silently fail - analytics should never break the app
      console.error('Analytics error:', error);
    }
  }

  // Get recent events (for debugging)
  getEvents() {
    return this.events;
  }

  // Clear events
  clear() {
    this.events = [];
  }
}

// Singleton instance
const analytics = new Analytics();

// Export convenience functions
export const trackEvent = (event: string, properties?: Record<string, any>) => {
  analytics.track(event, properties);
};

export const trackPageView = (page: string) => {
  analytics.track('page_view', { page });
};

export const trackRoastGenerated = (style: string, language: string) => {
  analytics.track('roast_generated', { style, language });
};

export const trackRoastShared = (method: string) => {
  analytics.track('roast_shared', { method });
};

export const trackFeatureUsed = (feature: string) => {
  analytics.track('feature_used', { feature });
};

export const trackSettingChanged = (key: string, value: any) => {
  analytics.track('setting_changed', { key, value });
};

export default analytics;

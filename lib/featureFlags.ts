// Feature flags utility for A/B testing and gradual rollouts
// This allows you to enable/disable features for specific users or percentages

interface FeatureFlag {
  key: string;
  enabled: boolean;
  rolloutPercentage?: number; // 0-100, for gradual rollouts
  allowedUsers?: string[]; // User IDs that have access
  description?: string;
}

class FeatureFlagManager {
  private flags: Map<string, FeatureFlag> = new Map();
  private userCache: Map<string, Set<string>> = new Map();

  // Initialize with default flags
  constructor() {
    this.setFlag('new_roast_styles', {
      key: 'new_roast_styles',
      enabled: true,
      rolloutPercentage: 100,
      description: 'Enable new experimental roast styles',
    });

    this.setFlag('advanced_analytics', {
      key: 'advanced_analytics',
      enabled: false,
      rolloutPercentage: 0,
      description: 'Enable advanced analytics tracking',
    });

    this.setFlag('premium_features', {
      key: 'premium_features',
      enabled: false,
      allowedUsers: [],
      description: 'Enable premium features for specific users',
    });
  }

  // Set a feature flag
  setFlag(key: string, flag: FeatureFlag) {
    this.flags.set(key, flag);
  }

  // Check if a feature is enabled for a user
  isEnabled(key: string, userId?: string): boolean {
    const flag = this.flags.get(key);
    
    if (!flag) {
      return false;
    }

    if (!flag.enabled) {
      return false;
    }

    // Check if user is in allowed list
    if (flag.allowedUsers && flag.allowedUsers.length > 0) {
      if (!userId) return false;
      return flag.allowedUsers.includes(userId);
    }

    // Check rollout percentage
    if (flag.rolloutPercentage !== undefined) {
      if (flag.rolloutPercentage === 0) return false;
      if (flag.rolloutPercentage === 100) return true;

      // Use consistent hashing for stable rollout
      if (userId) {
        const hash = this.hashString(userId + key);
        return (hash % 100) < flag.rolloutPercentage;
      }

      // For anonymous users, use random
      return Math.random() * 100 < flag.rolloutPercentage;
    }

    return true;
  }

  // Simple string hash function
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Get all flags
  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  // Update flag from settings
  updateFromSettings(settings: any) {
    if (!settings) return;

    Object.keys(settings).forEach((key) => {
      if (key.startsWith('feature_flag_')) {
        const flagKey = key.replace('feature_flag_', '');
        const value = settings[key];
        
        if (typeof value === 'object' && value.enabled !== undefined) {
          this.setFlag(flagKey, {
            key: flagKey,
            enabled: value.enabled,
            rolloutPercentage: value.rolloutPercentage,
            allowedUsers: value.allowedUsers,
            description: value.description,
          });
        }
      }
    });
  }
}

// Singleton instance
const featureFlagManager = new FeatureFlagManager();

// Export convenience functions
export const isFeatureEnabled = (key: string, userId?: string): boolean => {
  return featureFlagManager.isEnabled(key, userId);
};

export const getAllFeatureFlags = (): FeatureFlag[] => {
  return featureFlagManager.getAllFlags();
};

export const updateFeatureFlagsFromSettings = (settings: any) => {
  featureFlagManager.updateFromSettings(settings);
};

export default featureFlagManager;

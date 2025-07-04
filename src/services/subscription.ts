/**
 * Subscription Management Service
 * Handles Free/Pro plan logic and feature flags
 */

export enum SubscriptionPlan {
  FREE = 'free',
  PRO = 'pro'
}

export interface SubscriptionStatus {
  plan: SubscriptionPlan;
  isActive: boolean;
  expiresAt?: string;
}

export interface FeatureFlags {
  maxActiveTasks: number;
  visualTypes: number; // Number of visual types available
  notificationCustomization: boolean;
  cloudBackup: boolean;
  csvExport: boolean;
  continueTokensPerCycle: number;
}

/**
 * Get feature flags based on subscription plan
 */
export function getFeatureFlags(plan: SubscriptionPlan): FeatureFlags {
  switch (plan) {
    case SubscriptionPlan.PRO:
      return {
        maxActiveTasks: 8, // Unlimited (8 is practical limit)
        visualTypes: 4, // Tree, Garden, Pet, Progress Bar
        notificationCustomization: true,
        cloudBackup: true,
        csvExport: true,
        continueTokensPerCycle: 3,
      };
    case SubscriptionPlan.FREE:
    default:
      return {
        maxActiveTasks: 1, // Only 1 active task
        visualTypes: 1, // Only Tree
        notificationCustomization: false,
        cloudBackup: false,
        csvExport: false,
        continueTokensPerCycle: 1,
      };
  }
}

/**
 * Simple subscription service (mock implementation)
 * In production, this would integrate with RevenueCat
 */
class SubscriptionService {
  private currentPlan: SubscriptionPlan = SubscriptionPlan.FREE;
  private isActive: boolean = true;

  /**
   * Get current subscription status
   */
  getSubscriptionStatus(): SubscriptionStatus {
    return {
      plan: this.currentPlan,
      isActive: this.isActive,
      expiresAt: this.currentPlan === SubscriptionPlan.PRO ? 
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : // 30 days from now
        undefined
    };
  }

  /**
   * Get current feature flags
   */
  getFeatureFlags(): FeatureFlags {
    return getFeatureFlags(this.currentPlan);
  }

  /**
   * Check if user has Pro features
   */
  isPro(): boolean {
    return this.currentPlan === SubscriptionPlan.PRO && this.isActive;
  }

  /**
   * Check if a specific feature is available
   */
  hasFeature(feature: keyof FeatureFlags): boolean {
    const flags = this.getFeatureFlags();
    const value = flags[feature];
    
    if (typeof value === 'boolean') {
      return value;
    } else if (typeof value === 'number') {
      return value > 0;
    }
    
    return false;
  }

  /**
   * Get maximum allowed active tasks
   */
  getMaxActiveTasks(): number {
    return this.getFeatureFlags().maxActiveTasks;
  }

  /**
   * Check if user can create more tasks
   */
  canCreateTask(currentTaskCount: number): boolean {
    return currentTaskCount < this.getMaxActiveTasks();
  }

  /**
   * Upgrade to Pro (mock implementation)
   */
  async upgradeToPro(): Promise<boolean> {
    // In production, this would handle RevenueCat purchase
    this.currentPlan = SubscriptionPlan.PRO;
    this.isActive = true;
    return true;
  }

  /**
   * Downgrade to Free (for testing or subscription expiry)
   */
  async downgradeToFree(): Promise<boolean> {
    this.currentPlan = SubscriptionPlan.FREE;
    this.isActive = true;
    return true;
  }
}

// Singleton instance
export const subscriptionService = new SubscriptionService();
/**
 * Subscription Hook
 * React hook for managing subscription status and feature flags
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  subscriptionService, 
  SubscriptionStatus, 
  FeatureFlags,
  SubscriptionPlan 
} from './subscription';

export function useSubscription() {
  const [status, setStatus] = useState<SubscriptionStatus>(
    subscriptionService.getSubscriptionStatus()
  );
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>(
    subscriptionService.getFeatureFlags()
  );

  const refreshStatus = useCallback(() => {
    setStatus(subscriptionService.getSubscriptionStatus());
    setFeatureFlags(subscriptionService.getFeatureFlags());
  }, []);

  const isPro = useCallback(() => {
    return subscriptionService.isPro();
  }, []);

  const hasFeature = useCallback((feature: keyof FeatureFlags) => {
    return subscriptionService.hasFeature(feature);
  }, []);

  const canCreateTask = useCallback((currentTaskCount: number) => {
    return subscriptionService.canCreateTask(currentTaskCount);
  }, []);

  const getMaxActiveTasks = useCallback(() => {
    return subscriptionService.getMaxActiveTasks();
  }, []);

  const upgradeToPro = useCallback(async () => {
    const success = await subscriptionService.upgradeToPro();
    if (success) {
      refreshStatus();
    }
    return success;
  }, [refreshStatus]);

  const downgradeToFree = useCallback(async () => {
    const success = await subscriptionService.downgradeToFree();
    if (success) {
      refreshStatus();
    }
    return success;
  }, [refreshStatus]);

  // Check status periodically (every 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshStatus();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refreshStatus]);

  return {
    status,
    featureFlags,
    isPro: isPro(),
    hasFeature,
    canCreateTask,
    getMaxActiveTasks,
    upgradeToPro,
    downgradeToFree,
    refreshStatus,
  };
}
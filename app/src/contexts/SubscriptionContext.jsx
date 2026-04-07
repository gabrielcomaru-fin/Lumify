import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const SubscriptionContext = createContext(undefined);

export function SubscriptionProvider({ children }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSubscription = useCallback(async (userId) => {
    if (!userId) {
      setSubscription(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('plan, status, current_period_end')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      setSubscription(data ?? { plan: 'free', status: 'active', current_period_end: null });
    } catch (err) {
      console.error('Subscription load error:', err);
      setSubscription({ plan: 'free', status: 'active', current_period_end: null });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubscription(user?.id ?? null);
  }, [user?.id, loadSubscription]);

  const value = useMemo(() => {
    const plan = subscription?.plan || 'free';
    const status = subscription?.status || 'active';
    const isActive = status === 'active' || status === 'trialing';
    const isPro = isActive && (plan === 'pro' || plan === 'premium');
    const isPremium = isActive && plan === 'premium';
    return {
      subscription,
      loading,
      plan,
      status,
      isPro,
      isPremium,
      // Pro features
      canAddAccount: isPro,
      canSetCategoryLimit: isPro,
      canAccessAdvancedReports: isPro,
      canAccessTips: isPro,
      canAccessAdvancedGoals: isPro,
      // Premium features
      canAccessCalculator: isPremium,
      canAccessProjection: isPremium,
      canExportReports: isPremium,
      loadSubscription,
    };
  }, [subscription, loading, loadSubscription]);

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

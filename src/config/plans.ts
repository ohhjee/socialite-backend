export type PlanTier = "free" | "pro" | "creator";

export interface PlanConfig {
  maxGroups: number | "unlimited";
  advancedAnalytics: boolean;
  prioritySupport: boolean;
  customUsernameBadge: boolean;
  monetiseContent: boolean;
  dedicatedAccountManager: boolean;
  apiAccess: boolean;
  whiteLabelOptions: boolean;
  customDomain: boolean;
}

export const PLAN_CONFIG: Record<PlanTier, PlanConfig> = {
  free: {
    maxGroups: 5,
    advancedAnalytics: false,
    prioritySupport: false,
    customDomain: false,
    customUsernameBadge: false,
    monetiseContent: false,
    dedicatedAccountManager: false,
    apiAccess: false,
    whiteLabelOptions: false,
  },
  pro: {
    maxGroups: "unlimited",
    advancedAnalytics: true,
    prioritySupport: true,
    customUsernameBadge: true,
    monetiseContent: true,
    dedicatedAccountManager: false,
    apiAccess: false,
    customDomain: false,
    whiteLabelOptions: false,
  },
  creator: {
    maxGroups: "unlimited",
    advancedAnalytics: true,
    prioritySupport: true,
    customUsernameBadge: true,
    monetiseContent: true,
    dedicatedAccountManager: true,
    apiAccess: true,
    customDomain: true,
    whiteLabelOptions: true,
  },
};

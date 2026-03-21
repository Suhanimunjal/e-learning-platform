'use client';

import { usePlugins, usePlugin } from '@/contexts/PluginContext';

export const PLUGIN_IDS = {
  ADVANCED_ASSIGNMENTS: 'advanced-assignments',
  ADVANCED_QUIZZES: 'advanced-quizzes',
  BRANCHING_LESSONS: 'branching-lessons',
  SCORM_H5P: 'scorm-h5p',
  PEER_ASSESSMENT: 'peer-assessment',
  LIVE_SESSIONS: 'live-sessions',
  BADGES_CERTIFICATES: 'badges-certificates',
  POINTS_LEADERBOARD: 'points-leaderboard',
  ACHIEVEMENTS: 'achievements',
  LEARNING_PATHS: 'learning-paths',
  STREAKS_REWARDS: 'streaks-rewards',
  COURSE_ANALYTICS: 'course-analytics',
  PREDICTIVE_ANALYTICS: 'predictive-analytics',
  EVENT_LOGGING: 'event-logging',
  STUDENT_INSIGHTS: 'student-insights',
  GRADE_ANALYTICS: 'grade-analytics',
  BULK_USER_UPLOAD: 'bulk-user-upload',
  ROLE_PERMISSIONS: 'role-permissions',
  COHORTS_GROUPS: 'cohorts-groups',
  SELF_REGISTRATION: 'self-registration',
  PARENT_PORTAL: 'parent-portal',
  FORUMS: 'forums',
  CHAT_MESSAGING: 'chat-messaging',
  ANNOUNCEMENTS: 'announcements',
  NOTIFICATIONS: 'notifications',
  VIDEO_CONFERENCE: 'video-conference',
  RAZORPAY_GATEWAY: 'razorpay-gateway',
  SUBSCRIPTIONS: 'subscriptions',
  COUPONS_DISCOUNTS: 'coupons-discounts',
  AFFILIATE_PROGRAM: 'affiliate-program',
  INVOICE_BILLING: 'invoice-billing',
  LTI_TOOLS: 'lti-tools',
  VIDEO_HOSTING: 'video-hosting',
  CALENDAR_SYNC: 'calendar-sync',
  ZOOM_INTEGRATION: 'zoom-integration',
  SLACK_INTEGRATION: 'slack-integration',
  WEBHOOK_SYSTEM: 'webhook-system',
  AI_CONTENT_GENERATOR: 'ai-content-generator',
  AI_RECOMMENDATIONS: 'ai-recommendations',
  AI_AUTO_GRADING: 'ai-auto-grading',
  AI_CHATBOT: 'ai-chatbot',
  AI_TRANSLATION: 'ai-translation',
  SMART_SEARCH: 'smart-search',
  BACKUP_RESTORE: 'backup-restore',
  CUSTOM_THEMES: 'custom-themes',
  MULTI_LANGUAGE: 'multi-language',
  CUSTOM_FIELDS: 'custom-fields',
  WIZARD_SETUP: 'wizard-setup',
  API_ACCESS: 'api-access',
  ATTENDANCE_TRACKING: 'attendance-tracking',
  DIGITAL_WALLET: 'digital-wallet',
} as const;

export type PluginId = typeof PLUGIN_IDS[keyof typeof PLUGIN_IDS];

export function useAdvancedAssignments() {
  return usePlugin(PLUGIN_IDS.ADVANCED_ASSIGNMENTS);
}

export function useAdvancedQuizzes() {
  return usePlugin(PLUGIN_IDS.ADVANCED_QUIZZES);
}

export function useBranchingLessons() {
  return usePlugin(PLUGIN_IDS.BRANCHING_LESSONS);
}

export function useScormH5P() {
  return usePlugin(PLUGIN_IDS.SCORM_H5P);
}

export function usePeerAssessment() {
  return usePlugin(PLUGIN_IDS.PEER_ASSESSMENT);
}

export function useLiveSessions() {
  return usePlugin(PLUGIN_IDS.LIVE_SESSIONS);
}

export function useBadgesCertificates() {
  return usePlugin(PLUGIN_IDS.BADGES_CERTIFICATES);
}

export function usePointsLeaderboard() {
  return usePlugin(PLUGIN_IDS.POINTS_LEADERBOARD);
}

export function useAchievements() {
  return usePlugin(PLUGIN_IDS.ACHIEVEMENTS);
}

export function useLearningPaths() {
  return usePlugin(PLUGIN_IDS.LEARNING_PATHS);
}

export function useStreaksRewards() {
  return usePlugin(PLUGIN_IDS.STREAKS_REWARDS);
}

export function useCourseAnalytics() {
  return usePlugin(PLUGIN_IDS.COURSE_ANALYTICS);
}

export function usePredictiveAnalytics() {
  return usePlugin(PLUGIN_IDS.PREDICTIVE_ANALYTICS);
}

export function useEventLogging() {
  return usePlugin(PLUGIN_IDS.EVENT_LOGGING);
}

export function useStudentInsights() {
  return usePlugin(PLUGIN_IDS.STUDENT_INSIGHTS);
}

export function useGradeAnalytics() {
  return usePlugin(PLUGIN_IDS.GRADE_ANALYTICS);
}

export function useBulkUserUpload() {
  return usePlugin(PLUGIN_IDS.BULK_USER_UPLOAD);
}

export function useRolePermissions() {
  return usePlugin(PLUGIN_IDS.ROLE_PERMISSIONS);
}

export function useCohortsGroups() {
  return usePlugin(PLUGIN_IDS.COHORTS_GROUPS);
}

export function useSelfRegistration() {
  return usePlugin(PLUGIN_IDS.SELF_REGISTRATION);
}

export function useParentPortal() {
  return usePlugin(PLUGIN_IDS.PARENT_PORTAL);
}

export function useForums() {
  return usePlugin(PLUGIN_IDS.FORUMS);
}

export function useChatMessaging() {
  return usePlugin(PLUGIN_IDS.CHAT_MESSAGING);
}

export function useAnnouncements() {
  return usePlugin(PLUGIN_IDS.ANNOUNCEMENTS);
}

export function useNotifications() {
  return usePlugin(PLUGIN_IDS.NOTIFICATIONS);
}

export function useVideoConference() {
  return usePlugin(PLUGIN_IDS.VIDEO_CONFERENCE);
}

export function useRazorpayGateway() {
  return usePlugin(PLUGIN_IDS.RAZORPAY_GATEWAY);
}

export function useSubscriptions() {
  return usePlugin(PLUGIN_IDS.SUBSCRIPTIONS);
}

export function useCouponsDiscounts() {
  return usePlugin(PLUGIN_IDS.COUPONS_DISCOUNTS);
}

export function useAffiliateProgram() {
  return usePlugin(PLUGIN_IDS.AFFILIATE_PROGRAM);
}

export function useInvoiceBilling() {
  return usePlugin(PLUGIN_IDS.INVOICE_BILLING);
}

export function useLtiTools() {
  return usePlugin(PLUGIN_IDS.LTI_TOOLS);
}

export function useVideoHosting() {
  return usePlugin(PLUGIN_IDS.VIDEO_HOSTING);
}

export function useCalendarSync() {
  return usePlugin(PLUGIN_IDS.CALENDAR_SYNC);
}

export function useZoomIntegration() {
  return usePlugin(PLUGIN_IDS.ZOOM_INTEGRATION);
}

export function useSlackIntegration() {
  return usePlugin(PLUGIN_IDS.SLACK_INTEGRATION);
}

export function useWebhookSystem() {
  return usePlugin(PLUGIN_IDS.WEBHOOK_SYSTEM);
}

export function useAiContentGenerator() {
  return usePlugin(PLUGIN_IDS.AI_CONTENT_GENERATOR);
}

export function useAiRecommendations() {
  return usePlugin(PLUGIN_IDS.AI_RECOMMENDATIONS);
}

export function useAiAutoGrading() {
  return usePlugin(PLUGIN_IDS.AI_AUTO_GRADING);
}

export function useAiChatbot() {
  return usePlugin(PLUGIN_IDS.AI_CHATBOT);
}

export function useAiTranslation() {
  return usePlugin(PLUGIN_IDS.AI_TRANSLATION);
}

export function useSmartSearch() {
  return usePlugin(PLUGIN_IDS.SMART_SEARCH);
}

export function useBackupRestore() {
  return usePlugin(PLUGIN_IDS.BACKUP_RESTORE);
}

export function useCustomThemes() {
  return usePlugin(PLUGIN_IDS.CUSTOM_THEMES);
}

export function useMultiLanguage() {
  return usePlugin(PLUGIN_IDS.MULTI_LANGUAGE);
}

export function useCustomFields() {
  return usePlugin(PLUGIN_IDS.CUSTOM_FIELDS);
}

export function useWizardSetup() {
  return usePlugin(PLUGIN_IDS.WIZARD_SETUP);
}

export function useApiAccess() {
  return usePlugin(PLUGIN_IDS.API_ACCESS);
}

export function useAttendanceTracking() {
  return usePlugin(PLUGIN_IDS.ATTENDANCE_TRACKING);
}

export function useDigitalWallet() {
  return usePlugin(PLUGIN_IDS.DIGITAL_WALLET);
}

export function usePluginsByCategory(category: string) {
  const { enabledPlugins } = usePlugins();
  return enabledPlugins.filter(p => p.category === category);
}

export function useContentPlugins() {
  return usePluginsByCategory('CONTENT');
}

export function useGamificationPlugins() {
  return usePluginsByCategory('GAMIFICATION');
}

export function useAnalyticsPlugins() {
  return usePluginsByCategory('ANALYTICS');
}

export function useCommunicationPlugins() {
  return usePluginsByCategory('COMMUNICATION');
}

export function usePaymentPlugins() {
  return usePluginsByCategory('PAYMENTS');
}

export function useAiPlugins() {
  return usePluginsByCategory('AI');
}

export function useIntegrationPlugins() {
  return usePluginsByCategory('INTEGRATIONS');
}

export function useUtilityPlugins() {
  return usePluginsByCategory('UTILITY');
}

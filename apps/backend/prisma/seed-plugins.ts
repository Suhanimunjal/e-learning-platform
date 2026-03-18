import { PrismaClient, PluginCategory } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: __dirname + '/../.env' });

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'lms_db',
  user: 'lms_user',
  password: 'lms_password',
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface PluginConfig {
  pluginId: string;
  name: string;
  category: PluginCategory;
  author: string;
  enabled: boolean;
  tier: 'mandatory' | 'recommended' | 'optional';
}

async function main() {
  console.log('🚀 Starting plugin setup...\n');

  // Comprehensive plugin configuration list
  const pluginConfigs: PluginConfig[] = [
    // ===== MANDATORY PLUGINS (Core LMS) =====
    { pluginId: 'plugin-backup-restore', name: 'Backup & Restore', category: 'UTILITY', author: 'Admin Team', enabled: true, tier: 'mandatory' },
    { pluginId: 'plugin-theme-builder', name: 'Theme Builder', category: 'UTILITY', author: 'Design Team', enabled: true, tier: 'mandatory' },
    { pluginId: 'plugin-custom-fields', name: 'Custom User Fields', category: 'USERMGMT', author: 'User Management Team', enabled: true, tier: 'mandatory' },
    { pluginId: 'plugin-bulk-import', name: 'Bulk User Import', category: 'USERMGMT', author: 'User Management Team', enabled: true, tier: 'mandatory' },
    { pluginId: 'plugin-role-permissions', name: 'Advanced Role Permissions', category: 'USERMGMT', author: 'User Management Team', enabled: true, tier: 'mandatory' },

    // ===== MANDATORY PLUGINS (Content & Assessment) =====
    { pluginId: 'plugin-question-bank', name: 'Question Bank Management', category: 'CONTENT', author: 'Content Team', enabled: true, tier: 'mandatory' },
    { pluginId: 'plugin-interactive-quizzes', name: 'Interactive Quizzes', category: 'CONTENT', author: 'Content Team', enabled: true, tier: 'mandatory' },
    { pluginId: 'plugin-content-library', name: 'Content Library', category: 'CONTENT', author: 'Content Team', enabled: true, tier: 'mandatory' },
    { pluginId: 'plugin-assessment-tools', name: 'Advanced Assessment Tools', category: 'UTILITY', author: 'Assessment Team', enabled: true, tier: 'mandatory' },
    { pluginId: 'plugin-rubric-grading', name: 'Rubric-based Grading', category: 'UTILITY', author: 'Assessment Team', enabled: true, tier: 'mandatory' },
    { pluginId: 'plugin-plagiarism-check', name: 'Plagiarism Detection', category: 'UTILITY', author: 'Assessment Team', enabled: true, tier: 'mandatory' },

    // ===== MANDATORY PLUGINS (Communication & Analytics) =====
    { pluginId: 'plugin-forum-system', name: 'Forum System', category: 'COMMUNICATION', author: 'Community Team', enabled: true, tier: 'mandatory' },
    { pluginId: 'plugin-learner-engagement', name: 'Learner Engagement Metrics', category: 'ANALYTICS', author: 'Analytics Team', enabled: true, tier: 'mandatory' },
    { pluginId: 'plugin-moodle-bridge', name: 'Moodle Bridge', category: 'INTEGRATIONS', author: 'Integration Team', enabled: true, tier: 'mandatory' },

    // ===== MANDATORY PLUGINS (Payments) =====
    { pluginId: 'plugin-subscription-mgmt', name: 'Subscription Management', category: 'PAYMENTS', author: 'Payments Team', enabled: true, tier: 'mandatory' },
    { pluginId: 'plugin-razorpay-payment', name: 'Razorpay Payments', category: 'PAYMENTS', author: 'Payments Team', enabled: true, tier: 'mandatory' },

    // ===== RECOMMENDED PLUGINS =====
    { pluginId: 'plugin-ldap-sync', name: 'LDAP User Sync', category: 'USERMGMT', author: 'User Management Team', enabled: true, tier: 'recommended' },
    { pluginId: 'plugin-sso-saml', name: 'SSO (SAML)', category: 'USERMGMT', author: 'User Management Team', enabled: true, tier: 'recommended' },
    { pluginId: 'plugin-interactive-lessons', name: 'Interactive Lessons', category: 'CONTENT', author: 'Content Team', enabled: true, tier: 'recommended' },
    { pluginId: 'plugin-course-branching', name: 'Course Branching Logic', category: 'CONTENT', author: 'Content Team', enabled: true, tier: 'recommended' },
    { pluginId: 'plugin-scorm-support', name: 'SCORM Support', category: 'CONTENT', author: 'Standards Team', enabled: true, tier: 'recommended' },
    { pluginId: 'plugin-zoom-integration', name: 'Zoom Integration', category: 'INTEGRATIONS', author: 'Integration Team', enabled: true, tier: 'recommended' },
    { pluginId: 'plugin-peer-review', name: 'Peer Review System', category: 'USERMGMT', author: 'Assessment Team', enabled: true, tier: 'recommended' },
    { pluginId: 'plugin-email-notifications', name: 'Email Notifications', category: 'COMMUNICATION', author: 'Notifications Team', enabled: true, tier: 'recommended' },
    { pluginId: 'plugin-real-time-stats', name: 'Real-time Statistics', category: 'ANALYTICS', author: 'Analytics Team', enabled: true, tier: 'recommended' },
    { pluginId: 'plugin-reporting-engine', name: 'Advanced Reporting Engine', category: 'ANALYTICS', author: 'Analytics Team', enabled: true, tier: 'recommended' },
    { pluginId: 'plugin-data-visualization', name: 'Data Visualization Dashboard', category: 'ANALYTICS', author: 'Analytics Team', enabled: true, tier: 'recommended' },
    { pluginId: 'plugin-certificate-generator', name: 'Certificate Generator', category: 'UTILITY', author: 'Admin Team', enabled: true, tier: 'recommended' },
    { pluginId: 'plugin-adaptive-learning', name: 'Adaptive Learning Paths', category: 'AI', author: 'AI Team', enabled: true, tier: 'recommended' },
    { pluginId: 'plugin-stripe-payment', name: 'Stripe Payments', category: 'PAYMENTS', author: 'Payments Team', enabled: true, tier: 'recommended' },
    { pluginId: 'plugin-oauth-integration', name: 'OAuth Integration', category: 'INTEGRATIONS', author: 'Integration Team', enabled: true, tier: 'recommended' },
    { pluginId: 'plugin-grade-sync', name: 'Grade Synchronization', category: 'INTEGRATIONS', author: 'Integration Team', enabled: true, tier: 'recommended' },

    // ===== OPTIONAL PLUGINS =====
    { pluginId: 'plugin-social-learning', name: 'Social Learning', category: 'COMMUNICATION', author: 'Community Team', enabled: false, tier: 'optional' },
    { pluginId: 'plugin-sms-alerts', name: 'SMS Alerts', category: 'COMMUNICATION', author: 'Notifications Team', enabled: false, tier: 'optional' },
    { pluginId: 'plugin-attendance-tracking', name: 'Attendance Tracking', category: 'ANALYTICS', author: 'Analytics Team', enabled: false, tier: 'optional' },
    { pluginId: 'plugin-content-recommender', name: 'Content Recommender', category: 'AI', author: 'AI Team', enabled: false, tier: 'optional' },
    { pluginId: 'plugin-chatbot', name: 'AI Chatbot Support', category: 'AI', author: 'AI Team', enabled: false, tier: 'optional' },
    { pluginId: 'plugin-video-hosting', name: 'Video Hosting Integration', category: 'CONTENT', author: 'Media Team', enabled: false, tier: 'optional' },
    { pluginId: 'plugin-gamification-system', name: 'Gamification System', category: 'GAMIFICATION', author: 'Engagement Team', enabled: false, tier: 'optional' },
    { pluginId: 'plugin-proctoring', name: 'AI Proctoring', category: 'UTILITY', author: 'Proctoring Team', enabled: false, tier: 'optional' },
    { pluginId: 'plugin-accessibility', name: 'Accessibility Enhancement', category: 'UTILITY', author: 'Accessibility Team', enabled: false, tier: 'optional' },
    { pluginId: 'plugin-mobile-app', name: 'Mobile App Sync', category: 'UTILITY', author: 'Mobile Team', enabled: false, tier: 'optional' },
    { pluginId: 'plugin-offline-mode', name: 'Offline Mode', category: 'UTILITY', author: 'Mobile Team', enabled: false, tier: 'optional' },
    { pluginId: 'plugin-white-label', name: 'White Label Customization', category: 'UTILITY', author: 'Customization Team', enabled: false, tier: 'optional' },
    { pluginId: 'plugin-teams-integration', name: 'Microsoft Teams Integration', category: 'INTEGRATIONS', author: 'Integration Team', enabled: false, tier: 'optional' },
    { pluginId: 'plugin-slack-integration', name: 'Slack Integration', category: 'INTEGRATIONS', author: 'Integration Team', enabled: false, tier: 'optional' },
    { pluginId: 'plugin-google-classroom', name: 'Google Classroom Sync', category: 'INTEGRATIONS', author: 'Integration Team', enabled: false, tier: 'optional' },
    { pluginId: 'plugin-canvas-integration', name: 'Canvas LMS Integration', category: 'INTEGRATIONS', author: 'Integration Team', enabled: false, tier: 'optional' },
    { pluginId: 'plugin-blackboard-integration', name: 'Blackboard Integration', category: 'INTEGRATIONS', author: 'Integration Team', enabled: false, tier: 'optional' },
  ];

  let mandatoryCount = 0;
  let recommendedCount = 0;
  let optionalCount = 0;

  for (const config of pluginConfigs) {
    try {
      const updated = await prisma.plugin.update({
        where: { pluginId: config.pluginId },
        data: {
          enabled: config.enabled,
        },
      });

      if (config.tier === 'mandatory') {
        mandatoryCount++;
        console.log(`✅ [MANDATORY] ${config.name} - ENABLED`);
      } else if (config.tier === 'recommended') {
        recommendedCount++;
        console.log(`⭐ [RECOMMENDED] ${config.name} - ${config.enabled ? 'ENABLED' : 'disabled'}`);
      } else {
        optionalCount++;
        console.log(`🔧 [OPTIONAL] ${config.name} - ${config.enabled ? 'enabled' : 'DISABLED'}`);
      }
    } catch (error: any) {
      console.warn(`⚠️  Could not update ${config.name}: ${error.message}`);
    }
  }

  // Get statistics
  const stats = await prisma.plugin.groupBy({
    by: ['enabled'],
    _count: true,
  });

  console.log('\n' + '='.repeat(60));
  console.log('📊 PLUGIN SETUP SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Mandatory Plugins Configured: ${mandatoryCount}`);
  console.log(`⭐ Recommended Plugins Configured: ${recommendedCount}`);
  console.log(`🔧 Optional Plugins Configured: ${optionalCount}`);
  console.log(`\n📈 Current Status:`);
  stats.forEach((stat) => {
    const status = stat.enabled ? '🟢 ENABLED' : '🔴 DISABLED';
    console.log(`   ${status}: ${stat._count} plugins`);
  });
  console.log('='.repeat(60) + '\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during plugin setup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

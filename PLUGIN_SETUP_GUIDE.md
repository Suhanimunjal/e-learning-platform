# 🚀 LMS Plugin Management - Complete Setup Guide

## Overview

This guide provides complete information about the LMS plugin system, including:
- Plugin setup and configuration
- Mandatory vs. Optional plugins
- API endpoints for plugin management
- Quick-start scripts for D drive setup

---

## 📋 Plugin Categories & Tiers

### Tier 1: ✅ MANDATORY (16 plugins)
**These plugins MUST be enabled for core LMS functionality:**

#### Core Admin & Settings
- ✅ Backup & Restore
- ✅ Theme Builder
- ✅ Custom User Fields

#### User Management (Core)
- ✅ Bulk User Import
- ✅ Advanced Role Permissions

#### Content & Assessment (Core)
- ✅ Question Bank Management
- ✅ Interactive Quizzes
- ✅ Content Library
- ✅ Advanced Assessment Tools
- ✅ Rubric-based Grading
- ✅ Plagiarism Detection

#### Communication & Analytics (Core)
- ✅ Forum System
- ✅ Learner Engagement Metrics

#### Integrations & Payments (Core)
- ✅ Moodle Bridge
- ✅ Subscription Management
- ✅ Razorpay Payments

---

### Tier 2: ⭐ RECOMMENDED (16 plugins)
**These plugins are highly recommended for enhanced functionality:**

#### User Management (Advanced)
- ⭐ LDAP User Sync
- ⭐ SSO (SAML)
- ⭐ Peer Review System

#### Content & Learning (Advanced)
- ⭐ Interactive Lessons
- ⭐ Course Branching Logic
- ⭐ SCORM Support

#### Analytics & Reporting (Advanced)
- ⭐ Real-time Statistics
- ⭐ Advanced Reporting Engine
- ⭐ Data Visualization Dashboard
- ⭐ Adaptive Learning Paths

#### Communication (Advanced)
- ⭐ Email Notifications

#### Admin & Utility (Advanced)
- ⭐ Certificate Generator

#### Integrations (Advanced)
- ⭐ Zoom Integration
- ⭐ OAuth Integration
- ⭐ Grade Synchronization

#### Payments (Advanced)
- ⭐ Stripe Payments

---

### Tier 3: 🔧 OPTIONAL (17 plugins)
**These plugins can be enabled based on specific needs:**

#### Communication
- 🔧 Social Learning
- 🔧 SMS Alerts

#### Analytics
- 🔧 Attendance Tracking

#### AI & Automation
- 🔧 Content Recommender
- 🔧 AI Chatbot Support

#### Content
- 🔧 Video Hosting Integration

#### Engagement
- 🔧 Gamification System

#### Assessment
- 🔧 AI Proctoring

#### Accessibility & Mobile
- 🔧 Accessibility Enhancement
- 🔧 Mobile App Sync
- 🔧 Offline Mode

#### Customization
- 🔧 White Label Customization

#### Integrations
- 🔧 Microsoft Teams Integration
- 🔧 Slack Integration
- 🔧 Google Classroom Sync
- 🔧 Canvas LMS Integration
- 🔧 Blackboard Integration

---

## 🎯 Current Setup Status

**Location:** `D:\e-learningapp\apps\backend`

**Last Updated:** March 19, 2026

### Status Summary
- ✅ **ENABLED:** 34 plugins (16 Mandatory + 16 Recommended + 2 Optional)
- 🔴 **DISABLED:** 18 plugins (15 Optional + 2 Optional with special requirements)
- 📊 **Total:** 52 plugins available

---

## 🔧 API Endpoints for Plugin Management

### Base URL
```
http://localhost:3001/api/plugins
```

### 1. Get All Installed Plugins
```
GET /plugins/installed
```

**Response:**
```json
[
  {
    "id": "plugin-theme-builder",
    "name": "Theme Builder",
    "category": "UTILITY",
    "enabled": true,
    "version": "1.0.0",
    "author": "Design Team"
  }
]
```

---

### 2. Get Available Plugins (by category)
```
GET /plugins/available?category=CONTENT
```

**Query Parameters:**
- `category` (optional): CONTENT, ANALYTICS, COMMUNICATION, USERMGMT, GAMIFICATION, PAYMENTS, INTEGRATIONS, AI, UTILITY, or ALL

**Response:**
```json
[
  {
    "id": "plugin-question-bank",
    "name": "Question Bank Management",
    "category": "CONTENT",
    "isInstalled": true,
    "features": ["Create questions", "Organize question sets", "Export questions"]
  }
]
```

---

### 3. Toggle Plugin (Enable/Disable)
```
PATCH /plugins/{pluginId}/toggle
```

**Request Body:**
```json
{
  "enabled": true
}
```

**Response:**
```json
{
  "message": "Plugin enabled",
  "plugin": {
    "id": "plugin-social-learning",
    "name": "Social Learning",
    "enabled": true
  }
}
```

---

### 4. Install a Plugin
```
POST /plugins/install
```

**Request Body:**
```json
{
  "pluginId": "plugin-attendance-tracking"
}
```

**Response:**
```json
{
  "message": "Plugin installed successfully",
  "plugin": {
    "id": "plugin-attendance-tracking",
    "name": "Attendance Tracking",
    "enabled": false
  }
}
```

---

### 5. Uninstall a Plugin
```
DELETE /plugins/{pluginId}
```

**Response:**
```json
{
  "message": "Plugin uninstalled successfully"
}
```

---

### 6. Configure Plugin
```
PATCH /plugins/{pluginId}/config
```

**Request Body:**
```json
{
  "apiKey": "your-api-key",
  "enabled": true
}
```

**Response:**
```json
{
  "message": "Plugin configured successfully",
  "plugin": {
    "id": "plugin-razorpay-payment",
    "config": {
      "apiKey": "your-api-key"
    }
  }
}
```

---

### 7. Get Plugin Statistics
```
GET /plugins/stats
```

**Response:**
```json
{
  "totalPlugins": 50,
  "installedPlugins": 50,
  "enabledPlugins": 34,
  "byCategory": [
    {
      "category": "CONTENT",
      "available": 8,
      "installed": 8
    }
  ]
}
```

---

## 🚀 Quick Setup Scripts

### Script 1: Run Complete Plugin Setup
```bash
cd D:\e-learningapp\apps\backend
npx ts-node prisma/seed-plugins.ts
```

**What it does:**
- ✅ Enables all 16 Mandatory plugins
- ⭐ Enables all 16 Recommended plugins
- 🔧 Keeps 15 Optional plugins disabled

---

### Script 2: Enable a Specific Plugin
```bash
# Using API endpoint
curl -X PATCH http://localhost:3001/api/plugins/plugin-social-learning/toggle \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"enabled": true}'
```

---

### Script 3: Enable All Optional Plugins
```bash
# Create a bash script: enable-optional-plugins.sh
#!/bin/bash

OPTIONAL_PLUGINS=(
  "plugin-social-learning"
  "plugin-sms-alerts"
  "plugin-attendance-tracking"
  "plugin-content-recommender"
  "plugin-chatbot"
  "plugin-video-hosting"
  "plugin-gamification-system"
  "plugin-proctoring"
  "plugin-accessibility"
  "plugin-mobile-app"
  "plugin-offline-mode"
  "plugin-white-label"
  "plugin-teams-integration"
  "plugin-slack-integration"
  "plugin-google-classroom"
  "plugin-canvas-integration"
  "plugin-blackboard-integration"
)

for plugin in "${OPTIONAL_PLUGINS[@]}"; do
  curl -X PATCH http://localhost:3001/api/plugins/$plugin/toggle \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -d '{"enabled": true}'
  echo "Enabled: $plugin"
done
```

---

## 🎛️ Plugin Configuration Examples

### Razorpay Payment Configuration
```bash
curl -X PATCH http://localhost:3001/api/plugins/plugin-razorpay-payment/config \
  -H "Content-Type: application/json" \
  -d '{
    "keyId": "rzp_live_your_key",
    "keySecret": "your_secret_key",
    "enabled": true
  }'
```

### Stripe Payment Configuration
```bash
curl -X PATCH http://localhost:3001/api/plugins/plugin-stripe-payment/config \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "sk_live_your_key",
    "publicKey": "pk_live_your_key",
    "enabled": true
  }'
```

### LDAP Configuration
```bash
curl -X PATCH http://localhost:3001/api/plugins/plugin-ldap-sync/config \
  -H "Content-Type: application/json" \
  -d '{
    "serverUrl": "ldap://your-server.com",
    "baseDn": "dc=example,dc=com",
    "bindDn": "cn=admin,dc=example,dc=com",
    "bindPassword": "password",
    "enabled": true
  }'
```

---

## 📊 Plugin Installation Workflow

```
┌─────────────────────────────────────────────┐
│     Initial Setup (All Mandatory)           │
│     16 plugins ENABLED                      │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│   Phase 1: Recommended (16 plugins)         │
│     ENABLED to enhance functionality        │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│   Phase 2: Optional (17 plugins)            │
│     DISABLED by default, enable as needed   │
└─────────────────────────────────────────────┘
```

---

## ✅ Verification Checklist

After running the plugin setup:

- [ ] Visit `http://localhost:3000/dashboard/admin/plugins`
- [ ] Verify 34 plugins are shown as enabled
- [ ] Check that mandatory plugins cannot be disabled (locked)
- [ ] Optional plugins show as available for installation
- [ ] Plugin categories display correctly
- [ ] Click on each mandatory plugin to verify details
- [ ] Test enabling an optional plugin via UI
- [ ] Verify statistics dashboard shows accurate counts

---

## 🔐 Admin Access

**Default Admin Credentials:**
- Email: `admin@lms.com`
- Password: `Test@123`

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `prisma/seed-plugins.ts` | Main plugin setup script |
| `src/plugins/plugins.service.ts` | Plugin management service |
| `src/plugins/plugins.controller.ts` | API endpoints |
| `src/plugins/available-plugins.ts` | Plugin definitions |

---

## 🆘 Troubleshooting

### Issue: Plugins not showing in UI
**Solution:** 
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Restart backend server

### Issue: Plugin enable/disable not working
**Solution:**
1. Check authentication token
2. Verify admin permissions
3. Check browser console for errors

### Issue: Plugin configuration errors
**Solution:**
1. Verify required fields are provided
2. Check plugin documentation for required config
3. Review logs in browser console

---

## 📞 Support

For issues or questions about plugins, check:
- Plugin configuration logs in browser console
- Backend logs at `apps/backend/dist/main.js`
- Database plugin records in PostgreSQL

---

**Generated:** March 19, 2026
**LMS Version:** 1.0.0
**Total Plugins:** 50

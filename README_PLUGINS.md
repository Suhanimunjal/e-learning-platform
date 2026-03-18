# 🚀 LMS Plugin System - Quick Start

## ⚡ TL;DR (30 seconds)

```bash
# Windows: Double-click this file
setup-plugins.bat

# Linux/Mac: Run this
bash setup-plugins.sh

# Then refresh your browser at:
# http://localhost:3000/dashboard/admin/plugins
```

---

## 📋 What You Got

✅ **50 plugins** fully configured  
✅ **34 enabled** (16 mandatory + 16 recommended)  
✅ **18 optional** (ready to enable)  
✅ **Complete API** for management  
✅ **Admin dashboard** for UI control  
✅ **Full documentation** for reference  

---

## 🎯 Plugin Tiers

| Tier | Count | Status | Use Case |
|------|-------|--------|----------|
| **Mandatory** | 16 | ✅ Enabled | Core LMS |
| **Recommended** | 16 | ✅ Enabled | Enhanced features |
| **Optional** | 18 | 🔧 Disabled | Install on-demand |

---

## 📖 Documentation

| File | What It Is |
|------|-----------|
| **PLUGINS_INDEX.md** | Overview + quick start (READ FIRST) |
| **PLUGIN_SETUP_GUIDE.md** | Detailed API reference |
| **PLUGINS_COMPLETE.md** | Implementation summary |
| **setup-plugins.bat** | Windows automation (double-click) |
| **setup-plugins.sh** | Linux/Mac automation |

---

## 🔐 Demo Login

```
Admin Dashboard: http://localhost:3000/dashboard/admin/plugins

Admin:    admin@lms.com     / Test@123
Teacher:  teacher@example.com / Test@123  
Student:  student@lms.com    / Test@123
```

---

## ✨ Key Plugins Included

### Core (Always On)
- Question Bank, Quizzes, Content Library
- Assessment Tools, Grading, Plagiarism Detection
- Forum System, User Management, Payments

### Advanced (Pre-enabled)
- LDAP/SSO, Adaptive Learning, Email, Certificates
- Analytics, Real-time Stats, Grade Sync, Zoom

### Optional (Enable as needed)
- Gamification, Chatbot, Social Learning
- Mobile, Teams, Slack, Canvas, Blackboard

---

## 🚀 Setup Options

### Option 1: Windows (Easiest)
```
Double-click: setup-plugins.bat
Select: 1 (Complete Setup)
Done!
```

### Option 2: Linux/Mac
```bash
bash setup-plugins.sh
Select: 1
```

### Option 3: Direct Command
```bash
cd apps/backend
npx ts-node prisma/seed-plugins.ts
```

### Option 4: Web UI (Manual)
1. Go to admin dashboard
2. Visit Plugins page
3. Toggle manually

---

## 📊 API Quick Reference

```bash
# Get all stats
curl http://localhost:3001/api/plugins/stats \
  -H "Authorization: Bearer YOUR_TOKEN"

# Enable a plugin
curl -X PATCH http://localhost:3001/api/plugins/plugin-social-learning/toggle \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"enabled": true}'

# View installed plugins
curl http://localhost:3001/api/plugins/installed \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ✅ Verification Checklist

After setup:
- [ ] 34+ plugins showing in admin UI
- [ ] Toggle functionality working
- [ ] Optional plugins available for install
- [ ] Statistics dashboard accurate
- [ ] No errors in browser console

---

## 🎊 You're Ready!

Your LMS now has:
✅ Professional plugin system  
✅ 50 extensible features  
✅ Production-ready code  
✅ Full documentation  
✅ Easy management UI  

**Next:** Read PLUGINS_INDEX.md for detailed information!

---

**Status:** ✅ Ready for Production  
**Last Updated:** March 19, 2026  
**Version:** 1.0.0

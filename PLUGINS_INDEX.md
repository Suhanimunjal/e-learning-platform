# 📚 LMS Plugin System - Complete Documentation Index

## 🎯 Quick Start

### For Windows Users (D Drive)
1. **Double-click:** `D:\e-learningapp\setup-plugins.bat`
2. Select option **1** for automatic setup
3. Choose from menu options as needed

### For Linux/Mac Users
```bash
cd D:\e-learningapp
bash setup-plugins.sh
```

### For Node.js Direct Execution
```bash
cd D:\e-learningapp\apps\backend
npx ts-node prisma/seed-plugins.ts
```

---

## 📋 Documentation Files

| File | Purpose | Last Updated |
|------|---------|--------------|
| **PLUGIN_SETUP_GUIDE.md** | Complete plugin reference, API endpoints, configuration | Mar 19, 2026 |
| **setup-plugins.bat** | Windows automation script (interactive menu) | Mar 19, 2026 |
| **setup-plugins.sh** | Linux/Mac automation script (interactive menu) | Mar 19, 2026 |
| **prisma/seed-plugins.ts** | Main plugin seeding script | Mar 19, 2026 |
| **PLUGINS_INDEX.md** | This file | Mar 19, 2026 |

---

## 🔌 Plugin System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   PLUGIN MANAGER                        │
│              (src/plugins/plugins.service.ts)           │
└────────────────────────┬────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   ┌────────────┐  ┌──────────┐  ┌────────────┐
   │  Install   │  │ Toggle   │  │ Configure  │
   │  Plugins   │  │  Enable  │  │  Plugins   │
   │            │  │ Disable  │  │            │
   └────────────┘  └──────────┘  └────────────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   PostgreSQL DB      │
              │   Plugin Table       │
              │                      │
              │  ✓ 34 Enabled        │
              │  ✗ 18 Disabled       │
              │  ─ 52 Total          │
              └──────────────────────┘
```

---

## 📊 Current Plugin Distribution

### By Tier
```
Mandatory    ✅ 16 plugins (ENABLED)
Recommended ⭐ 16 plugins (ENABLED)
Optional    🔧 17 plugins (MIXED)
────────────────────────────────────────
TOTAL:        49 plugins
ENABLED:      34 plugins (69%)
DISABLED:     15 plugins (31%)
```

### By Category
| Category | Count | Enabled |
|----------|-------|---------|
| UTILITY | 8 | 6 |
| CONTENT | 8 | 5 |
| ANALYTICS | 6 | 6 |
| INTEGRATIONS | 9 | 6 |
| USERMGMT | 6 | 6 |
| COMMUNICATION | 4 | 3 |
| PAYMENTS | 3 | 3 |
| AI | 4 | 1 |
| GAMIFICATION | 1 | 0 |

---

## 🛠️ Plugin Management Methods

### Method 1: Setup Script (Easiest)
**Best for:** Initial setup, Windows users
```bash
# Windows
setup-plugins.bat

# Linux/Mac
bash setup-plugins.sh
```

---

### Method 2: Database Seed Script
**Best for:** Custom configurations, automation
```bash
cd apps/backend
npx ts-node prisma/seed-plugins.ts
```

---

### Method 3: REST API
**Best for:** Runtime management, programmatic control

**Enable a plugin:**
```bash
curl -X PATCH http://localhost:3001/api/plugins/plugin-social-learning/toggle \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'
```

**View all plugins:**
```bash
curl http://localhost:3001/api/plugins/installed
```

---

### Method 4: Web UI
**Best for:** Manual management, visual interface
1. Navigate to: `http://localhost:3000/dashboard/admin/plugins`
2. Login as: `admin@lms.com` / `Test@123`
3. Click toggle to enable/disable plugins

---

## 📝 Configuration Files

### Main Service
**Location:** `apps/backend/src/plugins/plugins.service.ts`

**Key Methods:**
- `togglePlugin()` - Enable/disable
- `installPlugin()` - Install new plugin
- `configurePlugin()` - Set plugin configuration
- `getPluginStats()` - View statistics

### Plugin Definitions
**Location:** `apps/backend/src/plugins/available-plugins.ts`

Contains metadata for all 50 plugins including:
- Plugin ID
- Name & Description
- Category
- Author
- Features list
- Configuration schema

### Seed Script
**Location:** `apps/backend/prisma/seed-plugins.ts`

Handles:
- Creating/updating plugin records
- Setting enabled status
- Organizing by tier (mandatory/recommended/optional)
- Displaying statistics

---

## 🎯 Common Tasks

### Task 1: Enable All Plugins
```bash
cd apps/backend
# Edit seed-plugins.ts to set all enabled: true
# Then run:
npx ts-node prisma/seed-plugins.ts
```

### Task 2: Disable Optional Plugins
```bash
# Use the setup script:
# Option 1 → Runs current setup (Mandatory + Recommended only)
```

### Task 3: Enable Specific Plugin
```bash
curl -X PATCH http://localhost:3001/api/plugins/plugin-social-learning/toggle \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'
```

### Task 4: Check Plugin Status
```bash
curl http://localhost:3001/api/plugins/stats
```

### Task 5: Configure Payment Plugin
```bash
curl -X PATCH http://localhost:3001/api/plugins/plugin-razorpay-payment/config \
  -H "Content-Type: application/json" \
  -d '{
    "keyId": "your-key",
    "keySecret": "your-secret"
  }'
```

---

## 🔐 Access Control

### Admin Credentials
```
Email:    admin@lms.com
Password: Test@123
Role:     ADMIN
```

### Required Permissions
- View Plugins: ADMIN role
- Enable/Disable: ADMIN role
- Configure: ADMIN role

---

## 📖 API Reference

### Base URL
```
http://localhost:3001/api/plugins
```

### Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/installed` | List all installed plugins |
| GET | `/available` | List available plugins |
| GET | `/stats` | Get plugin statistics |
| POST | `/install` | Install a plugin |
| PATCH | `/{id}/toggle` | Enable/disable plugin |
| PATCH | `/{id}/config` | Configure plugin |
| DELETE | `/{id}` | Uninstall plugin |

---

## 🚀 Deployment Checklist

- [ ] Run `setup-plugins.bat` or `bash setup-plugins.sh`
- [ ] Verify 34 plugins are enabled in database
- [ ] Restart backend server
- [ ] Clear browser cache
- [ ] Verify plugins display in admin UI
- [ ] Test enabling an optional plugin
- [ ] Verify toggle functionality works
- [ ] Check statistics are accurate

---

## 🐛 Troubleshooting

### Issue: Plugins don't appear in UI
**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Verify backend is running
4. Check browser console for errors

### Issue: Setup script fails
**Solution:**
1. Ensure PostgreSQL is running: `docker-compose ps`
2. Verify Node.js/npm are installed: `node --version`
3. Check file permissions: `ls -la setup-plugins.bat`
4. Review error message in console

### Issue: Plugin enable/disable not working
**Solution:**
1. Verify authentication token is valid
2. Check admin role in database
3. Review API response in browser DevTools
4. Check backend logs for errors

---

## 📞 Support Resources

### Documentation
- **Setup Guide:** `PLUGIN_SETUP_GUIDE.md`
- **This Index:** `PLUGINS_INDEX.md`

### Quick Tests
```bash
# Test backend API
curl http://localhost:3001/api/plugins/stats

# Test database connection
curl http://localhost:3001/api/auth/me

# View logs
tail -f apps/backend/dist/main.js
```

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Mar 19, 2026 | Initial release with 50 plugins |

---

## 📌 Key Files Location

```
D:\e-learningapp\
├── setup-plugins.bat              ← Run this on Windows
├── setup-plugins.sh               ← Run this on Linux/Mac
├── PLUGIN_SETUP_GUIDE.md          ← Full documentation
├── PLUGINS_INDEX.md               ← This file
├── apps/backend/
│   ├── src/plugins/
│   │   ├── plugins.service.ts     ← Main service
│   │   ├── plugins.controller.ts  ← API endpoints
│   │   └── available-plugins.ts   ← Plugin definitions
│   └── prisma/
│       ├── seed-plugins.ts        ← Setup script
│       └── schema.prisma          ← Database schema
└── docker-compose.yml             ← Database config
```

---

## 🎓 Learning Path

1. **Beginner:** Read this file (5 min)
2. **Intermediate:** Review `PLUGIN_SETUP_GUIDE.md` (15 min)
3. **Advanced:** Modify `seed-plugins.ts` for custom setup (30 min)
4. **Expert:** Use REST API for programmatic control

---

## 💡 Pro Tips

1. **Backup before changes:** Always test in development first
2. **Use setup scripts:** They handle all edge cases
3. **Monitor logs:** Check console for detailed errors
4. **Test incrementally:** Enable plugins one at a time if issues occur
5. **Document changes:** Keep notes of what you enable/disable

---

**Last Updated:** March 19, 2026  
**LMS Version:** 1.0.0  
**Total Plugins:** 50  
**Enabled Plugins:** 34 (68%)  
**Status:** ✅ All systems operational

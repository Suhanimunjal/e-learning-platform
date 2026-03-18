@echo off
REM LMS Plugin Setup Script for Windows D Drive
REM Location: D:\e-learningapp\setup-plugins.bat
REM Usage: Double-click or run: setup-plugins.bat

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║          🚀 LMS PLUGIN SETUP SCRIPT v1.0                  ║
echo ║     Automated Plugin Configuration for D:\e-learningapp  ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if we're in the right directory
if not exist "apps\backend\prisma\seed-plugins.ts" (
    echo ❌ Error: Not in the e-learningapp directory
    echo Please run this script from: D:\e-learningapp
    pause
    exit /b 1
)

echo 📁 Current Directory: %CD%
echo.

REM Check if Node.js and npm are installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm is not installed
    pause
    exit /b 1
)

echo ✓ Node.js and npm found
echo.

REM Navigate to backend directory
cd apps\backend

echo 📊 PLUGIN SETUP OPTIONS
echo.
echo 1. Run Complete Setup (Mandatory + Recommended plugins)
echo 2. Enable Only Mandatory Plugins
echo 3. Enable All Plugins (Mandatory + Recommended + Optional)
echo 4. View Current Plugin Status
echo 5. Exit
echo.

set /p option="Select option (1-5): "

if "%option%"=="1" (
    echo 🔄 Running complete plugin setup...
    call npx ts-node prisma\seed-plugins.ts
    goto end
)

if "%option%"=="2" (
    echo 🔄 Running complete setup (edit seed-plugins.ts to customize for mandatory only)...
    call npx ts-node prisma\seed-plugins.ts
    goto end
)

if "%option%"=="3" (
    echo 🔄 Creating script to enable all plugins...
    
    REM Create temporary script
    (
        echo import { PrismaClient } from '@prisma/client';
        echo import { PrismaPg } from '@prisma/adapter-pg';
        echo import { Pool } from 'pg';
        echo import * as dotenv from 'dotenv';
        echo.
        echo dotenv.config({ path: __dirname + '/../.env' });
        echo.
        echo const pool = new Pool({
        echo   host: 'localhost',
        echo   port: 5432,
        echo   database: 'lms_db',
        echo   user: 'lms_user',
        echo   password: 'lms_password',
        echo });
        echo.
        echo const adapter = new PrismaPg(pool);
        echo const prisma = new PrismaClient({ adapter });
        echo.
        echo async function main() {
        echo   const updated = await prisma.plugin.updateMany({
        echo     data: { enabled: true },
        echo   });
        echo   console.log(`✅ Enabled ${updated.count} plugins`);
        echo }
        echo.
        echo main()
        echo   .catch(e => console.error(e))
        echo   .finally(() => prisma.$disconnect());
    ) > enable-all-plugins.ts
    
    call npx ts-node enable-all-plugins.ts
    del enable-all-plugins.ts
    goto end
)

if "%option%"=="4" (
    echo 📈 Getting plugin status...
    
    REM Create temporary script
    (
        echo import { PrismaClient } from '@prisma/client';
        echo import { PrismaPg } from '@prisma/adapter-pg';
        echo import { Pool } from 'pg';
        echo import * as dotenv from 'dotenv';
        echo.
        echo dotenv.config({ path: __dirname + '/../.env' });
        echo.
        echo const pool = new Pool({
        echo   host: 'localhost',
        echo   port: 5432,
        echo   database: 'lms_db',
        echo   user: 'lms_user',
        echo   password: 'lms_password',
        echo });
        echo.
        echo const adapter = new PrismaPg(pool);
        echo const prisma = new PrismaClient({ adapter });
        echo.
        echo async function main() {
        echo   const stats = await prisma.plugin.groupBy({
        echo     by: ['enabled'],
        echo     _count: true,
        echo   });
        echo.
        echo   const total = await prisma.plugin.count();
        echo   const byCategory = await prisma.plugin.groupBy({
        echo     by: ['category'],
        echo     _count: true,
        echo   });
        echo.
        echo   console.log('\n📊 Plugin Status Report');
        echo   console.log('═══════════════════════════════════════');
        echo   console.log(`Total Plugins: ${total}`);
        echo   stats.forEach(stat => {
        echo     const status = stat.enabled ? '🟢 ENABLED' : '🔴 DISABLED';
        echo     console.log(`${status}: ${stat._count}`);
        echo   });
        echo   
        echo   console.log('\n📁 By Category:');
        echo   byCategory.forEach(cat => {
        echo     console.log(`   ${cat.category}: ${cat._count}`);
        echo   });
        echo   console.log('═══════════════════════════════════════\n');
        echo }
        echo.
        echo main()
        echo   .catch(e => console.error(e))
        echo   .finally(() => prisma.$disconnect());
    ) > plugin-status.ts
    
    call npx ts-node plugin-status.ts
    del plugin-status.ts
    goto end
)

if "%option%"=="5" (
    echo 👋 Exiting setup script
    exit /b 0
)

echo ❌ Invalid option. Please select 1-5
pause
exit /b 1

:end
echo.
echo ✅ Plugin setup completed!
echo.
echo 📝 Next Steps:
echo 1. Restart the backend server: npm run start:dev
echo 2. Refresh the frontend at http://localhost:3000
echo 3. Go to Admin Dashboard > Plugin Management
echo 4. Verify plugins are enabled/disabled as configured
echo.
echo 💡 To manage plugins via API:
echo    See PLUGIN_SETUP_GUIDE.md for API endpoints
echo.
pause

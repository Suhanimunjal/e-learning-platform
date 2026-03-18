#!/bin/bash
# LMS Plugin Setup Script for Windows D Drive
# Location: D:\e-learningapp\setup-plugins.sh
# Usage: bash setup-plugins.sh

echo "╔════════════════════════════════════════════════════════════╗"
echo "║          🚀 LMS PLUGIN SETUP SCRIPT v1.0                  ║"
echo "║     Automated Plugin Configuration for D:\e-learningapp  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "apps/backend/prisma/seed-plugins.ts" ]; then
    echo -e "${RED}❌ Error: Not in the e-learningapp directory${NC}"
    echo "Please run this script from: D:\e-learningapp"
    exit 1
fi

echo -e "${BLUE}📁 Current Directory: $(pwd)${NC}"
echo ""

# Check if Node.js and npm are installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js and npm found${NC}"
echo ""

# Navigate to backend directory
cd apps/backend || exit 1

echo -e "${BLUE}📊 PLUGIN SETUP OPTIONS${NC}"
echo "1. Run Complete Setup (Mandatory + Recommended plugins)"
echo "2. Enable Only Mandatory Plugins"
echo "3. Enable All Plugins (Mandatory + Recommended + Optional)"
echo "4. View Current Plugin Status"
echo "5. Exit"
echo ""

read -p "Select option (1-5): " option

case $option in
    1)
        echo -e "${YELLOW}🔄 Running complete plugin setup...${NC}"
        npx ts-node prisma/seed-plugins.ts
        ;;
    2)
        echo -e "${YELLOW}🔄 Running mandatory plugins only setup...${NC}"
        echo "Note: Using complete setup script (edit seed-plugins.ts to customize)"
        npx ts-node prisma/seed-plugins.ts
        ;;
    3)
        echo -e "${YELLOW}🔄 Enabling all plugins...${NC}"
        echo "Creating temporary script..."
        
        # Create temporary script to enable all plugins
        cat > /tmp/enable-all-plugins.ts << 'EOF'
import { PrismaClient } from '@prisma/client';
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

async function main() {
  const updated = await prisma.plugin.updateMany({
    data: { enabled: true },
  });
  console.log(`✅ Enabled ${updated.count} plugins`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
EOF
        
        npx ts-node /tmp/enable-all-plugins.ts
        rm /tmp/enable-all-plugins.ts
        ;;
    4)
        echo -e "${YELLOW}📈 Getting plugin status...${NC}"
        cat > /tmp/plugin-status.ts << 'EOF'
import { PrismaClient } from '@prisma/client';
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

async function main() {
  const stats = await prisma.plugin.groupBy({
    by: ['enabled'],
    _count: true,
  });

  const total = await prisma.plugin.count();
  const byCategory = await prisma.plugin.groupBy({
    by: ['category'],
    _count: true,
  });

  console.log('\n📊 Plugin Status Report');
  console.log('═══════════════════════════════════════');
  console.log(`Total Plugins: ${total}`);
  stats.forEach(stat => {
    const status = stat.enabled ? '🟢 ENABLED' : '🔴 DISABLED';
    console.log(`${status}: ${stat._count}`);
  });
  
  console.log('\n📁 By Category:');
  byCategory.forEach(cat => {
    console.log(`   ${cat.category}: ${cat._count}`);
  });
  console.log('═══════════════════════════════════════\n');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
EOF
        
        npx ts-node /tmp/plugin-status.ts
        rm /tmp/plugin-status.ts
        ;;
    5)
        echo -e "${BLUE}👋 Exiting setup script${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ Invalid option. Please select 1-5${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✅ Plugin setup completed!${NC}"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo "1. Restart the backend server: npm run start:dev"
echo "2. Refresh the frontend at http://localhost:3000"
echo "3. Go to Admin Dashboard > Plugin Management"
echo "4. Verify plugins are enabled/disabled as configured"
echo ""
echo -e "${YELLOW}💡 To manage plugins via API:${NC}"
echo "   See PLUGIN_SETUP_GUIDE.md for API endpoints"
echo ""

#!/bin/bash

# Script to fix Cloudflare environment variable access
# This applies the runtime.env pattern to all necessary files

set -e

echo "🔧 Fixing Cloudflare environment variable access..."

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to update a file
update_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        echo -e "${BLUE}Updating:${NC} $file - $description"
        return 0
    else
        echo "⚠️  File not found: $file"
        return 1
    fi
}

echo ""
echo "=== Service Classes ==="

# Statement Service
update_file "src/lib/services/statement-service.ts" "Add runtime parameter to constructor"
sed -i 's/constructor() {/constructor(runtime?: Record<string, string>) {/' src/lib/services/statement-service.ts
sed -i 's/this\.supabase = getSupabaseClient();/this.supabase = getSupabaseClient(runtime);/' src/lib/services/statement-service.ts

# Politician Service  
update_file "src/lib/services/politician-service.ts" "Add runtime parameter to constructor"
sed -i 's/constructor() {/constructor(runtime?: Record<string, string>) {/' src/lib/services/politician-service.ts
sed -i 's/this\.supabase = getSupabaseClient();/this.supabase = getSupabaseClient(runtime);/' src/lib/services/politician-service.ts

# Party Service
update_file "src/lib/services/party-service.ts" "Add runtime parameter to constructor"
sed -i 's/constructor() {/constructor(runtime?: Record<string, string>) {/' src/lib/services/party-service.ts
sed -i 's/this\.supabase = getSupabaseClient();/this.supabase = getSupabaseClient(runtime);/' src/lib/services/party-service.ts

echo ""
echo "=== Profile Service Functions ==="

# Profile Service - more complex, manual update recommended
echo "⚠️  src/lib/services/profile-service.ts requires manual update (see .md/cloudflare-fix-pattern.md)"

echo ""
echo "=== Auth Utility ==="

# Auth utility - manual update recommended
echo "⚠️  src/lib/utils/auth.ts requires manual update (see .md/cloudflare-fix-pattern.md)"

echo ""
echo "=== API Routes ==="

# List of API files that need locals parameter
API_FILES=(
    "src/pages/api/statements/index.ts"
    "src/pages/api/statements/[id].ts"
    "src/pages/api/politicians/index.ts"
    "src/pages/api/politicians/[id].ts"
    "src/pages/api/politicians/[id]/statements.ts"
    "src/pages/api/parties/index.ts"
    "src/pages/api/parties/[id].ts"
    "src/pages/api/profiles/me.ts"
    "src/pages/api/profiles/[id].ts"
)

for file in "${API_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${BLUE}Processing:${NC} $file"
        # Note: These sed commands are simplified - manual review recommended
        echo "  → Manual update recommended (complex multi-line changes)"
    fi
done

echo ""
echo -e "${GREEN}✅ Basic updates complete!${NC}"
echo ""
echo "📋 Next steps:"
echo "1. Review the changes made to service classes"
echo "2. Manually update API routes following the pattern in .md/cloudflare-fix-pattern.md"
echo "3. Manually update auth utility and profile service"
echo "4. Run 'npm run lint -- --fix' to format"
echo "5. Test with 'PLATFORM=cloudflare npm run build'"
echo ""
echo "💡 For detailed instructions, see: .md/cloudflare-fix-pattern.md"


#!/bin/bash

# Shopify Storefront App - Setup Verification Script
# This script checks if all necessary files and configurations are in place

echo "🔍 Checking Shopify Storefront App Setup..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

errors=0
warnings=0

# Function to check if file exists
check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $1 exists"
  else
    echo -e "${RED}✗${NC} $1 is missing"
    ((errors++))
  fi
}

# Function to check if directory exists
check_dir() {
  if [ -d "$1" ]; then
    echo -e "${GREEN}✓${NC} $1 exists"
  else
    echo -e "${RED}✗${NC} $1 is missing"
    ((errors++))
  fi
}

# Function to check if .env file exists
check_env() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $1 exists"
  else
    echo -e "${YELLOW}⚠${NC} $1 not found (copy from $2)"
    ((warnings++))
  fi
}

echo "📦 Checking Backend..."
check_dir "backend"
check_dir "backend/src"
check_dir "backend/scripts"
check_file "backend/package.json"
check_file "backend/tsconfig.json"
check_file "backend/.env.example"
check_env "backend/.env" "backend/.env.example"
check_file "backend/src/config.ts"
check_file "backend/src/index.ts"
check_file "backend/scripts/introspect-admin.js"

echo ""
echo "🌐 Checking Frontend..."
check_dir "frontend"
check_dir "frontend/src"
check_dir "frontend/public"
check_file "frontend/package.json"
check_file "frontend/tsconfig.json"
check_file "frontend/next.config.js"
check_file "frontend/.env.example"
check_env "frontend/.env" "frontend/.env.example"
check_file "frontend/src/app/layout.tsx"
check_file "frontend/src/app/page.tsx"
check_file "frontend/public/sw.js"
check_file "frontend/public/manifest.webmanifest"

echo ""
echo "📝 Checking Documentation..."
check_file "README.md"
check_file "shopify.app.toml"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $errors -eq 0 ] && [ $warnings -eq 0 ]; then
  echo -e "${GREEN}✓ All checks passed!${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Copy backend/.env.example to backend/.env and configure"
  echo "2. Copy frontend/.env.example to frontend/.env and configure"
  echo "3. Run 'cd backend && npm install && npm run dev'"
  echo "4. Run 'cd frontend && npm install && npm run dev'"
elif [ $errors -eq 0 ]; then
  echo -e "${YELLOW}⚠ Setup incomplete:${NC} $warnings warning(s)"
  echo ""
  echo "Please create .env files from .env.example templates"
else
  echo -e "${RED}✗ Setup issues found:${NC} $errors error(s), $warnings warning(s)"
  echo ""
  echo "Please ensure all required files are present"
  exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

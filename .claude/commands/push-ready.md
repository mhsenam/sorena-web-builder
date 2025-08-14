---
model: claude-3-5-sonnet-20241022
---

# Push Ready Checklist for Action Model Admin Dashboard

This command performs a comprehensive analysis of the project to ensure all conditions are met for successful GitLab CI builds before pushing to the repository.

## =
 Pre-Push Analysis Checklist

### 1. TypeScript Compilation Check
```bash
# Check for TypeScript errors
pnpm run type-check

# Expected output: No TypeScript errors found
# Common issues to resolve:
# - Missing type definitions
# - Type mismatches
# - Unused variables with strict mode
# - Missing return types
```

### 2. ESLint Analysis
```bash
# Run ESLint to check code quality
pnpm run lint

# If errors found, attempt auto-fix:
pnpm run lint:fix

# Common issues:
# - Unused imports
# - Missing dependencies in useEffect
# - Inconsistent naming conventions
# - Console.log statements in production code
```

### 3. Build Test
```bash
# Test production build locally
pnpm run build

# Checks for:
# - Import resolution errors
# - Missing environment variables
# - Asset compilation issues
# - Next.js specific errors
```

### 4. Dependencies Audit
```bash
# Check for dependency issues
pnpm audit

# Check for outdated packages
pnpm outdated

# Ensure package-lock.json is in sync
pnpm install
```

### 5. Environment Variables Check
```bash
# Validate all required environment variables
pnpm run validate-env

# Required variables:
# - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# - CLERK_SECRET_KEY
# - NEXT_PUBLIC_API_BASE_URL
```

### 6. Git Status Verification
```bash
# Check for uncommitted changes
git status

# Check for untracked files that should be committed
git ls-files --others --exclude-standard

# Verify .gitignore is properly configured
```

### 7. Code Formatting
```bash
# Run Prettier (if configured)
pnpm run format:check

# Format files if needed
pnpm run format:write
```

### 8. Import Organization
```bash
# Check for circular dependencies
pnpm run madge:circular

# Check for unused exports
pnpm run ts-prune
```

### 9. Bundle Size Analysis
```bash
# Analyze bundle size
pnpm run analyze

# Check for:
# - Large dependencies
# - Duplicate packages
# - Unnecessary imports
```

### 10. Mock Data Cleanup
```bash
# Search for mock data that should be removed
pnpm run grep:mock
pnpm run grep:temporary
pnpm run grep:todo

# Common locations:
# - src/app/(dashboard)/page.tsx
# - Component files with hardcoded data
```

## =� Automated Push-Ready Script

Create a `scripts/push-ready.sh` file:

```bash
#!/bin/bash
set -e

echo "=
 Starting push-ready checks..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check command result
check_result() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN} $1 passed${NC}"
    else
        echo -e "${RED} $1 failed${NC}"
        exit 1
    fi
}

# 1. TypeScript Check
echo "Checking TypeScript..."
pnpm run type-check > /dev/null 2>&1
check_result "TypeScript compilation"

# 2. ESLint Check
echo "Running ESLint..."
pnpm run lint > /dev/null 2>&1
check_result "ESLint"

# 3. Build Test
echo "Testing build..."
pnpm run build > /dev/null 2>&1
check_result "Production build"

# 4. Check for TODOs and mock data
echo "Checking for temporary code..."
TODO_COUNT=$(pnpm run grep:todo | wc -l)
MOCK_COUNT=$(pnpm run grep:mock | wc -l)
TEMP_COUNT=$(pnpm run grep:temporary | wc -l)

if [ $TODO_COUNT -gt 0 ]; then
    echo -e "${YELLOW}� Found $TODO_COUNT TODO comments${NC}"
fi

if [ $MOCK_COUNT -gt 0 ]; then
    echo -e "${YELLOW}� Found $MOCK_COUNT mock data references${NC}"
fi

if [ $TEMP_COUNT -gt 0 ]; then
    echo -e "${YELLOW}� Found $TEMP_COUNT TEMPORARY markers${NC}"
fi

# 5. Git checks
echo "Checking git status..."
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}� Uncommitted changes found${NC}"
    git status -s
fi

# 6. Environment variables
echo "Checking environment variables..."
pnpm run validate-env > /dev/null 2>&1
check_result "Environment variables"

echo -e "${GREEN} All checks passed! Ready to push.${NC}"
```

## =� Manual Review Checklist

Before pushing, manually verify:

- [ ] All new features have been tested locally
- [ ] No sensitive data in commits (API keys, passwords)
- [ ] Database migrations are included if needed
- [ ] Documentation is updated for new features
- [ ] Breaking changes are noted in commit message
- [ ] Performance hasn't degraded significantly
- [ ] Accessibility standards are maintained
- [ ] Mobile responsiveness is preserved

## =' Common Fixes

### TypeScript Errors
```typescript
// Add missing types
interface Props {
  name: string;
  onChange: (value: string) => void;
}

// Fix any types
// Bad: const data: any = fetchData();
// Good: const data: UserData = fetchData();
```

### ESLint Errors
```typescript
// Add missing dependencies
useEffect(() => {
  fetchData();
}, [fetchData]); // Don't forget dependencies

// Remove unused imports
// Use VS Code: Ctrl+Shift+P > "Organize Imports"
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
pnpm run build

# Reinstall dependencies
rm -rf node_modules package-lock.json
pnpm install
```

## <� GitLab CI Configuration Check

Ensure `.gitlab-ci.yml` includes all necessary checks:

```yaml
stages:
  - lint
  - test
  - build
  - deploy

lint:
  stage: lint
  script:
    - pnpm install
    - pnpm run lint
    - pnpm run type-check

build:
  stage: build
  script:
    - pnpm install
    - pnpm run build
  artifacts:
    paths:
      - .next/
```

## < Best Practices

1. **Run checks before every commit**
   ```bash
   pnpm run lint && pnpm run type-check && pnpm run build
   ```

2. **Use Git hooks** (add to `.husky/pre-commit`):
   ```bash
   pnpm run lint
   pnpm run type-check
   ```

3. **Keep dependencies updated**:
   ```bash
   pnpm update --save
   pnpm audit fix
   ```

4. **Clean up regularly**:
   - Remove unused imports
   - Delete commented code
   - Remove console.logs
   - Update or remove TODOs

## =� Quick Command

Add to `package.json`:
```json
{
  "scripts": {
    "push-ready": "pnpm run lint && pnpm run type-check && pnpm run build && echo ' Ready to push!'"
  }
}
```

Then run:
```bash
pnpm run push-ready
```

---

**Remember**: A clean codebase is a happy codebase! =�
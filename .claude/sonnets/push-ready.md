# Push Ready Analysis - Claude Sonnet

**Purpose**: Automatically analyze the project and ensure all conditions are met for successful GitLab CI builds.

## Instructions for Claude

When this sonnet is invoked, perform the following analysis in order:

### 1. TypeScript Compilation Check
Run `npm run type-check` and analyze any errors. If errors are found:
- List each error with file location
- Suggest specific fixes
- Offer to fix them automatically

### 2. ESLint Analysis
Run `npm run lint` and check for:
- Code style violations
- Potential bugs
- Best practice violations
- If errors exist, run `npm run lint:fix` and report what was fixed

### 3. Build Test
Run `npm run build` and check for:
- Import resolution errors
- Missing environment variables
- Asset compilation issues
- Next.js specific errors

### 4. Mock Data Detection
Search for temporary code:
```bash
grep -r "mock data for test" src/
grep -r "TEMPORARY" src/
grep -r "TODO" src/
```
Report all findings with file locations.

### 5. Git Status Check
Run `git status` and report:
- Uncommitted changes
- Untracked files
- Branch information

### 6. Dependencies Audit
Check for:
- Security vulnerabilities: `npm audit`
- Outdated packages: `npm outdated`
- Lock file sync: Verify package-lock.json is committed

### 7. Environment Variables
Run `npm run validate-env` and ensure all required variables are set:
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY
- NEXT_PUBLIC_API_BASE_URL

### 8. Code Quality Metrics
Analyze and report:
- Bundle size concerns
- Circular dependencies
- Unused exports
- Large files that might need splitting

## Output Format

Provide a structured report:

```markdown
# 🔍 Push Ready Analysis Report

## ✅ Passed Checks
- [x] TypeScript compilation
- [x] ESLint rules
- [x] Build test

## ⚠️ Warnings
- [ ] Found 3 TODO comments
- [ ] Mock data present in 2 files

## ❌ Failed Checks
- [ ] ESLint errors in 5 files

## 📝 Detailed Findings

### TypeScript Errors
(List any errors with fixes)

### ESLint Issues
(List violations with severity)

### Mock Data Locations
1. `src/app/(dashboard)/page.tsx:511` - "mock data for test"
2. `src/app/(dashboard)/page.tsx:878` - "mock data for test"

### Git Status
- Current branch: main
- Uncommitted files: 3
- Behind origin/main by 2 commits

## 🚀 Recommendations

1. Run `npm run lint:fix` to auto-fix ESLint issues
2. Remove mock data from production code
3. Commit or stash uncommitted changes
4. Pull latest changes from origin

## Final Status: ⚠️ NOT READY TO PUSH
```

## Interactive Fixes

After analysis, ask:
1. "Would you like me to automatically fix ESLint issues?"
2. "Should I remove the mock data and restore API calls?"
3. "Would you like me to create a commit with these fixes?"

## Success Criteria

The project is ready to push when:
- ✅ All TypeScript compiles without errors
- ✅ ESLint passes with no errors
- ✅ Build completes successfully
- ✅ No temporary/mock data in code
- ✅ All changes are committed
- ✅ Environment variables are properly set

## Additional Checks for Production

If pushing to main/master branch, also check:
- Performance metrics haven't degraded
- All tests pass (if test suite exists)
- No console.log statements in production code
- API endpoints use production URLs
- No hardcoded development values

---

**Note**: This sonnet helps maintain code quality and prevents CI/CD pipeline failures by catching issues before they reach GitLab.
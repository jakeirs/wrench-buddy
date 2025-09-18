# Quick Test Commands Reference

## 🎯 Flexible Test Commands

Your npm test script now accepts arguments, making it super flexible:

### Basic Commands

```bash
# Run all tests
npm run test

# Run specific test file
npm run test tests/bottomsheet-demo.spec.ts

# Run tests matching pattern
npm run test tests/bottomsheet*
npm run test *demo*

# Generate HTML report
npm run test -- --reporter=html

# Run in headed mode (show browser)
npm run test -- --headed

# Debug mode (step through test)
npm run test:debug
npm run test:debug tests/bottomsheet-demo.spec.ts
```

### Examples

```bash
# Test just BottomSheet functionality quickly
npm run test tests/bottomsheet-demo.spec.ts

# Debug BottomSheet test step by step
npm run test:debug tests/bottomsheet-demo.spec.ts

# Run all tests with detailed output
npm run test -- --reporter=list

# Test with custom browser settings
npm run test -- --headed --slow-mo=1000
```

## 📁 Current Structure

```
my-expo-app/
├── playwright.config.ts           # Chrome-only, optimized
├── tests/
│   ├── bottomsheet-demo.spec.ts   # BottomSheet open/close test
│   └── screenshots/               # Test screenshots
```

## 🚀 Getting Started

Before running tests, make sure:

1. Install Playwright browsers:
```bash
npx playwright install chrome
```

2. Start your Expo app:
```bash
npm start
# Make sure it runs on http://localhost:8081
```

3. Run your first test:
```bash
npm run test
```

## 🧪 Test Features

### BottomSheet Test Suite
- ✅ Page loads with trigger button
- ✅ BottomSheet opens when button clicked  
- ✅ BottomSheet closes when close button clicked
- ✅ Content validation (snap points, gestures, backdrop info)
- ✅ Complete workflow test (open → verify → close)

### Visual Verification
- Screenshots saved in `tests/screenshots/`
- Automatic screenshot on test failure
- Manual screenshots for key interaction points
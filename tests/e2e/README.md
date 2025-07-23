# Traditional Chinese Study - E2E Testing Suite

This comprehensive end-to-end testing suite uses Playwright to test the Traditional Chinese Study application across multiple browsers, devices, and scenarios.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker and Docker Compose
- Chrome, Firefox, and Safari browsers (for cross-browser testing)

### Installation
```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run test:e2e:install
```

### Running Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run specific test suites
npm run test:e2e:core
npm run test:e2e:components
npm run test:e2e:technical
npm run test:e2e:accessibility

# Run on specific browsers
npm run test:e2e:chrome
npm run test:e2e:firefox
npm run test:e2e:safari
npm run test:e2e:mobile

# Run with custom script
./scripts/run-e2e-tests.sh development core chrome false
```

## 📁 Test Structure

```
tests/e2e/
├── specs/                    # Test specifications
│   ├── core/                # Core user journey tests
│   ├── components/          # Interactive component tests
│   ├── technical/           # Technical integration tests
│   └── accessibility/       # Accessibility compliance tests
├── pages/                   # Page Object Models
├── fixtures/                # Test data and fixtures
├── utils/                   # Test utilities and helpers
├── .auth/                   # Authentication state files
├── global-setup.ts          # Global test setup
├── global-teardown.ts       # Global test cleanup
└── README.md               # This file
```

## 🧪 Test Categories

### Core User Journeys
- **Homepage Navigation**: Feature discovery and navigation flows
- **Classic Text Reading**: Three classics reading experience
- **Hanzi Writing Practice**: Complete writing practice sessions
- **Pinyin Practice**: Tone recognition and pronunciation
- **Cross-page Navigation**: Routing and state management

### Interactive Components
- **HanziWriter**: Animation, quiz mode, hints, stroke validation
- **StrokeAnimator**: Playback controls, stroke progression
- **PinyinPractice**: Input validation, scoring system
- **WritingPractice**: Mode switching, progress tracking

### Technical Scenarios
- **Multi-service Integration**: Next.js (3000) + Express (9005) + Caddy (80)
- **API Integration**: Backend service communication
- **Performance Testing**: Load times and responsiveness
- **Error Handling**: Network failures and edge cases
- **Security**: CORS, headers, authentication

### Accessibility Testing
- **WCAG Compliance**: AA level accessibility standards
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: ARIA labels and landmarks
- **Color Contrast**: Sufficient contrast ratios
- **Mobile Accessibility**: Touch targets and responsive design

## 🔧 Configuration

### Environment Variables
```bash
# Test environment
NODE_ENV=test
BASE_URL=http://localhost
CI=false

# Service URLs
NEXT_URL=http://localhost:3000
EXPRESS_URL=http://localhost:9005
CADDY_URL=http://localhost
```

### Browser Configuration
Tests run on multiple browsers and devices:
- **Desktop**: Chrome, Firefox, Safari
- **Mobile**: Mobile Chrome, Mobile Safari
- **Tablet**: iPad Pro simulation

### Performance Thresholds
- Homepage: < 3 seconds
- Classics page: < 2 seconds
- Writing practice: < 4 seconds
- API responses: < 1 second

## 📊 Test Reports

### HTML Report
```bash
# Generate and view HTML report
npm run test:e2e:report
```

### CI/CD Integration
Tests generate multiple report formats:
- **HTML**: Interactive test report
- **JSON**: Machine-readable results
- **JUnit**: CI/CD integration
- **Screenshots**: Visual regression testing
- **Videos**: Failed test recordings

## 🎯 Page Object Models

### BasePage
Common functionality for all pages:
- Navigation helpers
- Element interaction utilities
- Screenshot and performance utilities
- Accessibility testing helpers

### HomePage
- Hero section verification
- Feature card interactions
- Navigation testing
- Responsive layout validation

### ClassicsPage
- Classic text card verification
- Difficulty level testing
- Navigation to practice modes
- Progress tracking

### WritingPracticePage
- HanziWriter component testing
- Character navigation
- Practice session completion
- Statistics verification

## 🛠️ Test Utilities

### TestHelpers
- **Performance**: Page load time measurement
- **Network**: Simulation of slow/failed connections
- **Accessibility**: ARIA attribute verification
- **Responsive**: Multi-device testing
- **Memory**: Memory leak detection

### Test Data
Comprehensive test fixtures:
- Character data with pinyin and meanings
- Classic text information
- User progress data
- API response mocks
- Error scenarios

## 🚨 Debugging Tests

### Debug Mode
```bash
# Run tests in debug mode
npm run test:e2e:debug

# Run specific test in debug mode
npx playwright test tests/e2e/specs/core/homepage.spec.ts --debug
```

### Screenshots and Videos
Failed tests automatically capture:
- Screenshots at failure point
- Video recordings of test execution
- Network request logs
- Console error messages

### Trace Viewer
```bash
# View detailed test traces
npx playwright show-trace test-results/trace.zip
```

## 📈 Performance Testing

### Metrics Collected
- Page load times
- First contentful paint
- Time to interactive
- API response times
- Memory usage

### Thresholds
Tests fail if performance exceeds defined thresholds:
- Page loads > 3 seconds
- API calls > 1 second
- Memory leaks detected

## ♿ Accessibility Testing

### Automated Checks
- **axe-core**: Automated accessibility scanning
- **Color Contrast**: WCAG AA compliance
- **Keyboard Navigation**: Tab order and focus management
- **ARIA**: Proper labeling and landmarks

### Manual Testing
- Screen reader compatibility
- Voice control support
- High contrast mode
- Zoom functionality

## 🔄 CI/CD Integration

### GitHub Actions
```yaml
- name: Run E2E Tests
  run: |
    npm run test:e2e
    npm run test:e2e:report
```

### Docker Integration
Tests run against Docker services:
```bash
# Start services and run tests
./scripts/run-e2e-tests.sh production all chrome
```

## 📝 Writing New Tests

### Test Structure
```typescript
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    // Test implementation
  });
});
```

### Best Practices
1. **Use Page Objects**: Encapsulate page interactions
2. **Wait for Stability**: Use proper wait strategies
3. **Test Data**: Use fixtures for consistent data
4. **Screenshots**: Capture evidence for failures
5. **Accessibility**: Include accessibility checks
6. **Performance**: Monitor load times
7. **Error Handling**: Test edge cases

## 🔍 Troubleshooting

### Common Issues
1. **Services not ready**: Increase wait timeouts
2. **Flaky tests**: Add proper wait conditions
3. **Browser crashes**: Update browser versions
4. **Network timeouts**: Check Docker networking

### Debug Commands
```bash
# Check service health
curl http://localhost/health
curl http://localhost:3000/health
curl http://localhost:9005/ping

# View service logs
docker-compose logs -f

# Check test results
ls -la test-results/
```

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Testing Best Practices](https://playwright.dev/docs/best-practices)
- [Accessibility Testing](https://playwright.dev/docs/accessibility-testing)
- [Visual Comparisons](https://playwright.dev/docs/test-screenshots)

---

**E2E Testing Suite Version**: 1.0.0  
**Last Updated**: 2024-07-20

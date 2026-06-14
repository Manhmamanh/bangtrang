# 🧪 Testing Guide - TPPO Whiteboard

## Testing Stack

- **Frontend:** Vitest + React Testing Library
- **Backend:** Jest + Supertest
- **E2E:** Playwright (optional)

## Frontend Testing

### Setup

```bash
cd packages/client
npm install
npm test
```

### Run Tests

```bash
# Watch mode
npm test

# Single run (CI mode)
npm test -- --run

# UI mode
npm run test:ui

# Coverage report
npm run test:coverage
```

### Writing Tests

```typescript
// src/test/components/MyComponent.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '../utils';
import MyComponent from '../../components/MyComponent';

describe('MyComponent', () => {
  it('should render', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle click', async () => {
    const { user } = render(<MyComponent />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

### Test Utilities

```typescript
// Use custom render from test/utils
import { render, screen, waitFor } from '../test/utils';

// Predefined mocks
vi.mock('socket.io-client');
vi.mock('axios');
vi.mock('zustand');
```

### Best Practices

✅ **DO:**
- Test user behavior, not implementation
- Use data-testid for querying
- Mock external dependencies
- Test edge cases
- Keep tests simple and focused

❌ **DON'T:**
- Test internal state directly
- Mock too much
- Test implementation details
- Write overly complex tests
- Skip error cases

### Example: Component Test

```typescript
describe('BrainstormTimer', () => {
  it('should countdown when started', async () => {
    const { user } = render(<BrainstormTimer initialMinutes={1} />);
    
    // Start timer
    await user.click(screen.getByRole('button', { name: /Start/i }));
    
    // Advance time
    vi.advanceTimersByTime(1000);
    
    // Check countdown
    expect(screen.getByText('00:59')).toBeInTheDocument();
  });

  it('should call onTimeUp when finished', async () => {
    const onTimeUp = vi.fn();
    render(<BrainstormTimer initialMinutes={1} onTimeUp={onTimeUp} />);
    
    const btn = screen.getByRole('button', { name: /Start/i });
    await user.click(btn);
    
    vi.advanceTimersByTime(60000);
    
    expect(onTimeUp).toHaveBeenCalled();
  });
});
```

## Backend Testing

### Setup

```bash
cd packages/server
npm install
npm test
```

### Run Tests

```bash
# Watch mode
npm test

# Single run
npm test -- --passWithNoTests

# Coverage
npm test -- --coverage
```

### Test Structure

```
src/
├── __tests__/
│   ├── auth.test.ts
│   ├── boards.test.ts
│   └── websocket.test.ts
```

### Writing API Tests

```typescript
// src/__tests__/auth.test.ts
import request from 'supertest';
import app from '../index';

describe('Auth Routes', () => {
  it('POST /api/auth/signup should create user', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
      });

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe('test@example.com');
    expect(response.body.token).toBeDefined();
  });

  it('POST /api/auth/login should return token', async () => {
    // First signup
    await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test',
      });

    // Then login
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });
});
```

### Database Testing

```typescript
describe('Database', () => {
  beforeEach(async () => {
    // Setup test database
    await setupTestDB();
  });

  afterEach(async () => {
    // Cleanup
    await cleanupTestDB();
  });

  it('should create user', async () => {
    const user = await createUser({
      email: 'test@example.com',
      password: 'hash',
      fullName: 'Test',
    });

    expect(user.id).toBeDefined();
  });
});
```

## Integration Testing

### API + Database

```typescript
describe('Boards API', () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    // Create test user
    const signup = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
      });

    token = signup.body.token;
    userId = signup.body.user.id;
  });

  it('should create board', async () => {
    const response = await request(app)
      .post('/api/boards')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'My Board',
        description: 'Test board',
      });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe('My Board');
  });

  it('should list user boards', async () => {
    await request(app)
      .post('/api/boards')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Board 1' });

    const response = await request(app)
      .get('/api/boards')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });
});
```

## E2E Testing (Optional)

### Setup Playwright

```bash
npm install -D @playwright/test
npx playwright install
```

### Example E2E Test

```typescript
// tests/brainstorming.spec.ts
import { test, expect } from '@playwright/test';

test('User can brainstorm with timer', async ({ page }) => {
  // Navigate to app
  await page.goto('http://localhost:5173');

  // Login
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button:has-text("Login")');

  // Wait for boards page
  await page.waitForURL('/');

  // Create board
  await page.click('button:has-text("Create New Board")');
  await page.fill('input[placeholder="Name"]', 'Brainstorm Session');
  await page.click('button:has-text("Create")');

  // Start timer
  await page.click('button:has-text("Start")');

  // Check timer is running
  const timer = page.locator('.timer-number');
  await expect(timer).toHaveText(/0[0-9]:[0-9][0-9]/);

  // Draw a shape
  await page.click('button:has-text("Rect")');
  await page.click('.canvas', { button: 'left' });

  // Verify shape created
  await expect(page.locator('.canvas')).toContainText('shape');
});
```

## Test Coverage

### Check Coverage

```bash
# Frontend
npm run test:coverage

# Backend
npm test -- --coverage
```

### Coverage Targets

- **Statements:** 70%+
- **Branches:** 65%+
- **Functions:** 70%+
- **Lines:** 70%+

### Improve Coverage

```bash
# Generate HTML report
npm test -- --coverage --coverage-reporter=html

# Open report
open coverage/index.html
```

## Mocking

### Mock API

```typescript
import { vi } from 'vitest';
import * as api from '../../utils/api';

vi.spyOn(api, 'boardAPI').mockReturnValue({
  getMyBoards: () => Promise.resolve([]),
});
```

### Mock Socket.io

```typescript
import { io } from 'socket.io-client';

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
  })),
}));
```

### Mock Zustand

```typescript
import { useAuthStore } from '../../utils/store';

vi.mock('../../utils/store', () => ({
  useAuthStore: vi.fn(() => ({
    user: { id: '1', email: 'test@example.com' },
    token: 'test-token',
  })),
}));
```

## Debugging Tests

### Print Debug Info

```typescript
import { render, screen, debug } from '../test/utils';

it('should work', () => {
  render(<MyComponent />);
  debug(); // Print DOM
  screen.logTestingPlaygroundURL(); // Click to copy test code
});
```

### Using Debugger

```typescript
it('should work', () => {
  debugger; // Breakpoint
  render(<MyComponent />);
});

// Run with: node --inspect-brk ./node_modules/.bin/vitest
```

## CI Integration

### GitHub Actions

Tests automatically run on:
- ✅ Push to main/develop
- ✅ Pull requests
- ✅ Scheduled (weekly)

### View Results

- `.github/workflows/frontend-ci.yml`
- `.github/workflows/backend-ci.yml`

## Snapshot Testing (Use Sparingly)

```typescript
it('should match snapshot', () => {
  const { container } = render(<Component />);
  expect(container).toMatchSnapshot();
});

// Update snapshot: npm test -- -u
```

## Performance Testing

### Measure Component Performance

```typescript
import { render } from '../test/utils';

it('should render quickly', () => {
  const start = performance.now();
  render(<Component />);
  const end = performance.now();
  
  expect(end - start).toBeLessThan(100); // ms
});
```

## Accessibility Testing

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

it('should be accessible', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Tips & Tricks

### Run Specific Test

```bash
npm test -- BrainstormTimer
```

### Watch Single File

```bash
npm test -- --watch src/components/BrainstormTimer.test.tsx
```

### Update Snapshots

```bash
npm test -- -u
```

### Skip Test

```typescript
it.skip('should test something', () => {
  // Not run
});
```

### Focus Test

```typescript
it.only('should test something', () => {
  // Only this runs
});
```

---

Happy Testing! 🚀

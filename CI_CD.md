# 🚀 CI/CD Pipeline - TPPO Whiteboard

## Overview

Automated testing, building, and deployment using GitHub Actions.

## Workflows

### 1. Backend CI (`backend-ci.yml`)

**Triggers:** Push to main/develop, PRs

**Steps:**
- ✅ Setup Node.js 20
- ✅ Install dependencies
- ✅ Type checking with TypeScript
- ✅ Run tests with Jest
- ✅ Build production bundle
- ✅ Upload artifacts

**Services:**
- PostgreSQL 15 (test database)
- Redis 7 (cache)

### 2. Frontend CI (`frontend-ci.yml`)

**Triggers:** Push to main/develop, PRs

**Steps:**
- ✅ Setup Node.js 20
- ✅ Install dependencies
- ✅ Type checking with TypeScript
- ✅ Run tests with Vitest
- ✅ Upload coverage to Codecov
- ✅ Build production bundle
- ✅ Lighthouse audit for performance

**Artifacts:**
- Frontend build (dist/)
- Test coverage reports

### 3. Security Checks (`security.yml`)

**Triggers:** Every push, PRs, weekly schedule

**Checks:**
- ✅ npm audit for vulnerabilities
- ✅ TruffleHog secret scanning
- ✅ GitHub CodeQL analysis
- ✅ Snyk vulnerability scanning
- ✅ Dependency checks

### 4. Deployment (`deploy.yml`)

**Triggers:** Push to main

**Steps:**
- ✅ Build Docker images
- ✅ Push to Docker Hub
- ✅ Deploy to production server
- ✅ Notify Slack on success/failure

## Setup

### GitHub Secrets Required

```
# Docker Hub
DOCKER_USERNAME      # Docker Hub username
DOCKER_PASSWORD      # Docker Hub access token

# Deployment
DEPLOY_HOST          # Production server IP
DEPLOY_USER          # SSH user
DEPLOY_KEY           # SSH private key

# Notifications
SLACK_WEBHOOK        # Slack webhook URL

# Optional Security
SNYK_TOKEN          # Snyk security token
CODECOV_TOKEN       # Codecov token
```

### Add Secrets

```bash
# Via GitHub CLI
gh secret set DOCKER_USERNAME --body "your-username"
gh secret set DOCKER_PASSWORD --body "your-token"
# ... etc
```

## Workflow Status

View workflow status at: `https://github.com/YOUR-ORG/tppo-whiteboard/actions`

## Local Testing

### Test Locally Before Pushing

```bash
# Backend
cd packages/server
npm test

# Frontend
cd packages/client
npm test -- --run
npm run type-check
```

### Build Locally

```bash
# Backend
npm run build

# Frontend
npm run build
```

### Docker Build

```bash
# Build backend image
docker build -t tppo-whiteboard-server:latest ./packages/server

# Build frontend image
docker build -f ./packages/client/Dockerfile.dev -t tppo-whiteboard-client:latest ./packages/client
```

## Troubleshooting

### Workflow Failed

1. **Check logs:** Click on failed workflow → see detailed logs
2. **Type errors:** `npm run type-check` locally
3. **Test failures:** `npm test` locally
4. **Build errors:** `npm run build` locally

### Docker Push Failed

- Verify Docker credentials are correct
- Check Docker Hub access token has push permissions

### Deployment Failed

- SSH key has correct permissions: `chmod 600 ~/.ssh/id_rsa`
- Server is reachable: `ssh -i key user@host`
- Disk space available: `df -h` on server

## Best Practices

### Commit Messages

```
feat: add new feature
fix: fix a bug
docs: documentation only
style: formatting
test: add/update tests
chore: maintenance
ci: CI/CD changes
```

### Branch Strategy

```
main           # Production-ready code
└─ develop     # Integration branch
   └─ feature/* # Feature branches
   └─ bugfix/*  # Bug fix branches
```

### Pull Request Workflow

```
1. Create feature branch: git checkout -b feature/my-feature
2. Make changes + commit
3. Push to origin
4. Create PR with description
5. Wait for CI to pass
6. Request review
7. Merge after approval
8. Delete branch
```

## Monitoring

### Performance

- Lighthouse scores (Frontend CI)
- Build time trends
- Test coverage over time

### Security

- CodeQL findings
- Snyk vulnerability reports
- Secret scanning results

### Deployment

- Successful deployments logged
- Slack notifications sent
- Rollback capability (manual)

## Advanced Setup

### Custom Deployment Strategies

Edit `.github/workflows/deploy.yml`:

```yaml
# Blue-green deployment
- name: Switch traffic to new deployment
  run: ./scripts/switch-traffic.sh

# Canary deployment
- name: Deploy to canary
  run: ./scripts/deploy-canary.sh
```

### Performance Metrics

Add to CI:

```yaml
- name: Performance metrics
  run: |
    npm run build
    npm run analyze  # Bundle analysis
    npm run lighthouse  # Page speed
```

### Slack Notifications

Already configured to send on:
- ✅ Successful deployment
- ❌ Failed deployment
- ⚠️ Security issues

## Related Files

- [SETUP.md](./SETUP.md) - Local setup
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development guide
- [TESTING.md](./TESTING.md) - Testing guide (create this)

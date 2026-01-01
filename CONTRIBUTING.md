# Contributing to NotABot

Thank you for your interest in contributing to NotABot!
This guide will help you get started with contributing to our project.

---

## 🚀 Quick Start

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/notabot.git`
3. **Create** a branch: `git checkout -b feature/your-feature-name`
4. **Make** your changes
5. **Test** your changes: `yarn test`
6. **Commit** with a clear message: `git commit -m "Add: your feature"`
7. **Push** to your fork: `git push origin feature/your-feature-name`
8. **Open** a Pull Request

---

## 📋 Contribution Guidelines

### Code Style

**Solidity:**
- Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- Use `prettier` for formatting: `yarn hardhat:format`
- Maximum 300 lines per contract file
- Maximum 2-3 functions per file in one commit

**JavaScript/TypeScript:**
- Use `prettier` for formatting: `yarn format`
- Follow ESLint rules
- Use async/await (no callbacks)

**Rust (Solana):**
- Follow [Rust Style Guide](https://doc.rust-lang.org/nightly/style-guide/)
- Use `cargo fmt` for formatting
- Maximum 200 lines per file

### Testing

**Required:**
- ✅ All new code must have tests
- ✅ Tests must pass: `yarn test`
- ✅ Coverage must not decrease
- ✅ Add tests for edge cases

**Test Structure:**
```javascript
describe("FeatureName", () => {
  it("should do something", async () => {
    // Arrange
    // Act
    // Assert
  });
});
```

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new verification adapter
fix: resolve duplicate verification bug
docs: update integration guide
test: add edge case tests
refactor: simplify signature verification
```

**Prefixes:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `test:` - Tests
- `refactor:` - Code refactoring
- `chore:` - Maintenance

---

## 🎯 Areas to Contribute

### High Priority

1. **New Verification Adapters**
   - Binance KYC
   - Coinbase Verification
   - Civic Pass
   - See [INTEGRATION.md](./docs/INTEGRATION.md)

2. **Multi-Chain Support**
   - Optimism deployment
   - Arbitrum deployment
   - Polygon deployment

3. **Security**
   - Security audits
   - Bug reports (see [SECURITY.md](./SECURITY.md))
   - Gas optimization

### Medium Priority

1. **Documentation**
   - API documentation
   - Tutorial videos
   - Translation (Russian, Chinese)

2. **Frontend**
   - UI/UX improvements
   - Mobile responsiveness
   - Dark mode

3. **Backend**
   - Performance optimization
   - Rate limiting improvements
   - Error handling

### Low Priority

1. **DevOps**
   - CI/CD improvements
   - Docker setup
   - Kubernetes configs

2. **Testing**
   - E2E tests
   - Load testing
   - Fuzzing

---

## 🐛 Reporting Bugs

**Before reporting:**
1. Check if the bug already exists in [Issues](https://github.com/notabot/notabot/issues)
2. Test on the latest `main` branch
3. Gather relevant information

**Bug Report Template:**
```markdown
**Description:**
Clear description of the bug

**Steps to Reproduce:**
1. Step one
2. Step two
3. See error

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Environment:**
- Node version: v20.18.3
- OS: Linux
- Network: Base Sepolia

**Screenshots/Logs:**
[If applicable]
```

---

## 💡 Feature Requests

**Before requesting:**
1. Check if the feature already exists
2. Check if it's in the roadmap
3. Think about the use case

**Feature Request Template:**
```markdown
**Problem:**
What problem does this solve?

**Solution:**
How should it work?

**Alternatives:**
Other solutions you considered

**Additional Context:**
Screenshots, mockups, etc.
```

---

## 🔍 Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Tests pass: `yarn test`
- [ ] Coverage maintained or increased
- [ ] Documentation updated
- [ ] Commit messages follow conventions
- [ ] PR description is clear

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing done

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
```

### Review Process

1. **Automated checks** must pass (CI)
2. **Code review** by maintainers
3. **Approval** from at least 1 maintainer
4. **Merge** (squash and merge)

---

## 🏗️ Development Setup

### Prerequisites

- Node.js >= 20.18.3
- Yarn 3.2.3+
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/notabot/notabot.git
cd notabot

# Install dependencies
yarn install

# Set up environment
cp packages/backend/.env.example packages/backend/.env
# Edit .env with your keys

# Run tests
yarn test
```

### Project Structure

```
/notabot
├── packages/
│   ├── hardhat/      # Smart contracts
│   ├── backend/      # Node.js API
│   ├── nextjs/       # Frontend
│   └── solana/       # Solana program
├── docs/             # Documentation
└── .github/          # GitHub templates
```

### Running Locally

```bash
# Terminal 1: Start local blockchain
yarn chain

# Terminal 2: Deploy contracts
yarn deploy

# Terminal 3: Start backend
cd packages/backend && yarn dev

# Terminal 4: Start frontend
yarn start
```

---

## 🔒 Security

**Found a security vulnerability?**

1. **DO NOT** open a public issue
2. Email: security@notabot.io (or create private security advisory)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact

**We will:**
- Respond within 48 hours
- Work with you to fix it
- Credit you in the security advisory

See [SECURITY.md](./SECURITY.md) for details.

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 Thank You!

Every contribution, no matter how small, makes NotABot better. Thank you for helping us build the future of Web3 identity! 🚀

---

**Questions?** Open an issue or reach out to maintainers.

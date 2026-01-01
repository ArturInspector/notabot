# Security Policy

## 🔒 Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < Latest | :x:                |

## 🚨 Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **GitHub Security Advisory** (Preferred)
   - Go to [Security Advisories](https://github.com/notabot/notabot/security/advisories)
   - Click "New draft security advisory"
   - Fill out the form

2. **Email** (if GitHub is not available)
   - Email: security@notabot.io
   - Subject: `[SECURITY] Vulnerability in NotABot`

## 📋 What to Include

When reporting a vulnerability, please include:

- **Description** of the vulnerability
- **Steps to reproduce** the issue
- **Potential impact** (what could an attacker do?)
- **Suggested fix** (if you have one)
- **Affected versions** (if known)

## ⏱️ Response Timeline

- **Initial Response:** Within 48 hours
- **Status Update:** Within 7 days
- **Fix Timeline:** Depends on severity

## 🏆 Recognition

We believe in recognizing security researchers who help us improve. If you report a valid security vulnerability, we will:

- ✅ Credit you in the security advisory
- ✅ Add you to our [CONTRIBUTORS.md](./CONTRIBUTORS.md)
- ✅ (Optional) Add you to our Hall of Fame

## 🛡️ Security Best Practices

### For Users

- ✅ Always verify contract addresses from official sources
- ✅ Never share your private keys
- ✅ Use hardware wallets for mainnet
- ✅ Verify transactions on block explorers

### For Developers

- ✅ Review all smart contract code before deployment
- ✅ Use multi-sig for contract ownership
- ✅ Keep dependencies up to date
- ✅ Follow secure coding practices

## 🔍 Known Security Considerations

### Smart Contracts

- **Reentrancy Protection:** All contracts use `ReentrancyGuard`
- **Access Control:** Only trusted adapters can register verifications
- **Duplicate Prevention:** `usedUniqueIds` mapping prevents double-spending
- **Signature Verification:** ECDSA recovery with timestamp checks

### Backend API

- **Rate Limiting:** 100 requests per minute per IP
- **Input Validation:** All endpoints validate input
- **Private Keys:** Stored in secure environment variables (Railway secrets)
- **HTTPS Only:** All API calls must use HTTPS

### Frontend

- **No Private Keys:** Frontend never handles private keys
- **Wallet Integration:** Uses standard wallet libraries (RainbowKit, Phantom)
- **Content Security Policy:** CSP headers prevent XSS

## 📚 Security Resources

- [OpenZeppelin Security](https://www.openzeppelin.com/security-audits)
- [Trail of Bits](https://www.trailofbits.com/)
- [Consensys Diligence](https://consensys.io/diligence/)

## 📄 Disclosure Policy

1. **Private Disclosure:** We'll work with you to fix the issue privately
2. **Fix Development:** We'll develop a patch
3. **Public Disclosure:** After the fix is deployed, we'll publish a security advisory
4. **Timeline:** Typically 30-90 days from report to public disclosure

---

**Thank you for helping keep NotABot secure!** 🔒


# NotABot Widget Integration - Implementation

## ✅ Phase 1: DONE

**Location**: `packages/nextjs/components/notabot-widget/`

```
✅ VerificationButton.tsx      - Main trigger component
✅ VerificationModal.tsx        - Modal with verification sources
✅ widget.module.css            - Silicon Valley aesthetics
✅ /integration page            - Live demo + docs
```

**Features**:
- Modal with 4 verification sources
- Wallet connect flow
- Real-time status from contract
- Professional UI/UX
- Mobile responsive
- ESC to close, click outside

**Integration Page**: `http://localhost:3000/integration`
- Live widget demo
- Code examples (React, Vanilla JS, Solidity)
- Contract addresses
- Installation guides

---

## 🚧 Phase 2: Standalone Script (TODO)

**Goal**: CDN-ready vanilla JS widget

**Structure**:
```
packages/widget/
├── src/
│   ├── index.ts
│   ├── widget.ts
│   └── styles.css
├── package.json
├── rollup.config.js
└── tsconfig.json
```

**Output**:
```html
<script src="https://unpkg.com/@notabot/widget@latest/dist/notabot.min.js"></script>
<div id="notabot-widget"></div>
<script>
  NotABot.init({
    containerId: 'notabot-widget',
    chainId: 84532,
    onVerified: (status) => console.log(status)
  });
</script>
```

**Steps**:
1. Create `packages/widget/` workspace
2. Port React components to vanilla JS
3. Setup Rollup for bundling
4. Add Web3Modal for wallet connect
5. Publish to NPM
6. Setup unpkg.com CDN

---

## 🚧 Phase 3: React SDK (TODO)

**Goal**: NPM package for React/Next.js

**Structure**:
```
packages/sdk/
├── src/
│   ├── index.ts
│   ├── components/
│   │   ├── VerificationButton.tsx
│   │   └── VerificationModal.tsx
│   ├── hooks/
│   │   ├── useVerificationStatus.ts
│   │   └── useNotABot.ts
│   └── types/
│       └── index.ts
├── package.json
└── tsconfig.json
```

**Installation**:
```bash
npm install @notabot/react wagmi viem
```

**Usage**:
```tsx
import { NotABotProvider, VerificationButton } from '@notabot/react';

function App() {
  return (
    <NotABotProvider chainId={84532}>
      <VerificationButton onVerified={(count) => alert(count)} />
    </NotABotProvider>
  );
}
```

**Steps**:
1. Create monorepo package
2. Export components + hooks
3. Setup build with tsup/rollup
4. Type definitions
5. Publish to NPM

---

## 🚧 Phase 4: Solidity SDK (TODO)

**Goal**: NPM package with interfaces + helpers

**Structure**:
```
packages/contracts-sdk/
├── contracts/
│   ├── interfaces/
│   │   └── IHumanityOracle.sol
│   └── helpers/
│       └── HumanityGuard.sol
├── package.json
└── hardhat.config.ts
```

**Installation**:
```bash
npm install @notabot/contracts
```

**Usage**:
```solidity
import "@notabot/contracts/interfaces/IHumanityOracle.sol";
import "@notabot/contracts/helpers/HumanityGuard.sol";

contract MyContract is HumanityGuard {
    constructor(address _oracle) HumanityGuard(_oracle) {}
    
    function claim() external onlyVerifiedHuman {
        // logic
    }
}
```

**Steps**:
1. Extract interfaces from current contracts
2. Create helper contracts
3. Setup NPM publishing
4. Add to integration docs

---

## 🎯 Next Steps (Priority Order)

1. **Test current widget** on `/integration` page
2. **Create Phase 2** - Standalone script for any website
3. **Publish Phase 3** - React SDK to NPM
4. **Document Phase 4** - Solidity helpers

---

## 📦 NPM Publishing Strategy

**Package Names**:
- `@notabot/widget` - Vanilla JS (CDN-ready)
- `@notabot/react` - React components
- `@notabot/contracts` - Solidity interfaces

**Versioning**: SemVer (0.1.0 → 1.0.0)

**Registry**: npmjs.com + unpkg.com CDN

**Docs**: integration page + GitHub README


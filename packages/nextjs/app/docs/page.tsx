// app/docs/page.tsx
"use client";
import React from "react";
import styles from "./page.module.css";
import {
  Layout,
  Menu,
  Card,
  Tabs,
  Tag,
  Button,
  Row,
  Col,
  Divider,
  Typography,
  Space,
} from "antd";
import { motion, type Variants, easeOut } from "framer-motion";
import Link from "next/link";
import { VerificationButton } from "~~/components/notabot-widget";

const { Sider, Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const sections = [
  { key: "overview", label: "Overview" },
  { key: "widget", label: "Frontend Widget" },
  { key: "quickstart", label: "Quick Start" },
  { key: "solidity", label: "Solidity Interface" },
  { key: "examples", label: "Usage Examples" },
  { key: "api", label: "API Reference" },
  { key: "network", label: "Network & Gas" },
  { key: "support", label: "Support" },
];

export default function Docs() {
  const [active, setActive] = React.useState("overview");

  React.useEffect(() => {
    const onScroll = () => {
      const ids = sections.map((s) => s.key);
      const offsets = ids.map((id) => {
        const el = document.getElementById(id);
        return el
          ? Math.abs(el.getBoundingClientRect().top)
          : Number.MAX_SAFE_INTEGER;
      });
      const idx = offsets.indexOf(Math.min(...offsets));
      if (idx >= 0) setActive(ids[idx]);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Layout className={styles.wrap}>
      <Sider
        className={styles.sider}
        width={264}
        breakpoint="lg"
        collapsedWidth={0}
      >
        <div className={styles.brand}>
          <div className={styles.brandTitle}>NotABot Docs</div>
          <div className={styles.brandSub}>Sybil-resistant contracts</div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[active]}
          onClick={(e) => {
            const el = document.getElementById(e.key);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          items={sections.map((s) => ({ key: s.key, label: s.label }))}
        />
      </Sider>

      <Layout>
        <Content className={styles.content}>
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <section id="overview" className={styles.section}>
              <motion.div variants={fadeUp}>
                <Card className={styles.heroCard}>
                  <div className={styles.heroGrid}>
                    <div>
                      <Title level={1} className={styles.h1}>
                        NotABot Integration Guide
                      </Title>
                      <Paragraph className={styles.lead}>
                        Like OpenZeppelin, but for sybil resistance. Install via NPM, 
                        add onlyHuman modifier, protect your contracts from bots. 
                        Aggregates Worldcoin, Gitcoin Passport, PoH, BrightID on multiple chains.
                      </Paragraph>
                      <Space wrap>
                        <Tag className={styles.tagPrimary}>Base Sepolia</Tag>
                        <Tag className={styles.tagPrimary}>Status Network</Tag>
                        <Tag className={styles.tagSoft}>NPM Package</Tag>
                        <Tag className={styles.tagMono}>@notabot/contracts</Tag>
                      </Space>
                      <div className={styles.ctaRow}>
                        <Link href="#quickstart">
                          <Button
                            size="large"
                            type="primary"
                            className={styles.btnPrimary}
                          >
                            Quick Start
                          </Button>
                        </Link>
                        <Link href="#examples">
                          <Button size="large" className={styles.btnGhost}>
                            Examples
                          </Button>
                        </Link>
                      </div>
                    </div>
                    <div className={styles.blob} />
                  </div>
                </Card>
              </motion.div>
            </section>

            <section id="widget" className={styles.section}>
              <motion.div variants={fadeUp}>
                <Title level={2} className={styles.h2}>
                  Frontend Widget
                </Title>
                <Paragraph className={styles.lead}>
                  Drop-in React component for user verification. Add to any Next.js or React app.
                </Paragraph>

                <Card className={styles.demoCard}>
                  <div style={{ padding: '24px 24px 20px' }}>
                    <Title level={4} className={styles.h4}>Live Demo</Title>
                    <Paragraph className={styles.dim} style={{ margin: 0 }}>
                      Click to test the verification widget
                    </Paragraph>
                  </div>
                  <div className={styles.demoArea}>
                    <VerificationButton showCount={true} />
                  </div>
                </Card>

                <Divider className={styles.divider} />

                <Tabs
                  className={styles.tabs}
                  items={[
                    {
                      key: "react",
                      label: "React / Next.js",
                      children: (
                        <Card className={styles.codeCard}>
                          <Paragraph className={styles.dim}>Installation</Paragraph>
                          <pre className={styles.code}>
                            <code>{`npm install @notabot/react wagmi viem`}</code>
                          </pre>
                          <Divider className={styles.divider} />
                          <Paragraph className={styles.dim}>Usage</Paragraph>
                          <pre className={styles.codeLg}>
                            <code>{`import { VerificationButton } from '@notabot/react';

function App() {
  return (
    <VerificationButton 
      onVerified={(count) => alert(\`Verified: \${count}/4\`)}
      variant="primary"
      showCount={true}
    />
  );
}`}</code>
                          </pre>
                        </Card>
                      ),
                    },
                    {
                      key: "vanilla",
                      label: "Vanilla JS",
                      children: (
                        <Card className={styles.codeCard}>
                          <Paragraph className={styles.dim}>Include Script</Paragraph>
                          <pre className={styles.codeLg}>
                            <code>{`<script src="https://unpkg.com/@notabot/widget"></script>

<div id="notabot-verify"></div>

<script>
  NotABot.init({
    containerId: 'notabot-verify',
    chainId: 84532,
    onVerified: (status) => {
      console.log('Verified:', status);
    }
  });
</script>`}</code>
                          </pre>
                        </Card>
                      ),
                    },
                  ]}
                />
              </motion.div>
            </section>

            <section id="quickstart" className={styles.section}>
              <motion.div variants={fadeUp}>
                <Title level={2} className={styles.h2}>
                  Quick Start
                </Title>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Card className={styles.stepCard}>
                      <Title level={4} className={styles.h4}>
                        1. Install Package
                      </Title>
                      <pre className={styles.code}>
                        <code>{`npm install @notabot/contracts

# or

yarn add @notabot/contracts`}</code>
                      </pre>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card className={styles.stepCard}>
                      <Title level={4} className={styles.h4}>
                        2. Import & Use
                      </Title>
                      <pre className={styles.code}>
                        <code>{`import "@notabot/contracts/HumanityProtected.sol";

contract MyGame is HumanityProtected {
  constructor() HumanityProtected(ORACLE) {}
  function play() external onlyHuman {}
}`}</code>
                      </pre>
                    </Card>
                  </Col>
                </Row>
              </motion.div>
            </section>

            <section id="solidity" className={styles.section}>
              <motion.div variants={fadeUp}>
                <Title level={2} className={styles.h2}>
                  Solidity Integration
                </Title>
                <Card className={styles.codeCard}>
                  <pre className={styles.codeLg}>
                    <code>{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@notabot/contracts/base/HumanityProtected.sol";

// MainAggregator deployed at same address on all networks
address constant ORACLE = 0x8Cec9277d761f947e29EBeACc4035DDCDB10c2BD;

contract YourContract is HumanityProtected {
    constructor() HumanityProtected(ORACLE) {}
    
    function protectedFunction() external onlyHuman {
        // Only verified humans can call this
    }
    
    function premiumFeature() external minTrustScore(2) {
        // Requires 2+ verification sources
    }
    
    function checkUser(address user) external view returns (bool) {
        return _isVerifiedHuman(user);
    }
}`}</code>                                                                                                                                                                              
                  </pre>
                </Card>
              </motion.div>
            </section>

            <section id="examples" className={styles.section}>
              <motion.div variants={fadeUp}>
                <Title level={2} className={styles.h2}>
                  Usage Examples
                </Title>
                <Tabs
                  className={styles.tabs}
                  items={[
                    {
                      key: "mint",
                      label: "GameFi • Anti-bot NFT Mint",
                      children: (
                        <Card className={styles.codeCard}>
                          <pre className={styles.codeLg}>
                            <code>{`import "@notabot/contracts/base/HumanityProtected.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract GameNFT is ERC721, HumanityProtected {
  uint256 private _nextTokenId;
  
  constructor() 
    ERC721("GameNFT", "GNFT")
    HumanityProtected(ORACLE) 
  {}
  
  function mint() external onlyHuman {
    _safeMint(msg.sender, _nextTokenId++);
  }
}`}</code>
                          </pre>
                        </Card>
                      ),
                    },
                    {
                      key: "ranked",
                      label: "GameFi • Ranked Matchmaking",
                      children: (
                        <Card className={styles.codeCard}>
                          <pre className={styles.codeLg}>
                            <code>{`contract RankedGame is HumanityProtected {
  function queueRanked() external minTrustScore(1) {
    _enqueue(msg.sender);
  }
}`}</code>
                          </pre>
                        </Card>
                      ),
                    },
                    {
                      key: "airdrop",
                      label: "Airdrop • Sybil-resistant",
                      children: (
                        <Card className={styles.codeCard}>
                          <pre className={styles.codeLg}>
                            <code>{`import "@notabot/contracts/base/HumanityProtected.sol";

contract Airdrop is HumanityProtected {
  IERC20 public token;
  uint256 public constant AMOUNT = 100 * 1e18;
  mapping(address => bool) public claimed;
  
  constructor(address _token) HumanityProtected(ORACLE) {
    token = IERC20(_token);
  }
  
  function claim() external onlyHuman {
    require(!claimed[msg.sender], "Already claimed");
    claimed[msg.sender] = true;
    token.transfer(msg.sender, AMOUNT);
  }
}`}</code>
                          </pre>
                        </Card>
                      ),
                    },
                    {
                      key: "dao",
                      label: "DAO • Weighted Voting",
                      children: (
                        <Card className={styles.codeCard}>
                          <pre className={styles.codeLg}>
                            <code>{`contract DAO is HumanityProtected {
  function vote(uint256 id) external onlyHuman {
    uint256 weight = _getHumanityWeight(msg.sender);
    _castVote(msg.sender, id, weight);
  }
}`}</code>
                          </pre>
                        </Card>
                      ),
                    },
                    {
                      key: "market",
                      label: "Marketplace • Verified Sellers",
                      children: (
                        <Card className={styles.codeCard}>
                          <pre className={styles.codeLg}>
                            <code>{`contract Market is HumanityProtected {
  function listItem(uint256 id) external minTrustScore(2) {
    _list(msg.sender, id);
  }
}`}</code>
                          </pre>
                        </Card>
                      ),
                    },
                  ]}
                />
              </motion.div>
            </section>

            <section id="api" className={styles.section}>
              <motion.div variants={fadeUp}>
                <Title level={2} className={styles.h2}>
                  API Reference
                </Title>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Card className={styles.apiCard}>
                      <Title level={4} className={styles.h4}>
                        onlyHuman
                      </Title>
                      <Paragraph className={styles.dim}>
                        modifier onlyHuman
                      </Paragraph>
                      <Paragraph className={styles.di1}>
                        Restricts function to verified humans only. Reverts if caller has 0 verifications.
                      </Paragraph>
                      <Divider className={styles.divider} />
                      <Paragraph className={styles.dim}>Example</Paragraph>
                      <pre className={styles.code}>
                        <code>{`function mint() external onlyHuman {
  _mint(msg.sender);
}`}</code>
                      </pre>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card className={styles.apiCard}>
                      <Title level={4} className={styles.h4}>
                        minTrustScore
                      </Title>
                      <Paragraph className={styles.dim}>
                        modifier minTrustScore(uint256)
                      </Paragraph>
                      <Paragraph className={styles.di1}>
                        Requires minimum number of verifications. Trust score = HMT token balance.
                      </Paragraph>
                      <Divider className={styles.divider} />
                      <Paragraph className={styles.dim}>Example</Paragraph>
                      <pre className={styles.code}>
                        <code>{`function premium() external minTrustScore(2) {
  // requires 2+ verifications
}`}</code>
                      </pre>
                    </Card>
                  </Col>
                </Row>
              </motion.div>
            </section>

            <section id="network" className={styles.section}>
              <motion.div variants={fadeUp}>
                <Title level={2} className={styles.h2}>
                  Network & Gas
                </Title>
                <Card className={styles.noteCard}>
                  <Row gutter={[16, 16]}>
                    <Col xs={24}>
                      <Paragraph className={styles.dim}>
                        <Text className={styles.di1} strong>
                          NPM Package:
                        </Text>{" "}
                        <Text className={styles.di1} code>
                          @notabot/contracts
                        </Text>
                      </Paragraph>
                      <Paragraph className={styles.dim}>
                        <Text className={styles.di1} strong>
                          Supported Networks:
                        </Text>{" "}
                        Base Sepolia (84532) • Status Network Sepolia (1660990954)
                      </Paragraph>
                      <Paragraph className={styles.dim}>
                        <Text className={styles.di1} strong>
                          MainAggregator:
                        </Text>{" "}
                        <Text className={styles.di1} code>
                          0x8Cec9277d761f947e29EBeACc4035DDCDB10c2BD
                        </Text>
                      </Paragraph>
                    </Col>
                    <Col xs={24} md={8}>
                      <Paragraph className={styles.dim}>
                        <Text className={styles.di1} strong>
                          Check Gas:
                        </Text>{" "}
                        ~2,300 gas
                      </Paragraph>
                    </Col>
                    <Col xs={24} md={8}>
                      <Paragraph className={styles.dim}>
                        <Text className={styles.di1} strong>
                          Cost:
                        </Text>{" "}
                        &lt;$0.0001 per check
                      </Paragraph>
                    </Col>
                    <Col xs={24} md={8}>
                      <Paragraph className={styles.dim}>
                        <Text className={styles.di1} strong>
                          Type:
                        </Text>{" "}
                        View (zero gas)
                      </Paragraph>
                    </Col>
                  </Row>
                </Card>
              </motion.div>
            </section>

            <section id="support" className={styles.section}>
              <motion.div variants={fadeUp}>
                <Title level={2} className={styles.h2}>
                  Support
                </Title>
                <Card className={styles.supportCard}>
                  <Space wrap>
                    <Link href="https://github.com" target="_blank">
                      <Button className={styles.btnGhost}>GitHub</Button>
                    </Link>
                    <Link href="https://discord.com" target="_blank">
                      <Button className={styles.btnGhost}>Discord</Button>
                    </Link>
                    <Link href="/">
                      <Button type="primary" className={styles.btnPrimary}>
                        Back to Home
                      </Button>
                    </Link>
                  </Space>
                </Card>
              </motion.div>
            </section>
          </motion.div>
        </Content>
      </Layout>
    </Layout>
  );
}

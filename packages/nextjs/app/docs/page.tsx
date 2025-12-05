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
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

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
  { key: "quickstart", label: "Quick Start" },
  { key: "solidity", label: "Solidity Interface" },
  { key: "examples", label: "Usage Examples" },
  { key: "api", label: "API Reference" },
  { key: "math", label: "Math & Security" },
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
          <div className={styles.brandTitle}>NeoBot Docs</div>
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
                        NeoBot Integration Guide
                      </Title>
                      <Paragraph className={styles.lead}>
                        Like OpenZeppelin, but for sybil resistance. Copy HumanityProtected mixin from GitHub, 
                        add onlyHuman modifier, protect your contracts from bots. 
                        Aggregates Worldcoin, Gitcoin Passport, BrightID on multiple chains.
                      </Paragraph>
                      <Space wrap>
                        <Tag className={styles.tagPrimary}>Status Network</Tag>
                        <Tag className={styles.tagPrimary}>Base Sepolia</Tag>
                        <Tag className={styles.tagSoft}>Abstract Mixin</Tag>
                        <Tag className={styles.tagMono}>git clone</Tag>
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

            <section id="quickstart" className={styles.section}>
              <motion.div variants={fadeUp}>
                <Title level={2} className={styles.h2}>
                  Quick Start
                </Title>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Card className={styles.stepCard}>
                      <Title level={4} className={styles.h4}>
                        1. Clone & Copy
                      </Title>
                      <pre className={styles.code}>
                        <code>{`git clone https://github.com/your/repo
cp packages/hardhat/contracts/base/HumanityProtected.sol .
cp packages/hardhat/contracts/interfaces/IHumanityOracle.sol .`}</code>
                      </pre>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card className={styles.stepCard}>
                      <Title level={4} className={styles.h4}>
                        2. Inherit & Use
                      </Title>
                      <pre className={styles.code}>
                        <code>{`import "./HumanityProtected.sol";

contract MyGame is HumanityProtected {
  constructor() HumanityProtected(ORACLE_ADDR) {}
  function play() external onlyHuman { }
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
                    <code>{`import "./HumanityProtected.sol";

// MainAggregator on Status Network
address constant ORACLE = 0x8Cec9277d761f947e29EBeACc4035DDCDB10c2BD;

contract YourContract is HumanityProtected {
    constructor() HumanityProtected(ORACLE) {}
    
    // Only verified humans can call
    function protectedFunction() external onlyHuman {
        // your logic
    }
    
    // Require minimum trust score (2+ verifications)
    function premiumFeature() external minTrustScore(2) {
        // requires 2+ sources
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
                            <code>{`contract GameNFT is ERC721, HumanityProtected {
  function mint() external onlyHuman {
    _safeMint(msg.sender, nextTokenId++);
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
                            <code>{`contract Airdrop is HumanityProtected {
  function claim() external onlyHuman {
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

            <section id="math" className={styles.section}>
              <motion.div variants={fadeUp}>
                <Title level={2} className={styles.h2}>
                  Math & Security
                </Title>
                
                <Card className={styles.codeCard} style={{ marginBottom: 24 }}>
                  <Title level={3} className={styles.h3}>
                    Bayesian Aggregation
                  </Title>
                  <Paragraph className={styles.di1}>
                    NeoBot uses Bayes' theorem to combine probabilities from multiple independent verification sources. 
                    Each source provides an independent estimate of the probability that a user is human.
                  </Paragraph>
                  <Divider className={styles.divider} />
                  <Paragraph className={styles.dim} strong>Formula:</Paragraph>
                  <BlockMath math="P(Human | E_1, E_2, ..., E_n) = 1 - \prod_{i=1}^{n}(1 - P_i)" />
                  <Paragraph className={styles.di1} style={{ marginTop: 16 }}>
                    Where <InlineMath math="P_i" /> is the confidence score from source <InlineMath math="i" />, 
                    calculated as <InlineMath math="P_i = \frac{TPR_i}{TPR_i + FPR_i}" />.
                  </Paragraph>
                  <Paragraph className={styles.dim} style={{ marginTop: 16 }} strong>Example:</Paragraph>
                  <Paragraph className={styles.di1}>
                    If Worldcoin (99.9%), Gitcoin (90.9%), and PoH (79.5%) all verify a user:
                  </Paragraph>
                  <BlockMath math="P_{final} = 1 - (1-0.999)(1-0.909)(1-0.795) = 99.999\%" />
                </Card>

                <Card className={styles.codeCard} style={{ marginBottom: 24 }}>
                  <Title level={3} className={styles.h3}>
                    Attack Detection
                  </Title>
                  <Paragraph className={styles.di1}>
                    The contract automatically detects suspicious patterns that may indicate Sybil attacks:
                  </Paragraph>
                  <ul style={{ marginTop: 12, paddingLeft: 24 }}>
                    <li className={styles.di1}>
                      <Text strong>Rapid verification bursts:</Text> More than 5 verifications in 24 hours
                    </li>
                    <li className={styles.di1}>
                      <Text strong>Low quality scores:</Text> All verifications from Gitcoin with score &lt; 30
                    </li>
                    <li className={styles.di1}>
                      <Text strong>Pattern analysis:</Text> Cross-source correlation detection
                    </li>
                  </ul>
                  <Divider className={styles.divider} />
                  <Paragraph className={styles.dim} strong>On-chain Events:</Paragraph>
                  <pre className={styles.code}>
                    <code>{`event AnomalyDetected(address indexed user, string reason);
event AttackConfirmed(uint8 indexed sourceId, address indexed user);`}</code>
                  </pre>
                </Card>

                <Card className={styles.codeCard}>
                  <Title level={3} className={styles.h3}>
                    Adaptive Confidence Updates
                  </Title>
                  <Paragraph className={styles.di1}>
                    When an attack is confirmed, the system automatically updates the False Positive Rate (FPR) 
                    for that source, which adjusts its confidence score:
                  </Paragraph>
                  <Divider className={styles.divider} />
                  <Paragraph className={styles.dim} strong>Update Formula:</Paragraph>
                  <BlockMath math="FPR_{new} = \frac{confirmedAttacks}{totalVerifications}" />
                  <BlockMath math="confidence_{new} = \frac{TPR}{TPR + FPR_{new}}" />
                  <Paragraph className={styles.di1} style={{ marginTop: 16 }}>
                    This creates a self-improving system where sources with higher attack rates 
                    automatically receive lower confidence scores, making the system more resilient over time.
                  </Paragraph>
                  <Divider className={styles.divider} />
                  <Paragraph className={styles.dim} strong>Example:</Paragraph>
                  <Paragraph className={styles.di1}>
                    If a source has 1000 verifications and 10 confirmed attacks:
                  </Paragraph>
                  <BlockMath math="FPR = \frac{10}{1000} = 1\%" />
                  <BlockMath math="confidence = \frac{0.95}{0.95 + 0.01} = 98.96\%" />
                </Card>
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
                          Networks:
                        </Text>{" "}
                        Status Network Sepolia (1660990954) • Base Sepolia (84532)
                      </Paragraph>
                      <Paragraph className={styles.dim}>
                        <Text className={styles.di1} strong>
                          MainAggregator (same on both):
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
                        ~$0.0001 per check
                      </Paragraph>
                    </Col>
                    <Col xs={24} md={8}>
                      <Paragraph className={styles.dim}>
                        <Text className={styles.di1} strong>
                          Type:
                        </Text>{" "}
                        View call (read-only)
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

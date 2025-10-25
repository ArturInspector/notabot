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
          <div className={styles.brandSub}>Ethereum dev stack</div>
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
                        One verification, access to Worldcoin, Gitcoin Passport,
                        Proof of Humanity, BrightID. Integrate once and ship
                        Sybil-resistant apps.
                      </Paragraph>
                      <Space wrap>
                        <Tag className={styles.tagPrimary}>Base</Tag>
                        <Tag className={styles.tagSoft}>Main Aggregator</Tag>
                        <Tag className={styles.tagMono}>0x...YOUR_ADDRESS</Tag>
                      </Space>
                      <div className={styles.ctaRow}>
                        <Link href="#quickstart">
                          <Button
                            size="large"
                            type="primary"
                            className={styles.btnPrimary}
                          >
                            Start in 2 steps
                          </Button>
                        </Link>
                        <Link href="#api">
                          <Button size="large" className={styles.btnGhost}>
                            API
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
                        1. Import the interface
                      </Title>
                      <pre className={styles.code}>
                        <code>{`interface IHumanityOracle {
  function isVerifiedHuman(address) external view returns (bool);
  function getTrustScore(address) external view returns (uint256);
}`}</code>
                      </pre>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card className={styles.stepCard}>
                      <Title level={4} className={styles.h4}>
                        2. Call the contract
                      </Title>
                      <pre className={styles.code}>
                        <code>{`bool ok = IHumanityOracle(0xYOUR_ADDRESS).isVerifiedHuman(msg.sender);`}</code>
                      </pre>
                    </Card>
                  </Col>
                </Row>
              </motion.div>
            </section>

            <section id="solidity" className={styles.section}>
              <motion.div variants={fadeUp}>
                <Title level={2} className={styles.h2}>
                  Solidity Interface
                </Title>
                <Card className={styles.codeCard}>
                  <pre className={styles.codeLg}>
                    <code>{`interface IHumanityOracle {
  function isVerifiedHuman(address user) external view returns (bool);
  function getTrustScore(address user) external view returns (uint256);
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
                            <code>{`function mint() external {
  require(IHumanityOracle(0xYOUR_ADDRESS).isVerifiedHuman(msg.sender));
  _safeMint(msg.sender, nextTokenId++);
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
                            <code>{`function queueRanked() external {
  require(IHumanityOracle(0xYOUR_ADDRESS).getTrustScore(msg.sender) >= 1);
  _enqueue(msg.sender);
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
                            <code>{`function claim() external {
  require(IHumanityOracle(0xYOUR_ADDRESS).isVerifiedHuman(msg.sender));
  _distribute(msg.sender);
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
                            <code>{`function vote(uint256 proposalId, uint8 choice) external {
  uint256 score = IHumanityOracle(0xYOUR_ADDRESS).getTrustScore(msg.sender);
  uint256 weight = 1 + score;
  _vote(msg.sender, proposalId, choice, weight);
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
                            <code>{`function listItem(uint256 id, uint256 price) external {
  require(IHumanityOracle(0xYOUR_ADDRESS).getTrustScore(msg.sender) >= 2);
  _list(msg.sender, id, price);
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
                        isVerifiedHuman
                      </Title>
                      <Paragraph className={styles.dim}>
                        isVerifiedHuman(address user) → bool
                      </Paragraph>
                      <Paragraph className={styles.di1}>
                        Returns true if the user is verified by at least one
                        provider.
                      </Paragraph>
                      <Divider className={styles.divider} />
                      <Paragraph className={styles.dim}>Example</Paragraph>
                      <pre className={styles.code}>
                        <code>{`require(IHumanityOracle(0xYOUR_ADDRESS).isVerifiedHuman(msg.sender));`}</code>
                      </pre>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card className={styles.apiCard}>
                      <Title level={4} className={styles.h4}>
                        getTrustScore
                      </Title>
                      <Paragraph className={styles.dim}>
                        getTrustScore(address user) → uint256 (0–4)
                      </Paragraph>
                      <Paragraph className={styles.di1}>
                        Number of distinct verifications aggregated for the
                        user.
                      </Paragraph>
                      <Divider className={styles.divider} />
                      <Paragraph className={styles.dim}>Example</Paragraph>
                      <pre className={styles.code}>
                        <code>{`require(IHumanityOracle(0xYOUR_ADDRESS).getTrustScore(msg.sender) >= 2);`}</code>
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
                    <Col xs={24} md={12}>
                      <Paragraph className={styles.dim}>
                        <Text className={styles.di1} strong>
                          Deployed Network:
                        </Text>{" "}
                        Base
                      </Paragraph>
                      <Paragraph className={styles.dim}>
                        <Text className={styles.di1} strong>
                          Aggregator:
                        </Text>{" "}
                        <Text className={styles.di1} code>
                          0x...YOUR_ADDRESS
                        </Text>
                      </Paragraph>
                      <Paragraph className={styles.dim}>
                        <Text className={styles.di1} strong>
                          Average Gas:
                        </Text>{" "}
                        ~2,300 gas per check
                      </Paragraph>
                    </Col>
                    <Col xs={24} md={12}>
                      <Paragraph className={styles.dim}>
                        <Text className={styles.di1} strong>
                          USD Cost (Base):
                        </Text>{" "}
                        ~$0.0001 per check
                      </Paragraph>
                      <Paragraph className={styles.dim}>
                        <Text className={styles.di1} strong>
                          Latency:
                        </Text>{" "}
                        Single read-only view call
                      </Paragraph>
                      <Paragraph className={styles.dim}>
                        <Text className={styles.di1} strong>
                          Privacy:
                        </Text>{" "}
                        No personal data stored on-chain
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

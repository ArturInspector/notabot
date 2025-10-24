'use client'
import React from 'react'

import { Button, Row, Col, Card, Tag } from 'antd'
import { motion, type Variants, easeOut, animate } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

import { Rocket } from '@/shared/assets/images'

import styles from './page.module.css'

type CounterProps = { to: number; prefix?: string; suffix?: string; decimals?: number; duration?: number }

function AnimatedCounter({ to, prefix = '', suffix = '', decimals = 0, duration = 1.6 }: CounterProps) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const start = React.useRef<number>(0)

  React.useEffect(() => {
    const controls = animate(start.current, to, {
      duration,
      ease: easeOut,
      onUpdate: v => {
        if (ref.current) ref.current.textContent = `${prefix}${v.toFixed(decimals)}${suffix}`
      },
    })

    return () => controls.stop()
  }, [to, duration])

  return <span ref={ref} className={styles.counter} />
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
}

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

export default function MainPage() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <video className={styles.heroVideo} autoPlay muted playsInline loop>
          <source src="/sparks-bg.mp4" type="video/mp4" />
        </video>
        <motion.div
          className={styles.orb}
          aria-hidden
          animate={{ scale: [1, 1.06, 1], opacity: [0.55, 0.8, 0.55] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />
        <div className={styles.heroOverlay} />
        <motion.div className={styles.heroContent} initial="hidden" animate="show" variants={stagger}>
          <motion.div variants={fadeUp} className={styles.badge}>Stripe for Web3 Identity</motion.div>
          <motion.h1 variants={fadeUp} className={styles.title}>HumanityOracle</motion.h1>
          <motion.p variants={fadeUp} className={styles.subtitle}>One API. Every proof-of-humanity source.</motion.p>
          <motion.div variants={fadeUp} className={styles.ctaRow}>
            <Link href="/docs" className={styles.ctaPrimary}>
              <Button size="large" type="primary" className={styles.btnPrimary}>Read the Docs →</Button>
            </Link>
            <Link href="#contact" className={styles.ctaSecondary}>
              <Button size="large" className={styles.btnSecondary}>Join the Mission</Button>
            </Link>
          </motion.div>
          <motion.div variants={fadeUp} className={styles.providers}>
            <Tag className={styles.tag}>Worldcoin</Tag>
            <Tag className={styles.tag}>Gitcoin Passport</Tag>
            <Tag className={styles.tag}>Proof of Humanity</Tag>
            <Tag className={styles.tag}>BrightID</Tag>
          </motion.div>
        </motion.div>
      </section>

      <section className={styles.section} id="problem">
        <div className={styles.container}>
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={12}>
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
                <h2 className={styles.h2}>The Global Problem</h2>
                <p className={styles.lead}>The internet is drowning in bots. Every Web3 game, airdrop, and DAO faces the same issue — Sybil attacks.</p>
                <ul className={styles.bullets}>
                  <li><span>$1B+ </span>in rewards are stolen by bots each year.</li>
                  <li><span>60–90% </span>of airdrop participants aren’t real humans.</li>
                  <li>Developers integrate multiple fragmented verification systems.</li>
                  <li>Users are forced to re-verify in every app.</li>
                  <li>No single, trusted standard for Web3 identity.</li>
                </ul>
              </motion.div>
            </Col>
            <Col xs={24} md={12}>
              <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
                <Card className={styles.statCard}>
                  <div className={styles.statGrid}>
                    <div>
                      <div className={styles.statNumber}><AnimatedCounter to={1} prefix="$" suffix="B+" /></div>
                      <div className={styles.statLabel}>Value lost to Sybil attacks annually</div>
                    </div>
                    <div>
                      <div className={styles.statNumber}>60–<AnimatedCounter to={90} suffix="%" /></div>
                      <div className={styles.statLabel}>Non-human airdrop participants</div>
                    </div>
                    <div>
                      <div className={styles.statNumber}><AnimatedCounter to={1} /></div>
                      <div className={styles.statLabel}>API to unify verification</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </div>
      </section>

      <section className={styles.sectionAlt} id="mission">
        <div className={styles.container}>
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={12}>
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
                <h2 className={styles.h2}>Our Mission</h2>
                <p className={styles.text}>To make proof of humanity as easy to integrate as payments. We unify major verification providers into a single standard API so builders focus on shipping and users stay verified everywhere.</p>
              </motion.div>
            </Col>
            <Col xs={24} md={12}>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
                <Card className={styles.cardGradient}>
                  <h3 className={`${styles.h3} ${styles.h3OnDark}`}>One Integration → Global Verification</h3>
                  <p className={styles.text}>Connect once. Access Worldcoin, Gitcoin Passport, Proof of Humanity, BrightID and more. HumanityOracle caches verified status on-chain for interoperable checks across protocols.</p>
                </Card>
                <div className={styles.mediaPlaceholder}>
                  <Image className={styles.imageRocket} src={Rocket.src} alt="rocket" width={0} height={0} sizes="100vw"/>
                </div>
              </motion.div>
            </Col>
          </Row>
        </div>
      </section>

      <section className={styles.section} id="product">
        <div className={styles.container}>
          <h2 className={styles.h2Center}>Our Product</h2>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12} lg={8}>
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              >
                <Card className={styles.featureCard}>
                  <h3 className={`${styles.h3} ${styles.h3OnDark}`}>Unified API</h3>
                  <p className={styles.text}>One endpoint for all major PoH sources with normalized responses.</p>
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              >
                <Card className={styles.featureCard}>
                  <h3 className={`${styles.h3} ${styles.h3OnDark}`}>On-chain Cache</h3>
                  <p className={styles.text}>Query verified human status on-chain for transparency and composability.</p>
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              >
                <Card className={styles.featureCard}>
                  <h3 className={`${styles.h3} ${styles.h3OnDark}`}>Open SDKs</h3>
                  <p className={styles.text}>Solidity, TypeScript, and Python SDKs for rapid integration.</p>
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              >
                <Card className={styles.featureCard}>
                  <h3 className={`${styles.h3} ${styles.h3OnDark}`}>Privacy-Preserving</h3>
                  <p className={styles.text}>Privacy-first and zero-knowledge ready. No personal data stored.</p>
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              >
                <Card className={styles.featureCard}>
                  <h3 className={`${styles.h3} ${styles.h3OnDark}`}>Scalable</h3>
                  <p className={styles.text}>Built for high-throughput checks with minimal setup.</p>
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              >
                <Card className={styles.featureCard}>
                  <h3 className={`${styles.h3} ${styles.h3OnDark}`}>Interoperable</h3>
                  <p className={styles.text}>Works across chains and protocols via a standard interface.</p>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </div>
      </section>

      <section className={styles.sectionAlt} id="how-it-works">
        <div className={styles.container}>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={10}>
              <h2 className={styles.h2}>How It Works</h2>
              <p className={styles.text}>Users verify via any supported provider. HumanityOracle aggregates and normalizes proofs. A unified Humanity Score or Verified Human status is stored on-chain. Apps call our API to check humanity instantly.</p>
            </Col>
            <Col xs={24} md={14}>
              <div className={styles.steps}>
                <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} viewport={{ once: true }} className={styles.step}>
                  <div className={styles.stepIndex}>1</div>
                  <div className={styles.stepBody}>
                    <h4 className={styles.h4}>Verify</h4>
                    <p className={styles.text}>User completes verification with Worldcoin, Gitcoin Passport, PoH, BrightID, or others.</p>
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} viewport={{ once: true }} className={styles.step}>
                  <div className={styles.stepIndex}>2</div>
                  <div className={styles.stepBody}>
                    <h4 className={styles.h4}>Aggregate</h4>
                    <p className={styles.text}>We aggregate and normalize proofs into a single, consistent format.</p>
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} viewport={{ once: true }} className={styles.step}>
                  <div className={styles.stepIndex}>3</div>
                  <div className={styles.stepBody}>
                    <h4 className={styles.h4}>Cache on-chain</h4>
                    <p className={styles.text}>We write a verified status or score on-chain for transparent, interoperable checks.</p>
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} viewport={{ once: true }} className={styles.step}>
                  <div className={styles.stepIndex}>4</div>
                  <div className={styles.stepBody}>
                    <h4 className={styles.h4}>Integrate</h4>
                    <p className={styles.text}>Apps call one API or use our SDKs to perform instant humanity checks.</p>
                  </div>
                </motion.div>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      <section className={styles.section} id="why">
        <div className={styles.container}>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <Card className={styles.valueCard}>
                <h3 className={styles.h3}>For Developers</h3>
                <p className={styles.text}>Stop integrating five APIs. Integrate once and ship faster.</p>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className={styles.valueCard}>
                <h3 className={styles.h3}>For Users</h3>
                <p className={styles.text}>One verification, infinite access. Keep control over your privacy.</p>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className={styles.valueCard}>
                <h3 className={styles.h3}>For the Ecosystem</h3>
                <p className={styles.text}>Reduce Sybil attacks, increase trust, and unlock fair incentives.</p>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      <section className={styles.sectionAlt} id="faq">
        <div className={styles.container}>
          <h2 className={styles.h2Center}>Frequently Asked Questions</h2>
          <div className={styles.faqWrap}>
            <Card className={styles.faqCard}>
              <div className={styles.faqItem}>
                <h4 style={{ fontWeight: '700' }} className={styles.h4}>Is HumanityOracle another verification provider?</h4>
                <p className={styles.text}>No. We’re an aggregator that connects and unifies existing proof systems.</p>
              </div>
              <div className={styles.faqItem}>
                <h4 style={{ fontWeight: '700' }} className={styles.h4}>Do users need to verify again?</h4>
                <p className={styles.text}>No. If a user is verified via Worldcoin, Gitcoin, or PoH, they’re already human in our system.</p>
              </div>
              <div className={styles.faqItem}>
                <h4 style={{ fontWeight: '700' }} className={styles.h4}>How do developers integrate?</h4>
                <p className={styles.text}>Through a single API and SDKs for Solidity, TypeScript, and Python.</p>
              </div>
              <div className={styles.faqItem}>
                <h4 style={{ fontWeight: '700' }} className={styles.h4}>Is the data stored on-chain?</h4>
                <p className={styles.text}>Yes. We cache verification status on-chain for transparency and interoperability.</p>
              </div>
              <div className={styles.faqItem}>
                <h4 style={{ fontWeight: '700' }} className={styles.h4}>What about privacy?</h4>
                <p className={styles.text}>We never store personal data. Privacy-first and zero-knowledge compatible by design.</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className={styles.sectionCta} id="contact">
        <div className={styles.containerNarrow}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
            <h2 className={styles.h2Center}>Build with HumanityOracle</h2>
            <p className={styles.leadCenter}>Start building with the API today. Join the future of trusted on-chain identity.</p>
            <div className={styles.ctaRowCenter}>
              <Link href="/docs">
                <Button size="large" type="primary" className={styles.btnPrimary}>Read the Docs →</Button>
              </Link>
              <Link href="/contact">
                <Button size="large" className={styles.btnSecondary}>Talk to Us</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}

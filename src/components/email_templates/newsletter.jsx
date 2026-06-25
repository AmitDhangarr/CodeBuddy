import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";

/**
 * NewsletterEmail Props:
 * @param {string} recipientName     - Name of the subscriber
 * @param {string} issueNumber       - Issue number (e.g. "#42")
 * @param {string} issueDate         - Date of issue (e.g. "June 25, 2024")
 * @param {string} headline          - Main headline / featured story title
 * @param {string} headlineExcerpt   - Short excerpt for the main story
 * @param {string} headlineUrl       - URL to the full main story
 * @param {Array<{title: string, excerpt: string, url: string}>} articles - Array of additional article objects
 * @param {string} tipOfTheWeek      - A short dev tip string
 * @param {string} unsubscribeUrl    - Unsubscribe link
 */
export default function NewsletterEmail({
  recipientName = "Dev",
  issueNumber = "#42",
  issueDate = "June 25, 2024",
  headline = "Why TypeScript 5.5 Changes Everything",
  headlineExcerpt =
    "The new inferred type predicates feature alone will save thousands of lines of boilerplate. Here's what changed and how to upgrade now.",
  headlineUrl = "https://codebuddy.dev/newsletter/typescript-55",
  articles = [
    {
      title: "10 React Patterns You Should Unlearn",
      excerpt: "Some patterns that were gold in 2020 are now dead weight. Time to refactor.",
      url: "https://codebuddy.dev/articles/react-anti-patterns",
    },
    {
      title: "The Fastest Node.js Frameworks in 2024",
      excerpt: "Benchmarked: Express, Fastify, Hono, and ElysiaJS go head to head.",
      url: "https://codebuddy.dev/articles/node-benchmarks",
    },
    {
      title: "CSS Grid vs Flexbox: When to Use Which",
      excerpt: "A visual decision guide for layout choices — no more guessing.",
      url: "https://codebuddy.dev/articles/grid-vs-flexbox",
    },
  ],
  tipOfTheWeek = "Use `structuredClone()` instead of JSON.parse(JSON.stringify()) for deep-cloning objects in Node 17+. It's faster and handles circular references.",
  unsubscribeUrl = "https://codebuddy.dev/unsubscribe?token=abc123",
}) {
  return (
    <Html>
      <Head />
      <Preview>CodeBuddy Weekly {issueNumber} — {headline}</Preview>
      <Body style={main}>
        <Section style={header}>
          <Row>
            <Column>
              <Text style={logo}>⚡ CodeBuddy</Text>
            </Column>
            <Column style={issueMeta}>
              <Text style={issueLabel}>
                {issueNumber} · {issueDate}
              </Text>
            </Column>
          </Row>
        </Section>

        <Container style={container}>
          {/* Hero */}
          <Section style={heroBand}>
            <Text style={heroEyebrow}>WEEKLY DIGEST</Text>
            <Heading style={heroHeading}>The code news that matters.</Heading>
            <Text style={heroSub}>No fluff, no filler — just the best dev content this week.</Text>
          </Section>

          {/* Featured Article */}
          <Section style={featuredSection}>
            <Text style={featuredLabel}>🔥 THIS WEEK'S FEATURE</Text>
            <Heading style={featuredTitle}>{headline}</Heading>
            <Text style={featuredExcerpt}>{headlineExcerpt}</Text>
            <Button style={readButton} href={headlineUrl}>
              Read Full Story →
            </Button>
          </Section>

          <Hr style={divider} />

          {/* More Articles */}
          <Section style={articlesSection}>
            <Text style={sectionLabel}>MORE THIS WEEK</Text>
            {articles.map((article, i) => (
              <React.Fragment key={i}>
                <Row style={articleRow}>
                  <Column style={articleNumCol}>
                    <Text style={articleNum}>0{i + 1}</Text>
                  </Column>
                  <Column style={articleContentCol}>
                    <Link href={article.url} style={articleTitle}>
                      {article.title}
                    </Link>
                    <Text style={articleExcerpt}>{article.excerpt}</Text>
                  </Column>
                </Row>
                {i < articles.length - 1 && <Hr style={microDivider} />}
              </React.Fragment>
            ))}
          </Section>

          <Hr style={divider} />

          {/* Tip of the Week */}
          <Section style={tipSection}>
            <Text style={sectionLabel}>💡 TIP OF THE WEEK</Text>
            <Text style={tipText}>{tipOfTheWeek}</Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>© 2024 CodeBuddy Inc. · All rights reserved.</Text>
            <Text style={footerText}>
              You're receiving this because you subscribed as {recipientName}.
            </Text>
            <Text style={footerText}>
              <Link href={unsubscribeUrl} style={footerLink}>Unsubscribe</Link>
              {" · "}
              <Link href="https://codebuddy.dev/privacy" style={footerLink}>Privacy Policy</Link>
              {" · "}
              <Link href="https://codebuddy.dev/newsletter/archive" style={footerLink}>Archive</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: "#0D0D0D", fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" };
const header = { backgroundColor: "#0D0D0D", padding: "24px 40px", borderBottom: "2px solid #FF4D00" };
const logo = { color: "#FF4D00", fontSize: "22px", fontWeight: "900", letterSpacing: "-0.5px", margin: "0" };
const issueMeta = { textAlign: "right", verticalAlign: "middle" };
const issueLabel = { color: "#555", fontSize: "12px", fontWeight: "600", margin: "0" };
const container = { maxWidth: "600px", margin: "0 auto", backgroundColor: "#141414", border: "1px solid #222" };
const heroBand = { backgroundColor: "#FF4D00", padding: "40px 40px 36px" };
const heroEyebrow = { color: "#FFD6C4", fontSize: "11px", fontWeight: "800", letterSpacing: "3px", margin: "0 0 10px" };
const heroHeading = { color: "#FFFFFF", fontSize: "32px", fontWeight: "900", lineHeight: "1.1", margin: "0 0 10px", letterSpacing: "-1px" };
const heroSub = { color: "#FFD6C4", fontSize: "14px", lineHeight: "1.5", margin: "0" };
const featuredSection = { padding: "36px 40px", backgroundColor: "#1A1A1A" };
const featuredLabel = { color: "#FF4D00", fontSize: "12px", fontWeight: "800", letterSpacing: "2px", margin: "0 0 14px" };
const featuredTitle = { color: "#FFFFFF", fontSize: "26px", fontWeight: "900", lineHeight: "1.2", margin: "0 0 14px", letterSpacing: "-0.5px" };
const featuredExcerpt = { color: "#AAAAAA", fontSize: "14px", lineHeight: "1.7", margin: "0 0 24px" };
const readButton = { backgroundColor: "#FF4D00", color: "#FFFFFF", fontSize: "15px", fontWeight: "800", textDecoration: "none", padding: "14px 32px", borderRadius: "4px", display: "inline-block" };
const divider = { borderColor: "#222", margin: "0" };
const microDivider = { borderColor: "#1E1E1E", margin: "0" };
const articlesSection = { padding: "32px 40px" };
const sectionLabel = { color: "#FF4D00", fontSize: "11px", fontWeight: "800", letterSpacing: "3px", margin: "0 0 20px" };
const articleRow = { paddingBottom: "20px", paddingTop: "20px" };
const articleNumCol = { width: "48px", verticalAlign: "top" };
const articleNum = { color: "#333", fontSize: "22px", fontWeight: "900", margin: "0", fontFamily: "monospace" };
const articleContentCol = { verticalAlign: "top" };
const articleTitle = { color: "#FFFFFF", fontSize: "16px", fontWeight: "700", textDecoration: "none", display: "block", marginBottom: "6px" };
const articleExcerpt = { color: "#777", fontSize: "13px", lineHeight: "1.6", margin: "0" };
const tipSection = { padding: "28px 40px", backgroundColor: "#1A1A1A" };
const tipText = { color: "#E0E0E0", fontSize: "14px", lineHeight: "1.7", margin: "0", borderLeft: "3px solid #FF4D00", paddingLeft: "16px", fontFamily: "monospace" };
const footerSection = { padding: "24px 40px 32px", textAlign: "center" };
const footerText = { color: "#444", fontSize: "12px", margin: "0 0 6px" };
const footerLink = { color: "#666", textDecoration: "underline" };
import { Header } from '@/components/Header';

export default function Terms() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8 prose prose-neutral dark:prose-invert">
        <h1>Terms of Service</h1>
        <p className="text-muted-foreground">Last updated: February 10, 2026</p>

        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using OpenApp, you agree to be bound by these Terms of Service. If you do not agree, do not use the platform.</p>

        <h2>2. Description of Service</h2>
        <p>OpenApp is a mobile app discovery and ad network platform built on Pi Network. It allows developers to submit apps, advertisers to create ad campaigns, and users to discover quality applications.</p>

        <h2>3. User Accounts</h2>
        <ul>
          <li>You must provide accurate information when creating an account</li>
          <li>You are responsible for maintaining the security of your account</li>
          <li>You must not impersonate others or create misleading accounts</li>
        </ul>

        <h2>4. App Submissions</h2>
        <ul>
          <li>All submitted apps are subject to review and approval by our moderation team</li>
          <li>Apps must not contain malicious code, misleading content, or violate any laws</li>
          <li>We reserve the right to reject or remove any app at our discretion</li>
        </ul>

        <h2>5. Advertising</h2>
        <ul>
          <li>Ad content must comply with all applicable laws and regulations</li>
          <li>Fraudulent clicks, impressions, or engagement manipulation is strictly prohibited</li>
          <li>Ad campaigns are subject to moderation and approval</li>
        </ul>

        <h2>6. Pi Network Integration</h2>
        <p>Payments processed through Pi Network are subject to Pi Network's terms of service. OpenApp is not responsible for Pi Network platform availability or transaction issues.</p>

        <h2>7. Intellectual Property</h2>
        <p>You retain ownership of content you submit. By submitting content, you grant OpenApp a non-exclusive license to display and distribute it on the platform.</p>

        <h2>8. Limitation of Liability</h2>
        <p>OpenApp is provided "as is" without warranties. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p>

        <h2>9. Termination</h2>
        <p>We may suspend or terminate your access for violations of these terms. You may delete your account at any time.</p>

        <h2>10. Changes to Terms</h2>
        <p>We may update these terms at any time. Continued use after changes constitutes acceptance.</p>

        <p className="text-sm text-muted-foreground mt-8">© 2025 MRWAIN ORGANIZATION. All rights reserved.</p>
      </main>
    </div>
  );
}

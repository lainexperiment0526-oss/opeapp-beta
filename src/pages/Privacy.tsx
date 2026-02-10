import { Header } from '@/components/Header';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8 prose prose-neutral dark:prose-invert">
        <h1>Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: February 10, 2026</p>

        <h2>1. Information We Collect</h2>
        <p>OpenApp collects the following information when you use our platform:</p>
        <ul>
          <li><strong>Account Information:</strong> Username, email address, and authentication data via Pi Network or email sign-up.</li>
          <li><strong>App Data:</strong> Information you provide when submitting apps, including app names, descriptions, logos, screenshots, and URLs.</li>
          <li><strong>Ad Campaign Data:</strong> Media files, targeting preferences, and budget information for ad campaigns.</li>
          <li><strong>Usage Data:</strong> Ad impressions, clicks, and engagement metrics collected through our ad network.</li>
          <li><strong>Device Information:</strong> IP address, user agent, and browser type for analytics and security purposes.</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>To provide, maintain, and improve the OpenApp platform</li>
          <li>To serve and track advertisements across integrated apps</li>
          <li>To process payments through Pi Network</li>
          <li>To moderate and review submitted content</li>
          <li>To communicate important updates about our service</li>
        </ul>

        <h2>3. Data Sharing</h2>
        <p>We do not sell your personal information. We may share data with:</p>
        <ul>
          <li>Pi Network for authentication and payment processing</li>
          <li>App developers (aggregated ad performance data only)</li>
          <li>Law enforcement when required by law</li>
        </ul>

        <h2>4. Data Security</h2>
        <p>We use industry-standard encryption and security measures to protect your data. API keys are securely generated and stored.</p>

        <h2>5. Your Rights</h2>
        <p>You can request access to, correction of, or deletion of your personal data by contacting us. You can delete your account and associated data at any time.</p>

        <h2>6. Contact</h2>
        <p>For privacy-related inquiries, contact MRWAIN ORGANIZATION.</p>

        <p className="text-sm text-muted-foreground mt-8">© 2025 MRWAIN ORGANIZATION. All rights reserved.</p>
      </main>
    </div>
  );
}

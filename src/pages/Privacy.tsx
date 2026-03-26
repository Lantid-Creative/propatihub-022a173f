import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sections = [
  { title: "1. Information We Collect", content: "We collect information you provide directly (name, email, phone number) and information collected automatically (IP address, browser type, usage data) when you use PropatiHub." },
  { title: "2. How We Use Your Information", content: "We use your information to provide and improve our services, send relevant communications, process transactions, and ensure the security of our platform." },
  { title: "3. Information Sharing", content: "We do not sell your personal information. We may share information with estate agents when you make an inquiry, with service providers who help us operate the platform, or when required by law." },
  { title: "4. Data Security", content: "We implement industry-standard security measures to protect your information. However, no method of transmission over the internet is 100% secure." },
  { title: "5. Cookies", content: "PropatiHub uses cookies to enhance your browsing experience, remember preferences, and analyse platform usage. You can manage cookie preferences in your browser settings." },
  { title: "6. Your Rights", content: "You have the right to access, correct, or delete your personal data. You may also object to certain processing activities. Contact us to exercise these rights." },
  { title: "7. Data Retention", content: "We retain your information for as long as necessary to provide our services and comply with legal obligations. You can request deletion of your account at any time." },
  { title: "8. Third-Party Links", content: "Our platform may contain links to third-party websites. We are not responsible for the privacy practices of those sites." },
  { title: "9. Children's Privacy", content: "PropatiHub is not intended for children under 18. We do not knowingly collect personal information from minors." },
  { title: "10. Contact", content: "For questions about this privacy policy, contact us at privacy@propatihub.com." },
];

const Privacy = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Navbar />
    <section className="bg-primary pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h1 className="font-heading text-3xl md:text-5xl font-bold text-primary-foreground mb-4">Privacy Policy</h1>
        <p className="text-primary-foreground/70">Last updated: March 2026</p>
      </div>
    </section>
    <section className="max-w-3xl mx-auto px-6 py-16 w-full">
      <div className="space-y-8">
        {sections.map((s) => (
          <div key={s.title}>
            <h2 className="font-heading font-semibold text-lg mb-2">{s.title}</h2>
            <p className="text-muted-foreground leading-relaxed">{s.content}</p>
          </div>
        ))}
      </div>
    </section>
    <Footer />
  </div>
);

export default Privacy;

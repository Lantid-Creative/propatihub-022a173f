import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sections = [
  { title: "1. Acceptance of Terms", content: "By accessing and using PropatiHub, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform." },
  { title: "2. Use of the Platform", content: "PropatiHub provides a property listing and search platform. You agree to use the platform only for lawful purposes and in accordance with these terms. You must not misuse the platform or attempt to gain unauthorized access." },
  { title: "3. Account Registration", content: "To access certain features, you must register an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account." },
  { title: "4. Property Listings", content: "Agents and agencies are responsible for the accuracy of their property listings. PropatiHub does not guarantee the accuracy of any listing information and is not liable for any losses arising from inaccurate listings." },
  { title: "5. Fees & Payments", content: "Certain services on PropatiHub require payment. All fees are stated in Nigerian Naira and are non-refundable unless otherwise specified. We reserve the right to change pricing with reasonable notice." },
  { title: "6. Intellectual Property", content: "All content on PropatiHub, including text, graphics, logos, and software, is the property of PropatiHub and is protected by intellectual property laws." },
  { title: "7. Limitation of Liability", content: "PropatiHub is provided \"as is\" without warranty of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform." },
  { title: "8. Privacy", content: "Your use of PropatiHub is also governed by our Privacy Policy. Please review it to understand how we collect, use, and protect your information." },
  { title: "9. Changes to Terms", content: "We may update these terms from time to time. Continued use of PropatiHub after changes constitutes acceptance of the updated terms." },
  { title: "10. Contact", content: "For questions about these terms, contact us at legal@propatihub.com." },
];

const Terms = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Navbar />
    <section className="bg-primary pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h1 className="font-heading text-3xl md:text-5xl font-bold text-primary-foreground mb-4">Terms of Service</h1>
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

export default Terms;

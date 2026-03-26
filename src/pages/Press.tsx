import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ExternalLink, Mail } from "lucide-react";

const releases = [
  { title: "PropatiHub surpasses 10,000 property listings", date: "Mar 2026", summary: "PropatiHub reaches a major milestone with over 10,000 verified property listings across Nigeria." },
  { title: "PropatiHub launches AI-powered property valuation", date: "Feb 2026", summary: "New tool uses machine learning and market data to provide instant property value estimates." },
  { title: "PropatiHub expands to all 36 Nigerian states", date: "Jan 2026", summary: "Platform now covers every state in Nigeria, providing the most comprehensive property search in the country." },
  { title: "PropatiHub raises seed funding to transform Nigerian real estate", date: "Dec 2025", summary: "Investment will accelerate product development and expand the agent network nationwide." },
];

const Press = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Navbar />
    <section className="bg-primary pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h1 className="font-heading text-3xl md:text-5xl font-bold text-primary-foreground mb-4">Press</h1>
        <p className="text-primary-foreground/70 text-lg">Latest news and press releases from PropatiHub.</p>
      </div>
    </section>

    <section className="max-w-4xl mx-auto px-6 py-16 w-full">
      <div className="grid gap-6">
        {releases.map((r) => (
          <Card key={r.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Calendar className="w-3.5 h-3.5" />
                {r.date}
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">{r.title}</h3>
              <p className="text-sm text-muted-foreground">{r.summary}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-12 bg-muted">
        <CardContent className="p-8 text-center">
          <Mail className="w-8 h-8 text-accent mx-auto mb-3" />
          <h3 className="font-heading font-semibold text-lg mb-2">Media enquiries</h3>
          <p className="text-sm text-muted-foreground mb-4">For press enquiries, interviews, or media assets, contact our communications team.</p>
          <p className="text-sm font-medium text-accent">press@propatihub.com</p>
        </CardContent>
      </Card>
    </section>
    <Footer />
  </div>
);

export default Press;

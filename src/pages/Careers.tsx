import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Clock } from "lucide-react";

const openings = [
  { title: "Senior Frontend Engineer", location: "Lagos / Remote", type: "Full-time", dept: "Engineering" },
  { title: "Product Designer", location: "Lagos", type: "Full-time", dept: "Design" },
  { title: "Real Estate Partnerships Manager", location: "Abuja", type: "Full-time", dept: "Business Development" },
  { title: "Content Writer", location: "Remote", type: "Contract", dept: "Marketing" },
  { title: "Customer Support Lead", location: "Lagos", type: "Full-time", dept: "Operations" },
];

const perks = [
  "Competitive salary & equity", "Remote-friendly culture", "Health insurance", "Learning & development budget", "Flexible working hours", "Annual team retreats",
];

const Careers = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Navbar />
    <section className="bg-primary pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h1 className="font-heading text-3xl md:text-5xl font-bold text-primary-foreground mb-4">Join our team</h1>
        <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">Help us transform how Nigerians find, buy, and rent property. We're building something special.</p>
      </div>
    </section>

    <section className="max-w-4xl mx-auto px-6 py-16 w-full">
      <h2 className="font-heading text-2xl font-bold mb-8">Open positions</h2>
      <div className="grid gap-4">
        {openings.map((job) => (
          <Card key={job.title} className="hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6">
              <div>
                <span className="text-xs font-medium text-accent">{job.dept}</span>
                <h3 className="font-heading font-semibold text-lg">{job.title}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {job.type}</span>
                </div>
              </div>
              <Button variant="outline" size="sm">Apply</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>

    <section className="bg-muted">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="font-heading text-2xl font-bold mb-6">Why PropatiHub?</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {perks.map((p) => (
            <Card key={p}><CardContent className="p-5 flex items-center gap-3"><Briefcase className="w-5 h-5 text-accent shrink-0" /><span className="text-sm font-medium">{p}</span></CardContent></Card>
          ))}
        </div>
      </div>
    </section>
    <Footer />
  </div>
);

export default Careers;

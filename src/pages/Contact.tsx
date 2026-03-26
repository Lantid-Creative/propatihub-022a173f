import PageSEO from "@/components/PageSEO";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";

const Contact = () => {
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("Message sent! We'll get back to you shortly.");
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <section className="bg-primary pt-28 pb-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-primary-foreground mb-4">Contact us</h1>
          <p className="text-primary-foreground/70 text-lg">We'd love to hear from you. Get in touch and we'll respond as soon as we can.</p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-16 w-full">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Full Name</Label><Input required placeholder="Your name" /></div>
                    <div className="space-y-2"><Label>Email</Label><Input required type="email" placeholder="you@email.com" /></div>
                  </div>
                  <div className="space-y-2"><Label>Subject</Label><Input required placeholder="How can we help?" /></div>
                  <div className="space-y-2"><Label>Message</Label><Textarea required rows={5} placeholder="Tell us more..." /></div>
                  <Button type="submit" className="w-full" disabled={sending}>{sending ? "Sending..." : "Send message"}</Button>
                </form>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            <Card><CardContent className="p-6 flex gap-4"><Mail className="w-5 h-5 text-accent shrink-0 mt-0.5" /><div><h3 className="font-semibold text-sm">Email</h3><p className="text-sm text-muted-foreground">hello@propatihub.com</p></div></CardContent></Card>
            <Card><CardContent className="p-6 flex gap-4"><Phone className="w-5 h-5 text-accent shrink-0 mt-0.5" /><div><h3 className="font-semibold text-sm">Phone</h3><p className="text-sm text-muted-foreground">+234 (0) 800 PROPATI</p></div></CardContent></Card>
            <Card><CardContent className="p-6 flex gap-4"><MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" /><div><h3 className="font-semibold text-sm">Office</h3><p className="text-sm text-muted-foreground">Victoria Island, Lagos, Nigeria</p></div></CardContent></Card>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Contact;

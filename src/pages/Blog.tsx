import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

const posts = [
  { title: "Top 10 areas to invest in Lagos in 2026", category: "Investment", date: "Mar 15, 2026", excerpt: "Discover the neighbourhoods offering the best returns for property investors in Lagos this year." },
  { title: "First-time buyer? Here's what you need to know", category: "Buying Guide", date: "Mar 10, 2026", excerpt: "A comprehensive checklist for first-time property buyers in Nigeria, from budgeting to closing." },
  { title: "Understanding Nigerian land titles: C of O, R of O explained", category: "Legal", date: "Mar 5, 2026", excerpt: "Demystifying the different types of property documentation and what they mean for your purchase." },
  { title: "How to spot a property scam in Nigeria", category: "Safety", date: "Feb 28, 2026", excerpt: "Red flags to watch for when buying or renting property, and how PropatiHub keeps you protected." },
  { title: "The rise of short-let apartments in Abuja", category: "Market Trends", date: "Feb 20, 2026", excerpt: "Why short-let apartments are booming in Nigeria's capital and what it means for investors." },
  { title: "PropatiHub launches property valuation tool", category: "Product Update", date: "Feb 15, 2026", excerpt: "Our new AI-powered valuation tool helps you estimate any property's worth in seconds." },
];

const Blog = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Navbar />
    <section className="bg-primary pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h1 className="font-heading text-3xl md:text-5xl font-bold text-primary-foreground mb-4">Blog</h1>
        <p className="text-primary-foreground/70 text-lg">Property insights, market trends, and tips for buyers, renters, and investors in Nigeria.</p>
      </div>
    </section>

    <section className="max-w-5xl mx-auto px-6 py-16 w-full">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Card key={post.title} className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-6">
              <Badge variant="secondary" className="mb-3">{post.category}</Badge>
              <h3 className="font-heading font-semibold text-lg mb-2 group-hover:text-accent transition-colors">{post.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{post.excerpt}</p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                {post.date}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
    <Footer />
  </div>
);

export default Blog;

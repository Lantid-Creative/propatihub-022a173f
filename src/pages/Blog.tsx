import PageSEO from "@/components/PageSEO";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { blogPosts } from "@/data/blogPosts";

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
        {blogPosts.map((post) => (
          <Link key={post.slug} to={`/blog/${post.slug}`} className="group">
            <Card className="hover:shadow-md transition-shadow h-full">
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
          </Link>
        ))}
      </div>
    </section>
    <Footer />
  </div>
);

export default Blog;

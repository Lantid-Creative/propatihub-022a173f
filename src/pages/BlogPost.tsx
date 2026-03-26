import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, ArrowLeft } from "lucide-react";
import { blogPosts } from "@/data/blogPosts";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-heading text-2xl font-bold mb-4">Article not found</h1>
            <Link to="/blog"><Button variant="outline">Back to Blog</Button></Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const relatedPosts = blogPosts.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <section className="bg-primary pt-28 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-primary-foreground/60 hover:text-primary-foreground text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
          <Badge variant="secondary" className="mb-4">{post.category}</Badge>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-6 leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-primary-foreground/60">
            <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{post.author}</span>
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{post.date}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{post.readTime}</span>
          </div>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-6 py-12 w-full">
        <div className="space-y-5">
          {post.content.map((paragraph, i) => {
            // Handle bold markdown-style text
            const parts = paragraph.split(/(\*\*[^*]+\*\*)/g);
            return (
              <p key={i} className="text-muted-foreground leading-relaxed text-[16px]">
                {parts.map((part, j) => {
                  if (part.startsWith("**") && part.endsWith("**")) {
                    return <strong key={j} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>;
                  }
                  return <span key={j}>{part}</span>;
                })}
              </p>
            );
          })}
        </div>
      </article>

      {/* Related posts */}
      <section className="bg-muted">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="font-heading text-2xl font-bold mb-8">Related articles</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedPosts.map((rp) => (
              <Link key={rp.slug} to={`/blog/${rp.slug}`} className="group">
                <div className="bg-card rounded-lg border p-6 h-full hover:shadow-md transition-shadow">
                  <Badge variant="secondary" className="mb-3">{rp.category}</Badge>
                  <h3 className="font-heading font-semibold mb-2 group-hover:text-accent transition-colors">{rp.title}</h3>
                  <p className="text-sm text-muted-foreground">{rp.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogPost;

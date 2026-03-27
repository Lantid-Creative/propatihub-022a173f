import { Link } from "react-router-dom";
import { blogPosts } from "@/data/blogPosts";
import { ArrowRight, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const LatestNewsSection = () => {
  const posts = blogPosts.slice(0, 4);
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <section className="py-20 px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Latest housing market news
            </h2>
            <p className="text-muted-foreground font-body mt-2 max-w-lg">
              The information you need to help make your property decisions.
            </p>
          </div>
          <Link to="/blog" className="hidden md:block">
            <Button variant="outline" className="gap-2 font-semibold">
              View all articles <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Featured post */}
          <Link
            to={`/blog/${featured.slug}`}
            className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="h-52 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <span className="text-5xl opacity-40">📰</span>
            </div>
            <div className="p-6">
              <Badge variant="secondary" className="mb-3 font-body text-xs">
                {featured.category}
              </Badge>
              <h3 className="text-xl font-display font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                {featured.title}
              </h3>
              <p className="text-muted-foreground font-body text-sm line-clamp-2 mb-4">
                {featured.excerpt}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground font-body">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> {featured.author}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {featured.readTime}
                </span>
                <span>{featured.date}</span>
              </div>
            </div>
          </Link>

          {/* Other posts */}
          <div className="flex flex-col gap-4">
            {rest.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="group flex gap-4 rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow"
              >
                <div className="w-20 h-20 shrink-0 rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center">
                  <span className="text-2xl opacity-40">📰</span>
                </div>
                <div className="min-w-0 flex-1">
                  <Badge variant="secondary" className="mb-1.5 font-body text-[10px] px-1.5 py-0">
                    {post.category}
                  </Badge>
                  <h3 className="text-sm font-display font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-body">
                    <span>{post.date}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {post.readTime}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link to="/blog">
            <Button variant="outline" className="gap-2 font-semibold">
              View all articles <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LatestNewsSection;

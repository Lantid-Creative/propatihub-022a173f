import { Mail } from "lucide-react";

const AlertSection = () => {
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto bg-primary rounded-2xl p-10 md:p-16 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-6">
            <Mail className="w-7 h-7 text-accent-foreground" />
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
            Never Miss a New Listing
          </h2>
          <p className="text-primary-foreground/70 font-body mb-8 max-w-md mx-auto">
            Set up property alerts and be the first to know when new homes hit the market in your preferred area
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 outline-none font-body text-sm focus:border-accent transition-colors"
            />
            <button className="gold-gradient text-accent-foreground px-6 py-3 rounded-lg font-body font-semibold hover:opacity-90 transition-opacity whitespace-nowrap">
              Create Alert
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AlertSection;

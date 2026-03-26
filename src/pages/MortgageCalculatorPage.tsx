import PageSEO from "@/components/PageSEO";
import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calculator, TrendingUp, PiggyBank, Clock, ShieldCheck } from "lucide-react";

const MortgageCalculatorPage = () => {
  const [propertyPrice, setPropertyPrice] = useState(50000000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(18);
  const [loanTermYears, setLoanTermYears] = useState(20);

  const downPayment = (propertyPrice * downPaymentPercent) / 100;
  const loanAmount = propertyPrice - downPayment;

  const monthlyPayment = useMemo(() => {
    if (loanAmount <= 0 || interestRate <= 0 || loanTermYears <= 0) return 0;
    const monthlyRate = interestRate / 100 / 12;
    const totalPayments = loanTermYears * 12;
    return (
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
      (Math.pow(1 + monthlyRate, totalPayments) - 1)
    );
  }, [loanAmount, interestRate, loanTermYears]);

  const totalPayment = monthlyPayment * loanTermYears * 12;
  const totalInterest = totalPayment - loanAmount;

  const fmt = (n: number) => `₦${Math.round(n).toLocaleString()}`;

  const tips = [
    { icon: PiggyBank, title: "Save for a bigger deposit", desc: "A larger down payment reduces your monthly repayments and total interest paid." },
    { icon: TrendingUp, title: "Compare interest rates", desc: "Even a 1% difference in rate can save you millions over the life of the mortgage." },
    { icon: Clock, title: "Choose your term wisely", desc: "Shorter terms mean higher monthly payments but less interest overall." },
    { icon: ShieldCheck, title: "Get pre-approved", desc: "A mortgage pre-approval strengthens your offer when buying property." },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PageSEO title="Mortgage Calculator Nigeria" description="Calculate your monthly mortgage repayments for Nigerian property. Free tool to estimate payments, interest, and loan affordability." canonical="/mortgage-calculator" />
      <Navbar />
      {/* Hero */}
      <section className="bg-primary pt-28 pb-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-foreground/10 rounded-full px-4 py-1.5 mb-6">
            <Calculator className="w-4 h-4 text-primary-foreground" />
            <span className="text-sm font-medium text-primary-foreground">Mortgage Calculator</span>
          </div>
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
            Calculate your mortgage repayments
          </h1>
          <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">
            Use our free mortgage calculator to estimate your monthly payments based on property price, deposit, interest rate and loan term.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 -mt-10 mb-16 w-full">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Calculator */}
          <Card className="md:col-span-3 shadow-lg">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Label>Property Price</Label>
                <Input
                  type="text"
                  value={fmt(propertyPrice)}
                  onChange={(e) => {
                    const val = Number(e.target.value.replace(/[^0-9]/g, ""));
                    if (!isNaN(val)) setPropertyPrice(val);
                  }}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Down Payment</Label>
                  <span className="text-sm font-semibold">{downPaymentPercent}% — {fmt(downPayment)}</span>
                </div>
                <Slider value={[downPaymentPercent]} onValueChange={([v]) => setDownPaymentPercent(v)} min={0} max={90} step={5} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Interest Rate</Label>
                  <span className="text-sm font-semibold">{interestRate}%</span>
                </div>
                <Slider value={[interestRate]} onValueChange={([v]) => setInterestRate(v)} min={1} max={35} step={0.5} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Loan Term</Label>
                  <span className="text-sm font-semibold">{loanTermYears} years</span>
                </div>
                <Slider value={[loanTermYears]} onValueChange={([v]) => setLoanTermYears(v)} min={1} max={30} step={1} />
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-accent text-accent-foreground shadow-lg">
              <CardContent className="p-8 text-center">
                <p className="text-sm opacity-80 mb-1">Monthly Repayment</p>
                <p className="text-3xl font-heading font-bold">{fmt(monthlyPayment)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Loan Amount</span>
                  <span className="font-semibold">{fmt(loanAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Interest</span>
                  <span className="font-semibold">{fmt(totalInterest)}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-3">
                  <span className="text-muted-foreground">Total Cost</span>
                  <span className="font-bold">{fmt(totalPayment)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="max-w-5xl mx-auto px-6 pb-20 w-full">
        <h2 className="font-heading text-2xl font-bold mb-8">Mortgage tips</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tips.map((tip) => (
            <Card key={tip.title} className="p-6">
              <tip.icon className="w-8 h-8 text-accent mb-3" />
              <h3 className="font-heading font-semibold mb-1">{tip.title}</h3>
              <p className="text-sm text-muted-foreground">{tip.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MortgageCalculatorPage;

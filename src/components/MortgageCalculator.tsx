import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calculator } from "lucide-react";

interface MortgageCalculatorProps {
  propertyPrice: number;
}

const MortgageCalculator = ({ propertyPrice }: MortgageCalculatorProps) => {
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calculator className="w-5 h-5 text-accent" />
          Mortgage Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Down Payment */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-xs text-muted-foreground">Down Payment</Label>
            <span className="text-xs font-semibold text-foreground">{downPaymentPercent}% — {fmt(downPayment)}</span>
          </div>
          <Slider
            value={[downPaymentPercent]}
            onValueChange={([v]) => setDownPaymentPercent(v)}
            min={0}
            max={90}
            step={5}
          />
        </div>

        {/* Interest Rate */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-xs text-muted-foreground">Interest Rate</Label>
            <span className="text-xs font-semibold text-foreground">{interestRate}%</span>
          </div>
          <Slider
            value={[interestRate]}
            onValueChange={([v]) => setInterestRate(v)}
            min={1}
            max={35}
            step={0.5}
          />
        </div>

        {/* Loan Term */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-xs text-muted-foreground">Loan Term</Label>
            <span className="text-xs font-semibold text-foreground">{loanTermYears} years</span>
          </div>
          <Slider
            value={[loanTermYears]}
            onValueChange={([v]) => setLoanTermYears(v)}
            min={1}
            max={30}
            step={1}
          />
        </div>

        {/* Results */}
        <div className="bg-muted rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm font-body">
            <span className="text-muted-foreground">Monthly Payment</span>
            <span className="font-bold text-accent text-base">{fmt(monthlyPayment)}</span>
          </div>
          <div className="flex justify-between text-xs font-body">
            <span className="text-muted-foreground">Loan Amount</span>
            <span className="text-foreground">{fmt(loanAmount)}</span>
          </div>
          <div className="flex justify-between text-xs font-body">
            <span className="text-muted-foreground">Total Interest</span>
            <span className="text-foreground">{fmt(totalInterest)}</span>
          </div>
          <div className="flex justify-between text-xs font-body border-t border-border pt-2 mt-2">
            <span className="text-muted-foreground">Total Payment</span>
            <span className="font-semibold text-foreground">{fmt(totalPayment)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MortgageCalculator;

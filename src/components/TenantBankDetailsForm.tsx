import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Banknote, CheckCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const NIGERIAN_BANKS = [
  { code: "044", name: "Access Bank" },
  { code: "023", name: "Citibank Nigeria" },
  { code: "063", name: "Diamond Bank" },
  { code: "050", name: "Ecobank Nigeria" },
  { code: "084", name: "Enterprise Bank" },
  { code: "070", name: "Fidelity Bank" },
  { code: "011", name: "First Bank of Nigeria" },
  { code: "214", name: "First City Monument Bank" },
  { code: "058", name: "Guaranty Trust Bank" },
  { code: "030", name: "Heritage Bank" },
  { code: "301", name: "Jaiz Bank" },
  { code: "082", name: "Keystone Bank" },
  { code: "526", name: "Parallex Bank" },
  { code: "076", name: "Polaris Bank" },
  { code: "101", name: "Providus Bank" },
  { code: "221", name: "Stanbic IBTC Bank" },
  { code: "068", name: "Standard Chartered Bank" },
  { code: "232", name: "Sterling Bank" },
  { code: "100", name: "Suntrust Bank" },
  { code: "032", name: "Union Bank of Nigeria" },
  { code: "033", name: "United Bank For Africa" },
  { code: "215", name: "Unity Bank" },
  { code: "035", name: "Wema Bank" },
  { code: "057", name: "Zenith Bank" },
  { code: "999992", name: "Opay" },
  { code: "999991", name: "PalmPay" },
  { code: "999994", name: "Moniepoint" },
  { code: "090267", name: "Kuda Bank" },
];

interface BankDetails {
  id: string;
  account_number: string;
  bank_code: string;
  bank_name: string;
  account_name: string | null;
  is_verified: boolean;
}

const TenantBankDetailsForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState<BankDetails | null>(null);
  const [form, setForm] = useState({ account_number: "", bank_code: "", bank_name: "" });

  useEffect(() => {
    if (user) fetchBankDetails();
  }, [user]);

  const fetchBankDetails = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("tenant_bank_details" as any)
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle();

    if (data) {
      setExisting(data as any);
      setForm({
        account_number: (data as any).account_number,
        bank_code: (data as any).bank_code,
        bank_name: (data as any).bank_name,
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.account_number || !form.bank_code) {
      toast({ 
        title: "Missing Information", 
        description: "Please provide both a bank name and a valid account number.", 
        variant: "destructive" 
      });
      return;
    }

    if (form.account_number.length !== 10) {
      toast({ 
        title: "Invalid Account Number", 
        description: "Nigerian NUBAN account numbers must be exactly 10 digits in length.", 
        variant: "destructive" 
      });
      return;
    }

    setSaving(true);
    const bank = NIGERIAN_BANKS.find(b => b.code === form.bank_code);
    const bankName = bank?.name || form.bank_name;

    if (existing) {
      const { error } = await supabase
        .from("tenant_bank_details" as any)
        .update({
          account_number: form.account_number,
          bank_code: form.bank_code,
          bank_name: bankName,
          is_verified: false,
          paystack_recipient_code: null,
        } as any)
        .eq("id", existing.id);

      if (error) {
        toast({ 
          title: "Update Failed", 
          description: error.message || "We could not update your banking details at this time. Please try again.", 
          variant: "destructive" 
        });
      } else {
        toast({ 
          title: "Banking Details Updated", 
          description: "Your payout information has been successfully updated and saved securely.",
          className: "bg-primary text-primary-foreground border-none",
        });
        fetchBankDetails();
      }
    } else {
      const { error } = await supabase
        .from("tenant_bank_details" as any)
        .insert({
          user_id: user!.id,
          account_number: form.account_number,
          bank_code: form.bank_code,
          bank_name: bankName,
        } as any);

      if (error) {
        toast({ 
          title: "Saving Failed", 
          description: error.message || "We encountered an issue while saving your banking details. Please try again.", 
          variant: "destructive" 
        });
      } else {
        toast({ 
          title: "Banking Details Saved", 
          description: "Your payout information has been securely stored for future caution fee refunds.",
          className: "bg-primary text-primary-foreground border-none",
        });
        fetchBankDetails();
      }
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <Banknote className="w-5 h-5 text-accent" />
          Bank Account for Payouts
          {existing?.is_verified && (
            <Badge className="bg-green-100 text-green-700 ml-2">
              <CheckCircle className="w-3 h-3 mr-1" /> Verified
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {existing?.account_name && (
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs text-muted-foreground font-body">Account Name</p>
            <p className="font-body font-semibold text-foreground text-sm">{existing.account_name}</p>
          </div>
        )}

        <div className="space-y-2">
          <Label className="font-body text-sm">Bank</Label>
          <Select
            value={form.bank_code}
            onValueChange={(val) => {
              const bank = NIGERIAN_BANKS.find(b => b.code === val);
              setForm({ ...form, bank_code: val, bank_name: bank?.name || "" });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your bank" />
            </SelectTrigger>
            <SelectContent>
              {NIGERIAN_BANKS.map((bank) => (
                <SelectItem key={bank.code} value={bank.code}>{bank.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="font-body text-sm">Account Number</Label>
          <Input
            value={form.account_number}
            onChange={(e) => setForm({ ...form, account_number: e.target.value.replace(/\D/g, "").slice(0, 10) })}
            placeholder="0123456789"
            maxLength={10}
          />
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {existing ? "Update Bank Details" : "Save Bank Details"}
        </Button>

        <p className="text-xs text-muted-foreground font-body">
          Your bank details are used to receive caution fee refunds. They are securely stored and only used for payouts.
        </p>
      </CardContent>
    </Card>
  );
};

export default TenantBankDetailsForm;

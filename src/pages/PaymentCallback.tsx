import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

type VerifyStatus = "verifying" | "success" | "failed";

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<VerifyStatus>("verifying");
  const [details, setDetails] = useState<{ amount?: number; tier?: string }>({});

  const reference = searchParams.get("reference") || searchParams.get("trxref");

  useEffect(() => {
    if (!reference) {
      setStatus("failed");
      return;
    }

    const verify = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("paystack-payment/verify", {
          body: { reference },
        });

        if (error || !data?.success) {
          setStatus("failed");
          return;
        }

        setDetails({ amount: data.amount });
        setStatus("success");
      } catch {
        setStatus("failed");
      }
    };

    verify();
  }, [reference]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            {status === "verifying" && (
              <>
                <Loader2 className="w-16 h-16 text-accent animate-spin mx-auto" />
                <h1 className="font-display text-xl font-bold text-foreground">Verifying Payment…</h1>
                <p className="font-body text-muted-foreground text-sm">
                  Please wait while we confirm your transaction with Paystack.
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <h1 className="font-display text-xl font-bold text-foreground">Payment Successful!</h1>
                <p className="font-body text-muted-foreground text-sm">
                  Your subscription has been activated.
                  {details.amount && (
                    <> You paid <strong>₦{details.amount.toLocaleString()}</strong>.</>
                  )}
                </p>
                <div className="flex flex-col gap-3 pt-2">
                  <Button onClick={() => navigate("/bid")} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    Back to Bidding
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/dashboard")}>
                    Go to Dashboard
                  </Button>
                </div>
              </>
            )}

            {status === "failed" && (
              <>
                <XCircle className="w-16 h-16 text-destructive mx-auto" />
                <h1 className="font-display text-xl font-bold text-foreground">Payment Failed</h1>
                <p className="font-body text-muted-foreground text-sm">
                  We couldn't verify your payment. If you were charged, please contact support with reference: <code className="text-xs bg-muted px-1 py-0.5 rounded">{reference || "N/A"}</code>
                </p>
                <div className="flex flex-col gap-3 pt-2">
                  <Button onClick={() => navigate("/bid")} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    Try Again
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/contact")}>
                    Contact Support
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentCallback;

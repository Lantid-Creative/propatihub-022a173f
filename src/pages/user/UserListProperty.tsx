import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUploader from "@/components/ImageUploader";
import { useToast } from "@/hooks/use-toast";
import { Home, Loader2, CheckCircle } from "lucide-react";
import VerificationGate from "@/components/verification/VerificationGate";

const nigerianStates = [
  "Lagos", "Abuja FCT", "Rivers", "Oyo", "Kano", "Enugu", "Anambra", "Delta",
  "Kaduna", "Ogun", "Edo", "Ondo", "Kwara", "Osun", "Ekiti", "Imo", "Abia",
  "Cross River", "Akwa Ibom", "Bayelsa", "Benue", "Borno", "Gombe", "Jigawa",
  "Kebbi", "Kogi", "Nassarawa", "Niger", "Plateau", "Sokoto", "Taraba", "Yobe",
  "Zamfara", "Adamawa", "Bauchi", "Ebonyi",
];

const emptyForm = {
  title: "", description: "", property_type: "house" as const, listing_type: "rent" as string,
  price: "", bedrooms: "", bathrooms: "", address: "", city: "", state: "Lagos",
  features: "", images: [] as string[],
  furnishing: "", condition: "",
  nysc_friendly: false, nysc_details: "",
};

const UserListProperty = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;
    if (!form.title || !form.price || !form.city) {
      toast({ 
        title: "Required Information Missing", 
        description: "Please provide a property title, price, and city to submit your listing.", 
        variant: "destructive" 
      });
      return;
    }

    setSubmitting(true);
    try {
      const featuresArr = form.features.split(",").map(f => f.trim()).filter(Boolean);
      const filled = [form.title, form.description, form.price, form.city, form.address, form.bedrooms, form.bathrooms, form.furnishing, form.condition].filter(Boolean).length;
      const percentage = Math.min(Math.round((filled / 9) * 80 + (form.images.length > 0 ? 20 : 0)), 100);

      const { error } = await supabase.from("properties").insert({
        agent_id: user.id,
        title: form.title,
        description: form.description || null,
        property_type: form.property_type,
        listing_type: form.listing_type as any,
        price: parseInt(form.price),
        bedrooms: parseInt(form.bedrooms) || null,
        bathrooms: parseInt(form.bathrooms) || null,
        address: form.address || null,
        city: form.city,
        state: form.state,
        features: featuresArr.length > 0 ? featuresArr : null,
        images: form.images.length > 0 ? form.images : null,
        furnishing: form.furnishing || null,
        condition: form.condition || null,
        nysc_friendly: form.nysc_friendly,
        nysc_details: form.nysc_details || null,
        completion_percentage: percentage,
        status: "pending" as const,
      });

      if (error) throw error;
      setSubmitted(true);
      toast({ 
        title: "Listing Successfully Submitted", 
        description: "Thank you for listing with PropatiHub! Your property is now being reviewed by our team and will be live once verified.",
        className: "bg-primary text-primary-foreground border-none",
      });
    } catch (err: any) {
      toast({ 
        title: "Submission Error", 
        description: err.message || "We encountered an issue while submitting your property. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <CheckCircle className="w-16 h-16 text-accent mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Listing Submitted!</h2>
          <p className="font-body text-muted-foreground max-w-md mb-6">
            Your property has been submitted for review. Once approved by our team, it will appear on the marketplace.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { setForm(emptyForm); setSubmitted(false); }}>
              List Another Property
            </Button>
            <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <VerificationGate verificationType="customer" actionLabel="property listing">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <Home className="w-6 h-6 text-accent" /> List Your Property
        </h1>
        <p className="text-muted-foreground font-body text-sm">
          Fill in the details below to list your property on PropatiHub. Our team will review and approve it.
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-body font-medium block mb-1">Property Title *</label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. 3 Bedroom Flat in Lekki" />
            </div>
            <div>
              <label className="text-sm font-body font-medium block mb-1">Description</label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe your property..." rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-body font-medium block mb-1">Property Type *</label>
                <Select value={form.property_type} onValueChange={v => setForm({ ...form, property_type: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="short_let">Short Let</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-body font-medium block mb-1">Listing Type *</label>
                <Select value={form.listing_type} onValueChange={v => setForm({ ...form, listing_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">For Sale</SelectItem>
                    <SelectItem value="rent">For Rent</SelectItem>
                    <SelectItem value="short_let">Short Let</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-body font-medium block mb-1">Price (₦) *</label>
              <Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="e.g. 1500000" />
            </div>
          </CardContent>
        </Card>

        {/* Location & Details */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Location & Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-body font-medium block mb-1">State *</label>
                <Select value={form.state} onValueChange={v => setForm({ ...form, state: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {nigerianStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-body font-medium block mb-1">City *</label>
                <Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="e.g. Lekki" />
              </div>
            </div>
            <div>
              <label className="text-sm font-body font-medium block mb-1">Address</label>
              <Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="e.g. 12 Admiralty Way, Lekki Phase 1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-body font-medium block mb-1">Bedrooms</label>
                <Input type="number" value={form.bedrooms} onChange={e => setForm({ ...form, bedrooms: e.target.value })} placeholder="e.g. 3" />
              </div>
              <div>
                <label className="text-sm font-body font-medium block mb-1">Bathrooms</label>
                <Input type="number" value={form.bathrooms} onChange={e => setForm({ ...form, bathrooms: e.target.value })} placeholder="e.g. 2" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-body font-medium block mb-1">Furnishing</label>
                <Select value={form.furnishing} onValueChange={v => setForm({ ...form, furnishing: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="furnished">Furnished</SelectItem>
                    <SelectItem value="semi-furnished">Semi-Furnished</SelectItem>
                    <SelectItem value="unfurnished">Unfurnished</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-body font-medium block mb-1">Condition</label>
                <Select value={form.condition} onValueChange={v => setForm({ ...form, condition: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Newly Built</SelectItem>
                    <SelectItem value="renovated">Renovated</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-body font-medium block mb-1">Features (comma-separated)</label>
              <Textarea value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} placeholder="e.g. Generator, Water, Security, Parking" rows={2} />
            </div>

            {/* NYSC */}
            <div className="border border-primary/20 rounded-lg p-4 bg-primary/5 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.nysc_friendly} onChange={e => setForm({ ...form, nysc_friendly: e.target.checked })} className="rounded border-border w-4 h-4" />
                <span className="text-sm font-body font-medium">🎓 NYSC-Friendly Housing</span>
              </label>
              {form.nysc_friendly && (
                <Textarea value={form.nysc_details} onChange={e => setForm({ ...form, nysc_details: e.target.value })} placeholder="e.g. Close to NYSC secretariat, affordable for corpers..." rows={2} />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Photos */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Photos</CardTitle></CardHeader>
          <CardContent>
            <ImageUploader images={form.images} onChange={imgs => setForm({ ...form, images: imgs })} bucket="property-images" maxFiles={8} label="Upload Property Photos" />
            <p className="text-xs text-muted-foreground font-body mt-2">Upload clear photos (min 1200×800px). Properties with photos get more views.</p>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-3 pb-8">
          <Button variant="outline" onClick={() => navigate("/dashboard")} className="flex-1">Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : "Submit Property"}
          </Button>
        </div>
      </div>
      </VerificationGate>
    </DashboardLayout>
  );
};

export default UserListProperty;

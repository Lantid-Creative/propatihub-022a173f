import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Code, Key, Shield, Zap, Database, CreditCard } from "lucide-react";

const BASE_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/property-api`;

const CodeBlock = ({ children, title }: { children: string; title?: string }) => (
  <div className="rounded-lg overflow-hidden border border-border">
    {title && (
      <div className="bg-muted px-4 py-2 border-b border-border">
        <span className="text-xs font-mono text-muted-foreground">{title}</span>
      </div>
    )}
    <pre className="bg-card p-4 overflow-x-auto text-sm">
      <code className="text-foreground font-mono whitespace-pre">{children}</code>
    </pre>
  </div>
);

const ApiDocs = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="API Documentation | PropatiHub"
        description="Access Nigerian property data through the PropatiHub API. Pull property listings, prices, and details for any Local Government Area."
      />
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary">Developer API</Badge>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
            PropatiHub Property API
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-body">
            Access real-time Nigerian property data programmatically. Pull listings, prices, and
            property details for any LGA you subscribe to.
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <Button asChild>
              <Link to="/auth">Get API Key</Link>
            </Button>
            <Button variant="outline" asChild>
              <a href="#pricing">View Pricing</a>
            </Button>
          </div>
        </div>

        {/* Quick Start */}
        <section className="mb-12">
          <h2 className="text-2xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" /> Quick Start
          </h2>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <p className="font-body text-sm text-muted-foreground"><strong className="text-foreground">Step 1:</strong> Sign up as an Agent or Agency on PropatiHub</p>
                  <p className="font-body text-sm text-muted-foreground"><strong className="text-foreground">Step 2:</strong> Navigate to API Access in your dashboard and generate an API key</p>
                  <p className="font-body text-sm text-muted-foreground"><strong className="text-foreground">Step 3:</strong> Subscribe to the LGAs you want data for (₦10,000/month per LGA)</p>
                  <p className="font-body text-sm text-muted-foreground"><strong className="text-foreground">Step 4:</strong> Start making API requests!</p>
                </div>
                <CodeBlock title="Example Request (cURL)">{`curl -X GET "${BASE_URL}/properties?lga=Ikeja&state=Lagos" \\
  -H "x-api-key: pk_your_api_key_here"`}</CodeBlock>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Authentication */}
        <section className="mb-12">
          <h2 className="text-2xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" /> Authentication
          </h2>
          <Card>
            <CardContent className="p-6 space-y-4">
              <p className="font-body text-sm text-muted-foreground">
                All API requests require authentication via an API key. You can pass it in two ways:
              </p>
              <div className="space-y-3">
                <div>
                  <p className="font-body text-sm font-semibold text-foreground mb-1">Option 1: Header (recommended)</p>
                  <CodeBlock>{`x-api-key: pk_your_api_key_here`}</CodeBlock>
                </div>
                <div>
                  <p className="font-body text-sm font-semibold text-foreground mb-1">Option 2: Query Parameter</p>
                  <CodeBlock>{`GET /properties?api_key=pk_your_api_key_here&lga=Ikeja&state=Lagos`}</CodeBlock>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Endpoints */}
        <section className="mb-12">
          <h2 className="text-2xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" /> Endpoints
          </h2>

          <Tabs defaultValue="properties" className="space-y-4">
            <TabsList className="w-full justify-start flex-wrap h-auto gap-1">
              <TabsTrigger value="properties">List Properties</TabsTrigger>
              <TabsTrigger value="property-detail">Property Detail</TabsTrigger>
              <TabsTrigger value="lgas">Available LGAs</TabsTrigger>
              <TabsTrigger value="subscriptions">My Subscriptions</TabsTrigger>
            </TabsList>

            <TabsContent value="properties">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <Badge variant="secondary">GET</Badge> /properties
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="font-body text-sm text-muted-foreground">
                    Fetch property listings for a subscribed LGA. Returns paginated results.
                  </p>

                  <div>
                    <h4 className="font-display font-semibold text-foreground text-sm mb-2">Required Parameters</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm font-body">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 pr-4 text-foreground">Param</th>
                            <th className="text-left py-2 pr-4 text-foreground">Type</th>
                            <th className="text-left py-2 text-foreground">Description</th>
                          </tr>
                        </thead>
                        <tbody className="text-muted-foreground">
                          <tr className="border-b border-border"><td className="py-2 pr-4 font-mono text-xs">lga</td><td className="py-2 pr-4">string</td><td className="py-2">Local Government Area (e.g. Ikeja, Lekki)</td></tr>
                          <tr className="border-b border-border"><td className="py-2 pr-4 font-mono text-xs">state</td><td className="py-2 pr-4">string</td><td className="py-2">State (e.g. Lagos, Abuja)</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-display font-semibold text-foreground text-sm mb-2">Optional Filters</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm font-body">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 pr-4 text-foreground">Param</th>
                            <th className="text-left py-2 pr-4 text-foreground">Type</th>
                            <th className="text-left py-2 text-foreground">Description</th>
                          </tr>
                        </thead>
                        <tbody className="text-muted-foreground">
                          <tr className="border-b border-border"><td className="py-2 pr-4 font-mono text-xs">listing_type</td><td className="py-2 pr-4">string</td><td className="py-2">sale, rent, short_let, land, bid</td></tr>
                          <tr className="border-b border-border"><td className="py-2 pr-4 font-mono text-xs">property_type</td><td className="py-2 pr-4">string</td><td className="py-2">house, apartment, land, commercial, short_let</td></tr>
                          <tr className="border-b border-border"><td className="py-2 pr-4 font-mono text-xs">min_price</td><td className="py-2 pr-4">integer</td><td className="py-2">Min price in Naira</td></tr>
                          <tr className="border-b border-border"><td className="py-2 pr-4 font-mono text-xs">max_price</td><td className="py-2 pr-4">integer</td><td className="py-2">Max price in Naira</td></tr>
                          <tr className="border-b border-border"><td className="py-2 pr-4 font-mono text-xs">bedrooms</td><td className="py-2 pr-4">integer</td><td className="py-2">Number of bedrooms</td></tr>
                          <tr className="border-b border-border"><td className="py-2 pr-4 font-mono text-xs">page</td><td className="py-2 pr-4">integer</td><td className="py-2">Page number (default: 1)</td></tr>
                          <tr className="border-b border-border"><td className="py-2 pr-4 font-mono text-xs">limit</td><td className="py-2 pr-4">integer</td><td className="py-2">Results per page (max: 100, default: 20)</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <CodeBlock title="Example Request">{`curl "${BASE_URL}/properties?lga=Ikeja&state=Lagos&listing_type=rent&max_price=5000000" \\
  -H "x-api-key: pk_your_api_key_here"`}</CodeBlock>

                  <CodeBlock title="Example Response">{`{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Luxury 3 Bedroom Apartment",
      "description": "...",
      "price": 3500000,
      "property_type": "apartment",
      "listing_type": "rent",
      "bedrooms": 3,
      "bathrooms": 2,
      "area_sqm": 120,
      "address": "15 Allen Avenue",
      "city": "Ikeja",
      "state": "Lagos",
      "features": ["swimming pool", "gym"],
      "images": ["https://..."],
      "latitude": 6.6018,
      "longitude": 3.3515,
      "created_at": "2026-03-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 145,
    "total_pages": 8
  },
  "subscription": {
    "lga": "Ikeja",
    "state": "Lagos",
    "expires_at": "2026-04-01T00:00:00Z"
  }
}`}</CodeBlock>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="property-detail">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <Badge variant="secondary">GET</Badge> /properties/:id
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="font-body text-sm text-muted-foreground">
                    Get full details for a specific property. Requires an active subscription for the property's LGA.
                  </p>
                  <CodeBlock title="Example Request">{`curl "${BASE_URL}/properties/550e8400-e29b-41d4-a716-446655440000" \\
  -H "x-api-key: pk_your_api_key_here"`}</CodeBlock>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lgas">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <Badge variant="secondary">GET</Badge> /lgas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="font-body text-sm text-muted-foreground">
                    List all available LGAs with property counts. No subscription required — use this to see what's available before subscribing.
                  </p>
                  <CodeBlock title="Example Response">{`{
  "success": true,
  "data": [
    { "lga": "Ikeja", "state": "Lagos", "count": 245 },
    { "lga": "Lekki", "state": "Lagos", "count": 189 },
    { "lga": "Wuse", "state": "Abuja", "count": 132 }
  ],
  "price_per_lga": 10000,
  "currency": "NGN"
}`}</CodeBlock>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscriptions">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <Badge variant="secondary">GET</Badge> /subscriptions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="font-body text-sm text-muted-foreground">
                    View your active LGA subscriptions and their expiry dates.
                  </p>
                  <CodeBlock title="Example Response">{`{
  "success": true,
  "data": [
    {
      "lga": "Ikeja",
      "state": "Lagos",
      "status": "active",
      "starts_at": "2026-03-01T00:00:00Z",
      "expires_at": "2026-04-01T00:00:00Z",
      "amount": 10000
    }
  ]
}`}</CodeBlock>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* Error Codes */}
        <section className="mb-12">
          <h2 className="text-2xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> Error Codes
          </h2>
          <Card>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-body">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-4 text-foreground">Code</th>
                      <th className="text-left py-2 pr-4 text-foreground">Meaning</th>
                      <th className="text-left py-2 text-foreground">Resolution</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border"><td className="py-2 pr-4 font-mono">400</td><td className="py-2 pr-4">Missing required parameters</td><td className="py-2">Ensure lga and state are provided</td></tr>
                    <tr className="border-b border-border"><td className="py-2 pr-4 font-mono">401</td><td className="py-2 pr-4">Invalid or missing API key</td><td className="py-2">Check your API key is correct and active</td></tr>
                    <tr className="border-b border-border"><td className="py-2 pr-4 font-mono">403</td><td className="py-2 pr-4">No active subscription for LGA</td><td className="py-2">Subscribe to the LGA first (₦10,000/month)</td></tr>
                    <tr className="border-b border-border"><td className="py-2 pr-4 font-mono">404</td><td className="py-2 pr-4">Property or endpoint not found</td><td className="py-2">Check the ID or endpoint path</td></tr>
                    <tr className="border-b border-border"><td className="py-2 pr-4 font-mono">405</td><td className="py-2 pr-4">Method not allowed</td><td className="py-2">Only GET requests are supported</td></tr>
                    <tr><td className="py-2 pr-4 font-mono">500</td><td className="py-2 pr-4">Server error</td><td className="py-2">Contact support</td></tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Pricing */}
        <section id="pricing" className="mb-12">
          <h2 className="text-2xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" /> Pricing
          </h2>
          <Card className="border-primary/20">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-4xl font-display font-bold text-foreground mb-1">₦10,000</p>
                <p className="text-sm text-muted-foreground font-body mb-4">per LGA / per month</p>
                <div className="space-y-2 text-left max-w-sm mx-auto font-body text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">✅ Full property data for the LGA</p>
                  <p className="flex items-center gap-2">✅ Real-time updates</p>
                  <p className="flex items-center gap-2">✅ Up to 100 results per request</p>
                  <p className="flex items-center gap-2">✅ Filter by type, price, bedrooms</p>
                  <p className="flex items-center gap-2">✅ Property images and coordinates</p>
                  <p className="flex items-center gap-2">✅ 30-day access per subscription</p>
                </div>
                <Button className="mt-6" asChild>
                  <Link to="/auth">Get Started</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Code Examples */}
        <section className="mb-12">
          <h2 className="text-2xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
            <Code className="w-5 h-5 text-primary" /> Code Examples
          </h2>
          <Tabs defaultValue="javascript" className="space-y-4">
            <TabsList>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="php">PHP</TabsTrigger>
            </TabsList>

            <TabsContent value="javascript">
              <CodeBlock title="JavaScript (fetch)">{`const API_KEY = "pk_your_api_key_here";
const BASE = "${BASE_URL}";

// List properties in Ikeja, Lagos
const response = await fetch(
  \`\${BASE}/properties?lga=Ikeja&state=Lagos&listing_type=rent\`,
  { headers: { "x-api-key": API_KEY } }
);

const data = await response.json();
console.log(\`Found \${data.pagination.total} properties\`);

data.data.forEach(property => {
  console.log(\`\${property.title} - ₦\${property.price.toLocaleString()}\`);
});`}</CodeBlock>
            </TabsContent>

            <TabsContent value="python">
              <CodeBlock title="Python (requests)">{`import requests

API_KEY = "pk_your_api_key_here"
BASE = "${BASE_URL}"

response = requests.get(
    f"{BASE}/properties",
    params={"lga": "Ikeja", "state": "Lagos", "listing_type": "rent"},
    headers={"x-api-key": API_KEY}
)

data = response.json()
print(f"Found {data['pagination']['total']} properties")

for prop in data["data"]:
    print(f"{prop['title']} - ₦{prop['price']:,}")`}</CodeBlock>
            </TabsContent>

            <TabsContent value="php">
              <CodeBlock title="PHP (cURL)">{`<?php
$api_key = "pk_your_api_key_here";
$base = "${BASE_URL}";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "$base/properties?lga=Ikeja&state=Lagos");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "x-api-key: $api_key"
]);

$response = curl_exec($ch);
$data = json_decode($response, true);

echo "Found " . $data["pagination"]["total"] . " properties\\n";

foreach ($data["data"] as $property) {
    echo $property["title"] . " - ₦" . number_format($property["price"]) . "\\n";
}
?>`}</CodeBlock>
            </TabsContent>
          </Tabs>
        </section>

        {/* Rate Limits */}
        <section className="mb-12">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-display font-bold text-foreground text-lg mb-2">Rate Limits & Usage</h3>
              <ul className="space-y-1 font-body text-sm text-muted-foreground">
                <li>• Maximum 100 results per request</li>
                <li>• Subscriptions are per LGA, per month (30 days)</li>
                <li>• API keys can be regenerated from your dashboard</li>
                <li>• Only active, verified properties are returned</li>
                <li>• All prices are in Nigerian Naira (₦)</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <div className="text-center py-8">
          <p className="text-muted-foreground font-body text-sm mb-4">
            Need help integrating? Contact our developer support team.
          </p>
          <Button variant="outline" asChild>
            <Link to="/contact">Contact Support</Link>
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ApiDocs;

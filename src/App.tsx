import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import ForSale from "./pages/ForSale";
import ToRent from "./pages/ToRent";
import Bid from "./pages/Bid";
import FindAgents from "./pages/FindAgents";
import HousePrices from "./pages/HousePrices";
import PropertyValuation from "./pages/PropertyValuation";
import MortgageCalculatorPage from "./pages/MortgageCalculatorPage";
import BuyingGuide from "./pages/BuyingGuide";
import RentingGuide from "./pages/RentingGuide";
import About from "./pages/About";
import Careers from "./pages/Careers";
import Contact from "./pages/Contact";
import Advertise from "./pages/Advertise";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Blog from "./pages/Blog";
import Press from "./pages/Press";
import Sitemap from "./pages/Sitemap";
import BlogPost from "./pages/BlogPost";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProperties from "./pages/admin/AdminProperties";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAgents from "./pages/admin/AdminAgents";
import AdminAgencies from "./pages/admin/AdminAgencies";
import AdminInquiries from "./pages/admin/AdminInquiries";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";

// Agent
import AgentDashboard from "./pages/agent/AgentDashboard";
import AgentProperties from "./pages/agent/AgentProperties";
import AgentInquiries from "./pages/agent/AgentInquiries";
import AgentAnalytics from "./pages/agent/AgentAnalytics";
import AgentBilling from "./pages/agent/AgentBilling";
import AgentSettings from "./pages/agent/AgentSettings";

// Agency
import AgencyDashboard from "./pages/agency/AgencyDashboard";
import AgencyProperties from "./pages/agency/AgencyProperties";
import AgencyAgents from "./pages/agency/AgencyAgents";
import AgencyAnalytics from "./pages/agency/AgencyAnalytics";
import AgencyBilling from "./pages/agency/AgencyBilling";
import AgencySettings from "./pages/agency/AgencySettings";

// User
import UserDashboard from "./pages/user/UserDashboard";
import UserFavourites from "./pages/user/UserFavourites";
import UserInquiries from "./pages/user/UserInquiries";
import UserSearches from "./pages/user/UserSearches";
import UserSettings from "./pages/user/UserSettings";
import CookieConsent from "./components/CookieConsent";
import MessagesPage from "./pages/MessagesPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/for-sale" element={<ForSale />} />
            <Route path="/to-rent" element={<ToRent />} />
            <Route path="/bid" element={<Bid />} />
            <Route path="/find-agents" element={<FindAgents />} />
            <Route path="/house-prices" element={<HousePrices />} />
            <Route path="/property-valuation" element={<PropertyValuation />} />
            <Route path="/mortgage-calculator" element={<MortgageCalculatorPage />} />
            <Route path="/buying-guide" element={<BuyingGuide />} />
            <Route path="/renting-guide" element={<RentingGuide />} />
            <Route path="/about" element={<About />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/advertise" element={<Advertise />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/press" element={<Press />} />
            <Route path="/sitemap" element={<Sitemap />} />

            {/* Admin Portal */}
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/properties" element={<ProtectedRoute requiredRole="admin"><AdminProperties /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/agents" element={<ProtectedRoute requiredRole="admin"><AdminAgents /></ProtectedRoute>} />
            <Route path="/admin/agencies" element={<ProtectedRoute requiredRole="admin"><AdminAgencies /></ProtectedRoute>} />
            <Route path="/admin/inquiries" element={<ProtectedRoute requiredRole="admin"><AdminInquiries /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="admin"><AdminAnalytics /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AdminSettings /></ProtectedRoute>} />
            <Route path="/admin/messages" element={<ProtectedRoute requiredRole="admin"><MessagesPage /></ProtectedRoute>} />

            {/* Agent Portal */}
            <Route path="/agent" element={<ProtectedRoute requiredRole="agent"><AgentDashboard /></ProtectedRoute>} />
            <Route path="/agent/properties" element={<ProtectedRoute requiredRole="agent"><AgentProperties /></ProtectedRoute>} />
            <Route path="/agent/inquiries" element={<ProtectedRoute requiredRole="agent"><AgentInquiries /></ProtectedRoute>} />
            <Route path="/agent/analytics" element={<ProtectedRoute requiredRole="agent"><AgentAnalytics /></ProtectedRoute>} />
            <Route path="/agent/billing" element={<ProtectedRoute requiredRole="agent"><AgentBilling /></ProtectedRoute>} />
            <Route path="/agent/settings" element={<ProtectedRoute requiredRole="agent"><AgentSettings /></ProtectedRoute>} />
            <Route path="/agent/messages" element={<ProtectedRoute requiredRole="agent"><MessagesPage /></ProtectedRoute>} />

            {/* Agency Portal */}
            <Route path="/agency" element={<ProtectedRoute requiredRole="agency"><AgencyDashboard /></ProtectedRoute>} />
            <Route path="/agency/properties" element={<ProtectedRoute requiredRole="agency"><AgencyProperties /></ProtectedRoute>} />
            <Route path="/agency/agents" element={<ProtectedRoute requiredRole="agency"><AgencyAgents /></ProtectedRoute>} />
            <Route path="/agency/inquiries" element={<ProtectedRoute requiredRole="agent"><AgentInquiries /></ProtectedRoute>} />
            <Route path="/agency/analytics" element={<ProtectedRoute requiredRole="agency"><AgencyAnalytics /></ProtectedRoute>} />
            <Route path="/agency/billing" element={<ProtectedRoute requiredRole="agency"><AgencyBilling /></ProtectedRoute>} />
            <Route path="/agency/settings" element={<ProtectedRoute requiredRole="agency"><AgencySettings /></ProtectedRoute>} />
            <Route path="/agency/messages" element={<ProtectedRoute requiredRole="agency"><MessagesPage /></ProtectedRoute>} />

            {/* User Portal */}
            <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/favourites" element={<ProtectedRoute><UserFavourites /></ProtectedRoute>} />
            <Route path="/dashboard/inquiries" element={<ProtectedRoute><UserInquiries /></ProtectedRoute>} />
            <Route path="/dashboard/searches" element={<ProtectedRoute><UserSearches /></ProtectedRoute>} />
            <Route path="/dashboard/settings" element={<ProtectedRoute><UserSettings /></ProtectedRoute>} />
            <Route path="/dashboard/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
          <CookieConsent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

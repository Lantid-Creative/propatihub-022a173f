import { useLocation, Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const PublicLayout = () => {
  const { pathname } = useLocation();
  const isHomePage = pathname === "/";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className={`flex-1 ${isHomePage ? "" : "pt-16"}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;

import Dashboard from "@/components/Dashboard";
import Sidebar from "@/components/Sidebar";
import TopNavbar from "@/components/TopNavbar";
import { Helmet } from "react-helmet";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <Helmet>
        <title>Dashboard - Learning Tracker</title>
        <meta name="description" content="Track your progress across all your courses. View your enrolled courses, recently viewed lessons, and recommendations." />
      </Helmet>
      
      <Sidebar />
      
      <main className="flex-1 md:ml-64 min-h-screen">
        <TopNavbar />
        
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Dashboard />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;

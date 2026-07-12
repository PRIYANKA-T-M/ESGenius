import React, { useEffect, useState } from 'react';
import { useSocialApi } from './hooks/useSocialApi';
import Leaderboard from './components/Leaderboard';
import ChallengeCards from './components/ChallengeCards';
import CSRUpload from './components/CSRUpload';
import { Globe, Users, ShieldCheck, LayoutDashboard, BarChart, Settings, Bell, Search, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const Social = () => {
  const { getChallenges, getLeaderboard, loading, error } = useSocialApi();
  const [data, setData] = useState({ challenges: [], leaderboard: [] });

  const loadData = async () => {
    const [challenges, leaderboard] = await Promise.all([
      getChallenges(),
      getLeaderboard()
    ]);
    setData({ challenges, leaderboard });
  };

  useEffect(() => {
    loadData();
  }, [getChallenges, getLeaderboard]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-gray-900">
      
      {/* LEFT SIDEBAR (MOCKED FOR STANDALONE) */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Globe className="h-6 w-6 text-blue-600 mr-2" />
          <span className="font-bold text-xl tracking-tight">ESGenius</span>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-3">
          <SidebarItem icon={<Globe />} label="Environmental" to="/environmental" />
          <SidebarItem icon={<Users />} label="Social" to="/social" active />
          <SidebarItem icon={<ShieldCheck />} label="Governance" to="/governance" />
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOP NAV */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center bg-gray-100 rounded-md px-3 py-1.5 w-96">
            <Search className="h-4 w-4 text-gray-400 mr-2" />
            <input type="text" placeholder="Search challenges, employees..." className="bg-transparent border-none focus:outline-none text-sm w-full" />
          </div>
          <div className="flex items-center space-x-4">
            <Bell className="h-5 w-5 text-gray-400" />
            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">JD</div>
          </div>
        </header>

        {/* DASHBOARD */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Social & CSR Engagement</h1>
            </div>

            {error && <div className="text-red-500 bg-red-50 p-4 rounded-md">{error}</div>}

            {/* ACTIVE CHALLENGES */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><Award className="h-5 w-5 text-purple-500 mr-2" /> Active Challenges</h2>
              <ChallengeCards challenges={data.challenges} loading={loading} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-[450px]">
                <Leaderboard data={data.leaderboard} loading={loading} />
              </div>
              <div className="h-[450px]">
                <CSRUpload onUploadSuccess={loadData} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, active, to }) => (
  <Link to={to || "#"} className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
    <span className={`mr-3 h-5 w-5 ${active ? 'text-blue-600' : 'text-gray-400'}`}>{icon}</span>
    {label}
  </Link>
);

export default Social;

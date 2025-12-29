import { Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header.tsx';
import Footer from './components/Footer/Footer.tsx';
import HeroSection from './components/HeroSection';
import { ScheduleSection } from './components/ScheduleSection';
import { ScenarioSection } from './components/ScenarioSection';
import { TakanashiSection } from './components/TakanashiSection';
import { ProfileSection } from './components/ProfileSection';
import { SchedulePage } from './pages/Schedule';
import { ScheduleAdminPage } from './pages/ScheduleAdmin';
import { ScenarioPage } from './pages/Scenario';
import { ScenarioAdminPage } from './pages/ScenarioAdmin';
import { TakanashiPage } from './pages/Takanashi';
import { ProfilePage } from './pages/Profile';
import './styles/sections.css';

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/schedule-admin" element={<ScheduleAdminPage />} />
        <Route path="/scenario" element={<ScenarioPage />} />
        <Route path="/scenario-admin" element={<ScenarioAdminPage />} />
        <Route path="/takanashi" element={<TakanashiPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </>
  );
}

function Home() {
  return (
    <>
      <HeroSection />
      <div className="homeGrid">
        <ScheduleSection />
        <ScenarioSection />
        <TakanashiSection />
        <ProfileSection />
      </div>
      <Footer />
    </>
  );
}
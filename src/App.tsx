import { Routes, Route } from 'react-router-dom';
import Header from './components/0-Header/Header.tsx';
import Footer from './components/0-Footer/Footer.tsx';
import HeroSection from './components/1-Top/HeroSection.tsx';
import { ScheduleSection } from './components/1-Top/ScheduleSection.tsx';
import { ScenarioSection } from './components/1-Top/ScenarioSection.tsx';
import { TakanashiSection } from './components/1-Top/TakanashiSection.tsx';
import { ProfileSection } from './components/1-Top/ProfileSection.tsx';
import { SchedulePage } from './components/2-Schedule/Schedule.tsx';
import { ScheduleAdminPage } from './components/2-Schedule/ScheduleAdmin.tsx';
import { ScenarioPage } from './components/3-Scenario/Scenario.tsx';
import { ScenarioAdminPage } from './components/3-Scenario/ScenarioAdmin.tsx';
import { TakanashiPage } from './components/4-Takanashi/Takanashi.tsx';
import { ProfilePage } from './components/5-Profile/Profile.tsx';
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
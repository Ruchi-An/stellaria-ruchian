import { Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header.tsx';
import Footer from './components/Footer/Footer.tsx';
import HeroSection from './components/HeroSection.tsx';
import { ScheduleSection } from './components/ScheduleSection';
import { ScenarioSection } from './components/ScenarioSection';
import { TakanashiSection } from './components/TakanashiSection';
import { ProfileSection } from './components/ProfileSection';
import { SchedulePage } from './pages/Schedule';
import { ScenarioPage } from './pages/Scenario';
import { TakanashiPage } from './pages/Takanashi';
import { ProfilePage } from './pages/Profile';

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/scenario" element={<ScenarioPage />} />
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
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '40px',
        maxWidth: '1280px',
        margin: '40px auto',
        padding: '0 20px'
      }}>
        <ScheduleSection />
        <ScenarioSection />
        <TakanashiSection />
        <ProfileSection />
      </div>
      <Footer />
    </>
  );
}
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import RendezVous from "./pages/RendezVous";
import Consultations from "./pages/Consultations";
import Prescriptions from "./pages/Prescriptions";
import AnalyseIA from "./pages/AnalyseIA";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/rendezvous" element={<RendezVous />} />
        <Route path="/consultations" element={<Consultations />} />
        <Route path="/prescriptions" element={<Prescriptions />} />
        <Route path="/analyse" element={<AnalyseIA />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
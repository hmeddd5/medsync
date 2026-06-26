import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import RendezVous from "./pages/RendezVous";
import Consultations from "./pages/Consultations";
import Prescriptions from "./pages/Prescriptions";
import AnalyseIA from "./pages/AnalyseIA";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("token") ? true : false
  );

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute
              allowedRoles={["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"]}
            >
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patients"
          element={
            <ProtectedRoute
              allowedRoles={["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"]}
            >
              <Patients />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rendezvous"
          element={
            <ProtectedRoute
              allowedRoles={["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"]}
            >
              <RendezVous />
            </ProtectedRoute>
          }
        />

        <Route
          path="/consultations"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "DOCTOR", "NURSE"]}>
              <Consultations />
            </ProtectedRoute>
          }
        />

        <Route
          path="/prescriptions"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "DOCTOR", "NURSE"]}>
              <Prescriptions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analyse"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "DOCTOR"]}>
              <AnalyseIA />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
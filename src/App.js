import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import InscriptionPage from "./InscriptionPage";
import ConnexionPage from "./ConnexionPage";
import DashboardMedecin from "./DashboardMedecin";
import DashboardPatient from "./DashboardPatient.jsx";
import DashboardAdmin from "./DashboardAdmin";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/inscription" element={<InscriptionPage />} />
        <Route path="/connexion" element={<ConnexionPage />} />
        <Route path="/dashboard/medecin" element={<DashboardMedecin />} />
        <Route path="/dashboard/patient" element={<DashboardPatient />} />
        <Route path="/dashboard/admin" element={<DashboardAdmin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
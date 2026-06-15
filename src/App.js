import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import InscriptionPage from "./InscriptionPage";
import ConnexionPage from "./ConnexionPage";
import DashboardMedecin from "./DashboardMedecin";
import DashboardPatient from "./DashboardPatient.jsx";
import DashboardAdmin from "./DashboardAdmin";
import DashboardInfirmier from "./DashboardInfirmier";
import { ToastProvider } from "./components/Toast";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/inscription" element={<InscriptionPage />} />
          <Route path="/connexion" element={<ConnexionPage />} />
          <Route path="/dashboard/medecin" element={<DashboardMedecin />} />
          <Route path="/dashboard/patient" element={<DashboardPatient />} />
          <Route path="/dashboard/admin" element={<DashboardAdmin />} />
          <Route path="/dashboard/infirmier" element={<DashboardInfirmier />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;

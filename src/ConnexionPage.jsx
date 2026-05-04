import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "./api";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #f8fafc;
  }

  .form-input {
    width: 100%;
    padding: 11px 14px;
    border: 1.5px solid #dde3ea;
    border-radius: 8px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px;
    color: #1a2332;
    background: #fff;
    outline: none;
    transition: border 0.2s, box-shadow 0.2s;
  }
  .form-input:focus {
    border-color: #0a5c8a;
    box-shadow: 0 0 0 3px rgba(10,92,138,0.08);
  }

  .btn-submit {
    width: 100%;
    padding: 13px;
    background: linear-gradient(135deg, #0a5c8a, #0c6ea3);
    color: #fff;
    border: none;
    border-radius: 8px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.15s;
    letter-spacing: 0.02em;
  }
  .btn-submit:hover { opacity: 0.92; transform: translateY(-1px); }

  .label {
    font-size: 13px;
    font-weight: 600;
    color: #3a4f60;
    margin-bottom: 6px;
    display: block;
  }

  .divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 24px 0;
  }
  .divider-line {
    flex: 1;
    height: 1px;
    background: #e8edf2;
  }
  .divider-text {
    font-size: 12px;
    color: #a0b0bc;
    font-weight: 500;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .anim { animation: fadeUp 0.5s ease both; }
`;

const EyeIcon = ({ open }) => open ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.8"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

export default function ConnexionPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErreur("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErreur("");
    try {
      const { user } = await login(form.email, form.password);
      // Redirection selon le rôle
      const role = user?.role?.toLowerCase() || "";
      if (role === "admin") navigate("/dashboard/admin");
      else if (role === "medecin") navigate("/dashboard/medecin");
      else navigate("/dashboard/patient");
    } catch (err) {
      setErreur(err.message || "Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #eef6fb 0%, #f8fafc 60%, #e6f7f2 100%)", display: "flex", flexDirection: "column" }}>

        {/* Navbar */}
        <nav style={{
          background: "linear-gradient(135deg, #0a5c8a 0%, #0c6ea3 60%, #1a8cbf 100%)",
          padding: "0 40px", display: "flex", justifyContent: "space-between",
          alignItems: "center", height: "64px",
          boxShadow: "0 2px 16px rgba(10,92,138,0.18)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: "rgba(255,255,255,0.2)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 3a1 1 0 011 1v3h3a1 1 0 010 2h-3v3a1 1 0 01-2 0v-3H8a1 1 0 010-2h3V7a1 1 0 011-1z"/>
              </svg>
            </div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#fff", fontWeight: 700 }}>KDG Health</span>
          </div>
          <button onClick={() => navigate("/")}
            style={{ background: "transparent", border: "1.5px solid rgba(255,255,255,0.6)", color: "#fff", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 600, padding: "8px 20px", borderRadius: 6, cursor: "pointer" }}>
            ← Retour
          </button>
        </nav>

        {/* Formulaire */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
          <div className="anim" style={{
            background: "#fff", borderRadius: 20,
            boxShadow: "0 8px 40px rgba(10,92,138,0.10)",
            padding: "40px 44px", width: "100%", maxWidth: 460,
          }}>

            {/* En-tête */}
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ width: 56, height: 56, background: "#eef6fb", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="#0a5c8a" strokeWidth="1.5"/>
                  <path d="M7 11V7a5 5 0 0110 0v4" stroke="#0a5c8a" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="12" cy="16" r="1.5" fill="#0a5c8a"/>
                </svg>
              </div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "#0d1f2d", marginBottom: 6 }}>
                Connexion
              </h1>
              <p style={{ fontSize: 13, color: "#7a90a0" }}>Entrez vos identifiants pour accéder à votre espace</p>
            </div>

            <form onSubmit={handleSubmit}>

              {/* Email */}
              <div style={{ marginBottom: 18 }}>
                <label className="label">Adresse email</label>
                <input
                  className="form-input"
                  type="email"
                  name="email"
                  placeholder="exemple@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Mot de passe */}
              <div style={{ marginBottom: 10 }}>
                <label className="label">Mot de passe</label>
                <div style={{ position: "relative" }}>
                  <input
                    className="form-input"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Votre mot de passe"
                    value={form.password}
                    onChange={handleChange}
                    required
                    style={{ paddingRight: 44 }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#7a90a0" }}>
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              {/* Mot de passe oublié */}
              <div style={{ textAlign: "right", marginBottom: 24 }}>
                <span style={{ fontSize: 12, color: "#0a5c8a", fontWeight: 600, cursor: "pointer" }}
                  onClick={() => alert("Fonctionnalité à venir")}>
                  Mot de passe oublié ?
                </span>
              </div>

              {/* Message d'erreur */}
              {erreur && (
                <div style={{ background: "#fff0f0", border: "1px solid #f5c6c6", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#c0392b" }}>
                  {erreur}
                </div>
              )}

              {/* Bouton connexion */}
              <button type="submit" className="btn-submit" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
                {loading ? "Connexion en cours..." : "Se connecter"}
              </button>

              {/* Divider */}
              <div className="divider">
                <div className="divider-line"/>
                <span className="divider-text">ou</span>
                <div className="divider-line"/>
              </div>

              {/* Lien inscription */}
              <p style={{ textAlign: "center", fontSize: 13, color: "#7a90a0" }}>
                Pas encore de compte ?{" "}
                <span style={{ color: "#0a5c8a", fontWeight: 600, cursor: "pointer" }}
                  onClick={() => navigate("/inscription")}>
                  S'inscrire
                </span>
              </p>

            </form>
          </div>
        </div>

        {/* Footer */}
        <footer style={{ background: "#0d1f2d", padding: "16px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: "#fff", fontWeight: 700 }}>KDG Health</span>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>© 2026 Tous droits réservés</span>
        </footer>

      </div>
    </>
  );
}
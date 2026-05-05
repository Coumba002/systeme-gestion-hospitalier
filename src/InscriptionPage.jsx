import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "./api";

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
  .form-input.error {
    border-color: #d83030;
    box-shadow: 0 0 0 3px rgba(216,48,48,0.08);
  }

  .form-select {
    width: 100%;
    padding: 11px 14px;
    border: 1.5px solid #dde3ea;
    border-radius: 8px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px;
    color: #1a2332;
    background: #fff;
    outline: none;
    cursor: pointer;
    transition: border 0.2s, box-shadow 0.2s;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%230a5c8a' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
  }
  .form-select:focus {
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

  .error-msg {
    font-size: 11px;
    color: #d83030;
    margin-top: 5px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .phone-wrapper {
    display: flex;
    gap: 8px;
  }

  .phone-prefix {
    padding: 11px 12px;
    border: 1.5px solid #dde3ea;
    border-radius: 8px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px;
    color: #1a2332;
    background: #f8fafc;
    outline: none;
    cursor: pointer;
    appearance: none;
    min-width: 90px;
    transition: border 0.2s;
  }
  .phone-prefix:focus {
    border-color: #0a5c8a;
    box-shadow: 0 0 0 3px rgba(10,92,138,0.08);
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

export default function InscriptionPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [erreurConfirm, setErreurConfirm] = useState("");
  const [erreur, setErreur] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    prenom: "", nom: "", sexe: "", age: "",
    telephone: "", prefix: "+221",
    email: "", password: "", confirm: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === "confirm") {
      setErreurConfirm(value !== form.password ? "Les mots de passe ne correspondent pas." : "");
    }
    if (name === "password" && form.confirm) {
      setErreurConfirm(form.confirm !== value ? "Les mots de passe ne correspondent pas." : "");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setErreurConfirm("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    setErreur("");
    try {
      await register({
        name: `${form.prenom} ${form.nom}`,
        email: form.email,
        password: form.password,
        // Champs supplémentaires si votre API les accepte
        prenom: form.prenom,
        nom: form.nom,
        sexe: form.sexe,
        age: form.age,
        telephone: `${form.prefix}${form.telephone}`,
      });
      navigate("/dashboard/patient"); // Nouvel utilisateur → dashboard patient
    } catch (err) {
      setErreur(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  const passwordMatch = form.confirm && form.password === form.confirm;

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
            padding: "40px 44px", width: "100%", maxWidth: 540,
          }}>
            {/* En-tête */}
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ width: 56, height: 56, background: "#eef6fb", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="#0a5c8a" strokeWidth="1.5"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#0a5c8a" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "#0d1f2d", marginBottom: 6 }}>
                Créer un compte
              </h1>
              <p style={{ fontSize: 13, color: "#7a90a0" }}>Remplissez les informations ci-dessous pour vous inscrire</p>
            </div>

            <form onSubmit={handleSubmit}>

              {/* Prénom + Nom */}
              <div style={{ display: "flex", gap: 14, marginBottom: 18 }}>
                <div style={{ flex: 1 }}>
                  <label className="label">Prénom *</label>
                  <input className="form-input" type="text" name="prenom" placeholder="Ex: Amadou" value={form.prenom} onChange={handleChange} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">Nom *</label>
                  <input className="form-input" type="text" name="nom" placeholder="Ex: Diallo" value={form.nom} onChange={handleChange} required />
                </div>
              </div>

              {/* Sexe + Âge */}
              <div style={{ display: "flex", gap: 14, marginBottom: 18 }}>
                <div style={{ flex: 1 }}>
                  <label className="label">Sexe *</label>
                  <select className="form-select" name="sexe" value={form.sexe} onChange={handleChange} required>
                    <option value="">Sélectionner</option>
                    <option value="homme">Homme</option>
                    <option value="femme">Femme</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">Âge *</label>
                  <input className="form-input" type="number" name="age" placeholder="Ex: 30" min="1" max="120" value={form.age} onChange={handleChange} required />
                </div>
              </div>

              {/* Téléphone */}
              <div style={{ marginBottom: 18 }}>
                <label className="label">Numéro de téléphone *</label>
                <div className="phone-wrapper">
                  <select className="phone-prefix" name="prefix" value={form.prefix} onChange={handleChange}>
                    <option value="+221">🇸🇳 +221</option>
                    <option value="+33">🇫🇷 +33</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+212">🇲🇦 +212</option>
                    <option value="+225">🇨🇮 +225</option>
                    <option value="+223">🇲🇱 +223</option>
                    <option value="+224">🇬🇳 +224</option>
                    <option value="+245">🇬🇼 +245</option>
                    <option value="+227">🇳🇪 +227</option>
                    <option value="+229">🇧🇯 +229</option>
                  </select>
                  <input
                    className="form-input"
                    type="tel"
                    name="telephone"
                    placeholder="77 123 45 67"
                    value={form.telephone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div style={{ marginBottom: 18 }}>
                <label className="label">Adresse email *</label>
                <input className="form-input" type="email" name="email" placeholder="exemple@email.com" value={form.email} onChange={handleChange} required />
              </div>

              {/* Mot de passe */}
              <div style={{ marginBottom: 18 }}>
                <label className="label">Mot de passe *</label>
                <div style={{ position: "relative" }}>
                  <input
                    className="form-input"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Minimum 8 caractères"
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

              {/* Confirmer mot de passe */}
              <div style={{ marginBottom: 28 }}>
                <label className="label">Confirmer le mot de passe *</label>
                <div style={{ position: "relative" }}>
                  <input
                    className={`form-input${erreurConfirm ? " error" : ""}`}
                    type={showConfirm ? "text" : "password"}
                    name="confirm"
                    placeholder="Répétez votre mot de passe"
                    value={form.confirm}
                    onChange={handleChange}
                    required
                    style={{ paddingRight: 44 }}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    style={{ position: "absolute", right: 12, top: erreurConfirm ? "38%" : "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#7a90a0" }}>
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
                {erreurConfirm && (
                  <div className="error-msg">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#d83030"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                    {erreurConfirm}
                  </div>
                )}
                {passwordMatch && (
                  <div style={{ fontSize: 11, color: "#0f6e56", marginTop: 5, display: "flex", alignItems: "center", gap: 4 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#0f6e56"><path d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Les mots de passe correspondent.
                  </div>
                )}
              </div>

              {/* Erreur globale */}
              {erreur && (
                <div style={{ background: "#fff0f0", border: "1px solid #f5c6c6", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#c0392b" }}>
                  {erreur}
                </div>
              )}

              {/* Bouton */}
              <button type="submit" className="btn-submit" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
                {loading ? "Création en cours..." : "Créer mon compte"}
              </button>

              {/* Lien connexion */}
              <p style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: "#7a90a0" }}>
                Déjà un compte ?{" "}
                <span style={{ color: "#0a5c8a", fontWeight: 600, cursor: "pointer" }}
                  onClick={() => navigate("/connexion")}>
                  Se connecter
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
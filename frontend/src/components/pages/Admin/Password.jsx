import React, { useEffect, useState } from "react";
import axios from "axios";

const Password = () => {
  const [adminPassword, setAdminPassword] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [visible, setVisible] = useState({ admin: false, user: false });
  const [editMode, setEditMode] = useState({ admin: false, user: false });
  const [editValue, setEditValue] = useState({ admin: "", user: "" });

  // Ajout pour la confirmation
  const [confirmPopup, setConfirmPopup] = useState({ open: false, type: "", value: "" });
  const [confirmInput, setConfirmInput] = useState("");

  const API_BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchPasswords = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/admin/motdepasse`);
        const admin = res.data.find((p) => p.info === "Admin");
        const user = res.data.find((p) => p.info === "Opérateur");

        if (admin) setAdminPassword(admin.mot_de_passe);
        if (user) setUserPassword(user.mot_de_passe);
      } catch (err) {
        console.error("Erreur lors de la récupération des mots de passe", err);
      }
    };

    fetchPasswords();
  }, [API_BASE_URL]);

  const handleEdit = (type) => {
    setEditMode((prev) => ({ ...prev, [type]: true }));
    setEditValue((prev) => ({
      ...prev,
      [type]: type === "admin" ? adminPassword : userPassword,
    }));
  };

  const handleChange = (type, value) => {
    setEditValue((prev) => ({ ...prev, [type]: value }));
  };

  // Ouvre le popup de confirmation
  const handleSave = (type) => {
    setConfirmPopup({ open: true, type, value: editValue[type] });
    setConfirmInput("");
  };

  // Valide la confirmation et enregistre
  const handleConfirmSave = async () => {
    const { type, value } = confirmPopup;
    if (confirmInput !== value) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }
    const id = type === "admin" ? 2 : 1;

    try {
      await axios.put(`${API_BASE_URL}/admin/motdepasse/${id}`, {
        mot_de_passe: value,
      });

      if (type === "admin") setAdminPassword(value);
      if (type === "user") setUserPassword(value);

      setEditMode((prev) => ({ ...prev, [type]: false }));
      setConfirmPopup({ open: false, type: "", value: "" });
      setConfirmInput("");
    } catch (err) {
      console.error("Erreur lors de la mise à jour", err);
    }
  };

  const renderField = (label, type, password) => (
    <div className="password-block">
      <h2>{label}</h2>
      {editMode[type] ? (
        <div className="password-edit-row">
          <input
            className="password-input"
            type="text"
            value={editValue[type]}
            onChange={(e) => handleChange(type, e.target.value)}
          />
          <button
            className="password-btn password-btn-save"
            onClick={() => handleSave(type)}
          >
            Enregistrer
          </button>
          <button
            className="password-btn password-btn-cancel"
            onClick={() => setEditMode((p) => ({ ...p, [type]: false }))}
          >
            Annuler
          </button>
        </div>
      ) : (
        <div className="password-row">
          <span className="password-value">
            {visible[type] ? password : "••••••••"}
          </span>
          <button
            className="password-btn password-btn-toggle"
            onClick={() =>
              setVisible((prev) => ({ ...prev, [type]: !prev[type] }))
            }
          >
            {visible[type] ? "Masquer" : "Afficher"}
          </button>
          <button
            className="password-btn password-btn-edit"
            onClick={() => handleEdit(type)}
          >
            Éditer
          </button>
        </div>
      )}
    </div>
  );

  // Pop-up de confirmation
  const renderConfirmPopup = () =>
    confirmPopup.open && (
      <div className="popup-overlay" style={{
        position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
        background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
      }}>
        <div className="popup-content" style={{
          background: "#fff", padding: 24, borderRadius: 8, minWidth: 300, boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
        }}>
          <h3>Confirmer le mot de passe</h3>
          <p>Veuillez retaper le nouveau mot de passe pour confirmer :</p>
          <input
            type="text"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            className="password-input"
            style={{ marginBottom: 12, width: "100%" }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="password-btn password-btn-save"
              onClick={handleConfirmSave}
            >
              Valider
            </button>
            <button
              className="password-btn password-btn-cancel"
              onClick={() => setConfirmPopup({ open: false, type: "", value: "" })}
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="passwords-container">
      {renderField("Mot de passe Admin", "admin", adminPassword)}
      {renderField("Mot de passe Utilisateur", "user", userPassword)}
      {renderConfirmPopup()}
    </div>
  );
};

export default Password;

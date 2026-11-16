import { useEffect, useState } from "react";
import Icon from "./Icon.jsx";

function ApplicationCvDialog({ offer, profile, onClose, onOpenProfile, onSubmit }) {
  const [cvSource, setCvSource] = useState(profile.cvName ? "profile" : "");

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const cvName = cvSource === "profile" ? profile.cvName : "CV_simulado.pdf";

  return (
    <div className="application-cv-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="application-cv-dialog" role="dialog" aria-modal="true" aria-labelledby="application-cv-title">
        <div className="application-cv-heading">
          <span className="application-cv-icon"><Icon name="book" size={22} /></span>
          <button className="icon-button" type="button" aria-label="Cerrar" onClick={onClose}><Icon name="close" size={17} /></button>
        </div>
        <div className="eyebrow">PASO FINAL · DOCUMENTO</div>
        <h2 id="application-cv-title">Adjunta tu currículum</h2>
        <p className="application-cv-description">Selecciona el CV que quieres enviar con tu postulación a <strong>{offer.company}</strong>.</p>

        <div className="application-cv-options">
          <button type="button" className={`application-cv-option ${cvSource === "simulated" ? "selected" : ""}`} aria-pressed={cvSource === "simulated"} onClick={() => setCvSource("simulated")}>
            <span className="application-cv-option-icon"><Icon name="clipboard" size={19} /></span>
            <span><strong>Usar CV simulado</strong><small>Adjunta un archivo de demostración</small></span>
            {cvSource === "simulated" && <Icon name="check" size={17} />}
          </button>

          {profile.cvName ? (
            <button type="button" className={`application-cv-option ${cvSource === "profile" ? "selected" : ""}`} aria-pressed={cvSource === "profile"} onClick={() => setCvSource("profile")}>
              <span className="application-cv-option-icon"><Icon name="home" size={19} /></span>
              <span><strong>Usar CV de mi perfil</strong><small>{profile.cvName}</small></span>
              {cvSource === "profile" && <Icon name="check" size={17} />}
            </button>
          ) : (
            <div className="application-cv-missing" role="status">
              <span className="application-cv-option-icon"><Icon name="help" size={19} /></span>
              <span><strong>No tienes un CV cargado en tu perfil</strong><small>Si quieres usar uno guardado, puedes agregarlo en tu perfil.</small></span>
              <button type="button" className="text-button" onClick={onOpenProfile}>Ir a mi perfil <Icon name="arrow" size={15} /></button>
            </div>
          )}
        </div>

        <div className="application-cv-actions">
          <button type="button" className="text-button" onClick={onClose}>Cancelar</button>
          <button type="button" className="primary-button" disabled={!cvSource} onClick={() => onSubmit(cvName)}>Enviar postulación <Icon name="arrow" size={16} /></button>
        </div>
      </section>
    </div>
  );
}

export default ApplicationCvDialog;

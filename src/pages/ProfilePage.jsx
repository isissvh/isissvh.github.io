import { useState } from "react";
import Icon from "../components/Icon.jsx";
import DocumentTile from "../components/DocumentTile.jsx";

function ProfilePage({ profile, setProfile, editing, setEditing, onExplore }) {
  const [draft, setDraft] = useState({
    ...profile,
    interestsText: (profile.interests || []).join(", "),
    skillsText: (profile.skills || []).join(", "),
  });
  const [cvAttached, setCvAttached] = useState(Boolean(profile.cvName));
  const [cvError, setCvError] = useState("");
  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const saveProfile = (event) => {
    event.preventDefault();
    setCvError("");
    setProfile({
      name: draft.name,
      email: draft.email,
      career: draft.career,
      institution: draft.institution,
      interests: draft.interestsText.split(",").map((item) => item.trim()).filter(Boolean),
      skills: draft.skillsText.split(",").map((item) => item.trim()).filter(Boolean),
      cvName: cvAttached ? (draft.cvName || "CV_simulado.pdf") : "",
    });
    setDraft((current) => ({ ...current, cvName: cvAttached ? (current.cvName || "CV_simulado.pdf") : "" }));
    setEditing(false);
  };
  const toggleCv = () => {
    const attached = !cvAttached;
    const name = attached ? (draft.cvName || "CV_simulado.pdf") : "";
    setCvAttached(attached);
    setDraft((current) => ({ ...current, cvName: name }));
    if (!editing) setProfile((current) => ({ ...current, cvName: name }));
    setCvError("");
  };
  return (
    <div className="profile-page">
      <section className="welcome-row compact-welcome"><div><div className="eyebrow">TU INFORMACIÓN</div><h1>Mi perfil</h1><p>Actualiza tus datos personales, intereses, habilidades y currículum.</p></div></section>
      <section className="profile-layout">
        <div className="profile-card"><div className="profile-card-banner"><div className="profile-large-avatar">JP</div></div>{editing ? <form className="profile-edit-form" onSubmit={saveProfile}>
          <label>Nombre completo<input value={draft.name} onChange={(event) => update("name", event.target.value)} required /></label>
          <label>Correo institucional<input type="email" value={draft.email} onChange={(event) => update("email", event.target.value)} required /></label>
          <label>Carrera<input value={draft.career} onChange={(event) => update("career", event.target.value)} required /></label>
          <label>Institución<input value={draft.institution} onChange={(event) => update("institution", event.target.value)} required /></label>
          <label>Intereses <small>Separa cada interés con una coma.</small><input value={draft.interestsText} onChange={(event) => update("interestsText", event.target.value)} placeholder="Datos, desarrollo..." /></label>
          <label>Habilidades <small>Separa cada habilidad con una coma.</small><input value={draft.skillsText} onChange={(event) => update("skillsText", event.target.value)} placeholder="Python, SQL..." /></label>
          <div className="cv-upload"><DocumentTile title="Currículum" description="PDF · adjunto simulado" attached={cvAttached} onToggle={toggleCv} /></div>
          {cvError && <p className="form-error" role="alert">{cvError}</p>}
          <div className="profile-edit-actions"><button className="primary-button" type="submit">Guardar perfil</button><button className="text-button" type="button" onClick={() => { setDraft({ ...profile, interestsText: (profile.interests || []).join(", "), skillsText: (profile.skills || []).join(", ") }); setCvAttached(Boolean(profile.cvName)); setCvError(""); setEditing(false); }}>Cancelar</button></div>
        </form> : <div className="profile-card-body"><div className="profile-identity-row"><h2>{profile.name}</h2><button className="edit-profile-button" onClick={() => setEditing(true)}><Icon name="edit" size={15} /> Editar perfil</button></div><p>{profile.email}</p><div className="profile-divider" /><div className="profile-field"><span>Carrera</span><strong>{profile.career}</strong></div><div className="profile-field"><span>Institución</span><strong>{profile.institution}</strong></div><div className="profile-tag-field"><span>Intereses</span><div className="detail-tags">{(profile.interests || []).map((item) => <span key={item}>{item}</span>)}</div></div><div className="profile-tag-field"><span>Habilidades</span><div className="detail-tags">{(profile.skills || []).map((item) => <span key={item}>{item}</span>)}</div></div><div className="cv-card"><span className="document-icon"><Icon name="book" size={17} /></span><div><strong>{profile.cvName ? "Currículum adjunto" : "Currículum"}</strong><small>{profile.cvName || "Sin archivo adjunto"}</small></div><button className="outline-button" onClick={toggleCv}>{cvAttached ? "Quitar" : "Simular adjunto"}</button><button className="outline-button" onClick={() => setEditing(true)}>Actualizar</button></div>{cvError && <p className="form-error" role="alert">{cvError}</p>}</div>}</div>
        <div className="profile-side"><div className="profile-completeness"><div className="profile-progress-head"><span>Perfil de estudiante</span><strong>Actualizable</strong></div><div className="progress-track"><span /></div><p>Guarda tus conocimientos e intereses para personalizar las prácticas que revisas.</p><button className="subtle-link" onClick={() => setEditing(true)}>Completar perfil <Icon name="arrow" size={15} /></button></div><div className="profile-opportunity"><div className="quick-icon lavender"><Icon name="spark" size={17} /></div><h3>Tu perfil puede abrirte puertas</h3><p>Revisa prácticas relacionadas con tus conocimientos e intereses.</p><button className="outline-button" onClick={onExplore}>Explorar prácticas</button></div></div>
      </section>
    </div>
  );
}

export default ProfilePage;

import { useEffect, useRef, useState } from "react";
import Icon from "../components/Icon.jsx";
import CompanyMark from "../components/CompanyMark.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { MIN_WORK_MINUTES, localDate, workMinutes, formatDuration, validateEntry } from "../services/logbook.js";

const emptyDraft = () => ({ date: localDate(), startTime: "", endTime: "", text: "" });
const emptyDraftForDate = (date) => ({ date, startTime: "", endTime: "", text: "" });

function PracticeLogbook({ selectedPractice, items, onSelect, entries, setEntries }) {
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(() => { const today = new Date(); return new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1)); });
  const [calendarDate, setCalendarDate] = useState(localDate);
  const dateInput = useRef(null);
  const visibleEntries = entries
    .filter((entry) => String(entry.applicationId) === String(selectedPractice.id))
    .sort((a, b) => b.date.localeCompare(a.date));
  const totalWorkedMinutes = visibleEntries.reduce((total, entry) => {
    const minutes = workMinutes(entry.startTime, entry.endTime);
    return total + (minutes > 0 ? minutes : 0);
  }, 0);
  const duration = workMinutes(draft.startTime, draft.endTime);
  const calendarDays = (() => {
    const year = calendarMonth.getUTCFullYear();
    const month = calendarMonth.getUTCMonth();
    const offset = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
    const count = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const cells = Math.ceil((offset + count) / 7) * 7;
    return Array.from({ length: cells }, (_, index) => {
      const day = index - offset + 1;
      return day > 0 && day <= count ? day : null;
    });
  })();
  const editing = editingId !== null;

  const resetForm = () => {
    setDraft(emptyDraft());
    setEditingId(null);
    setError("");
  };
  const updateDraft = (field, value) => {
    setDraft((previous) => ({ ...previous, [field]: value }));
    if (field === "date") setCalendarDate(value);
    setError("");
    setNotice("");
  };
  const editEntry = (entry) => {
    setDraft({ date: entry.date, startTime: entry.startTime ?? "", endTime: entry.endTime ?? "", text: entry.text });
    setEditingId(entry.id);
    setError("");
    setNotice("");
    setCalendarDate(entry.date);
    const [year, month] = entry.date.split("-").map(Number);
    setCalendarMonth(new Date(Date.UTC(year, month - 1, 1)));
    dateInput.current?.focus();
  };
  const saveEntry = (event) => {
    event.preventDefault();
    const record = { ...draft, id: editingId ?? crypto.randomUUID(), applicationId: selectedPractice.id, text: draft.text.trim() };
    const validationError = validateEntry(record, entries);
    if (validationError) {
      setError(validationError);
      return;
    }
    setEntries((previous) => {
      if (validateEntry(record, previous)) return previous;
      return editing
        ? previous.map((entry) => entry.id === editingId && String(entry.applicationId) === String(selectedPractice.id) ? { ...entry, ...record } : entry)
        : [record, ...previous];
    });
    setCalendarDate(record.date);
    const [year, month] = record.date.split("-").map(Number);
    setCalendarMonth(new Date(Date.UTC(year, month - 1, 1)));
    resetForm();
    setNotice(editing ? "Entrada actualizada." : "Entrada guardada.");
  };
  const deleteEntry = (entry) => {
    setEntries((previous) => previous.filter((existing) => !(existing.id === entry.id && String(existing.applicationId) === String(selectedPractice.id))));
    if (editingId === entry.id) resetForm();
    setPendingDelete(null);
    setError("");
    setNotice("Entrada eliminada.");
  };

  return (
    <section className="logbook-layout">
      <div className="logbook-main">
        <div className="logbook-practice-card"><CompanyMark {...selectedPractice} size="large" /><div><strong>{selectedPractice.title}</strong><span>{selectedPractice.company} · {selectedPractice.location}</span></div><span className="application-status"><span className="status-dot" />Inscripción registrada</span></div>
        {items.length > 1 && <label className="logbook-select">Práctica<select value={selectedPractice.id} onChange={(event) => onSelect(event.target.value)}>{items.map((item) => <option key={item.id} value={item.id}>{item.company} · {item.title}</option>)}</select></label>}
        <form className="logbook-form" onSubmit={saveEntry}>
          <div className="section-title-row"><div><h2>{editing ? "Editar entrada" : "Nueva entrada"}</h2><p>Una entrada diaria por práctica. Puedes actualizarla cuando lo necesites.</p></div></div>
          <label>Fecha<input ref={dateInput} type="date" value={draft.date} max={localDate()} onChange={(event) => updateDraft("date", event.target.value)} required /></label>
          <div className="logbook-time-fields">
            <label>Hora de inicio<input type="time" value={draft.startTime} step="60" aria-describedby="logbook-time-help" onChange={(event) => updateDraft("startTime", event.target.value)} required /></label>
            <label>Hora de fin<input type="time" value={draft.endTime} step="60" aria-describedby="logbook-time-help" onChange={(event) => updateDraft("endTime", event.target.value)} required /></label>
          </div>
          <p className="logbook-hint" id="logbook-time-help">Mínimo {MIN_WORK_MINUTES} minutos de trabajo. El inicio y el fin deben corresponder al mismo día.</p>
          {duration > 0 && <p className="logbook-duration" role="status">Tiempo trabajado: <strong>{formatDuration(duration)}</strong></p>}
          <div className="logbook-activity-field">
            <label htmlFor="logbook-activity">Actividad y aprendizaje</label>
            <textarea id="logbook-activity" rows="5" value={draft.text} onChange={(event) => updateDraft("text", event.target.value)} placeholder="¿Qué hiciste hoy? ¿Qué aprendiste?" required />
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="logbook-actions">
            <button className="primary-button" type="submit">{editing ? "Guardar cambios" : "Guardar entrada"} <Icon name="check" size={16} /></button>
            {editing && <button className="outline-button" type="button" onClick={() => { resetForm(); setNotice(""); }}>Cancelar edición</button>}
          </div>
          {notice && <p className="logbook-notice" role="status">{notice}</p>}
        </form>
      </div>
      <aside className="logbook-history logbook-calendar-panel">
        <div className="section-title-row"><div><h2>Entradas <span className="count-pill">{visibleEntries.length}</span></h2><p>Selecciona un día para editar su actividad.</p></div></div>
        <div className="logbook-total-hours"><span>Horas acumuladas</span><strong>{Math.round(totalWorkedMinutes / 60)} h <small>aprox.</small></strong></div>
        <div className="logbook-calendar">
          <div className="calendar-heading"><button className="outline-button" type="button" aria-label="Mes anterior" onClick={() => setCalendarMonth((month) => new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() - 1, 1)))}>‹</button><strong>{calendarMonth.toLocaleDateString("es-CL", { month: "long", year: "numeric", timeZone: "UTC" })}</strong><button className="outline-button" type="button" aria-label="Mes siguiente" onClick={() => setCalendarMonth((month) => new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 1)))}>›</button></div>
          <div className="calendar-grid calendar-weekdays" aria-hidden="true">{"Lun Mar Mié Jue Vie Sáb Dom".split(" ").map((day) => <span key={day}>{day}</span>)}</div>
          <div className="calendar-grid">{calendarDays.map((day, index) => {
            if (!day) return <span className="calendar-day calendar-day-empty" key={`empty-${index}`} />;
            const date = `${calendarMonth.getUTCFullYear()}-${String(calendarMonth.getUTCMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const entry = visibleEntries.find((item) => item.date === date);
            return <button key={date} className={`calendar-day${date === calendarDate ? " is-selected" : ""}${entry ? " has-entry" : ""}`} type="button" aria-label={`${date}${entry ? ", actividad registrada" : ""}`} aria-pressed={date === calendarDate} onClick={() => {
              setCalendarDate(date);
              setNotice("");
              if (entry) editEntry(entry);
              else { setDraft(emptyDraftForDate(date)); setEditingId(null); setError(""); }
            }}><span>{day}</span>{entry && <i aria-hidden="true" />}</button>;
          })}</div>
        </div>
        {visibleEntries.length === 0 && <div className="logbook-empty"><strong>Tu bitácora está vacía</strong><p>Guarda una entrada para verla en el calendario.</p></div>}
        {visibleEntries.filter((entry) => entry.date === calendarDate).map((entry) => <article className="calendar-entry" key={entry.id}><div className="log-entry-date"><Icon name="clock" size={14} /><time dateTime={entry.date}>{entry.date}</time></div><p className="log-entry-hours">{workMinutes(entry.startTime, entry.endTime) > 0 ? `${entry.startTime} – ${entry.endTime} · ${formatDuration(workMinutes(entry.startTime, entry.endTime))}` : "Horario pendiente de completar"}</p><p>{entry.text}</p><div className="logbook-actions"><button className="outline-button" type="button" onClick={() => editEntry(entry)}><Icon name="edit" size={14} />Editar</button><button className="outline-button logbook-delete" type="button" onClick={() => setPendingDelete(entry)}>Eliminar</button></div></article>)}
      </aside>
      {pendingDelete && <div className="logbook-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setPendingDelete(null); }}>
        <section className="logbook-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="logbook-confirm-title" aria-describedby="logbook-confirm-description">
          <h2 id="logbook-confirm-title">¿Eliminar esta entrada?</h2>
          <p id="logbook-confirm-description">Se eliminará el registro del {pendingDelete.date}. Esta acción no se puede deshacer.</p>
          <div className="logbook-actions"><button className="outline-button" type="button" onClick={() => setPendingDelete(null)}>Cancelar</button><button className="primary-button logbook-confirm-delete" type="button" onClick={() => deleteEntry(pendingDelete)}>Eliminar entrada</button></div>
        </section>
      </div>}
    </section>
  );
}

function LogbookPage({ applications: items, selectedId: preferredId, entries, setEntries, onInscription }) {
  const [selectedId, setSelectedId] = useState(preferredId ?? items[0]?.id ?? "");
  useEffect(() => {
    if (preferredId != null) setSelectedId(preferredId);
  }, [preferredId]);
  const selectedPractice = items.find((item) => String(item.id) === String(selectedId)) || items[0];
  return (
    <>
      <section className="welcome-row compact-welcome"><div><div className="eyebrow">REGISTRO DE ACTIVIDADES</div><h1>Bitácora de práctica</h1><p>Deja constancia de tus avances, aprendizajes y tareas realizadas.</p></div></section>
      {selectedPractice
        ? <PracticeLogbook key={selectedPractice.id} selectedPractice={selectedPractice} items={items} onSelect={setSelectedId} entries={entries} setEntries={setEntries} />
        : <EmptyState title="Tu bitácora aparecerá al inscribirte" description="Registra una práctica desde Inscripciones para comenzar a guardar actividades." action="Inscribir una práctica" onAction={onInscription} />}
    </>
  );
}

export default LogbookPage;

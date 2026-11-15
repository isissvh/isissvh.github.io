export const MIN_WORK_MINUTES = 30;

export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function workMinutes(startTime, endTime) {
  const toMinutes = (time) => {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time ?? "")) return NaN;
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };
  return toMinutes(endTime) - toMinutes(startTime);
}

export function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return [hours && `${hours} h`, remainder && `${remainder} min`].filter(Boolean).join(" ");
}

export function validateEntry(entry, entries) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date) || !Number.isFinite(Date.parse(`${entry.date}T12:00:00Z`)) || new Date(`${entry.date}T12:00:00Z`).toISOString().slice(0, 10) !== entry.date) {
    return "Selecciona una fecha válida.";
  }
  if (entry.date > localDate()) return "La fecha no puede ser posterior a hoy.";
  if (entries.some((existing) => String(existing.applicationId) === String(entry.applicationId) && existing.date === entry.date && existing.id !== entry.id)) {
    return "Ya existe una actividad en esa fecha. Selecciónala en el calendario para editarla.";
  }
  const duration = workMinutes(entry.startTime, entry.endTime);
  if (!Number.isFinite(duration)) return "Ingresa la hora de inicio y la hora de fin.";
  if (duration <= 0) return "La hora de fin debe ser posterior a la de inicio, dentro del mismo día.";
  if (duration < MIN_WORK_MINUTES) return `Debes registrar al menos ${MIN_WORK_MINUTES} minutos de trabajo.`;
  if (!entry.text.trim()) return "Describe la actividad realizada.";
  return "";
}

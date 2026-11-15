import test from "node:test";
import assert from "node:assert/strict";
import { localDate, workMinutes, formatDuration, validateEntry } from "./logbook.js";

const record = { id: "new", applicationId: "practice-a", date: "2025-01-02", startTime: "09:00", endTime: "09:30", text: "Desarrollo y pruebas" };

test("acepta el mínimo y calcula horas y minutos sin redondear", () => {
  assert.equal(validateEntry(record, []), "");
  assert.equal(workMinutes("08:45", "17:10"), 505);
  assert.equal(formatDuration(505), "8 h 25 min");
  assert.equal(formatDuration(30), "30 min");
  assert.equal(formatDuration(60), "1 h");
});

test("rechaza jornadas menores al mínimo, nulas, invertidas o de otro día", () => {
  for (const endTime of ["09:29", "09:00", "08:59", "00:30"]) {
    assert.notEqual(validateEntry({ ...record, endTime }, []), "");
  }
});

test("exige ambos horarios válidos y una descripción con contenido", () => {
  for (const startTime of [undefined, "", "25:00", "09:60"]) {
    assert.notEqual(validateEntry({ ...record, startTime }, []), "");
  }
  assert.notEqual(validateEntry({ ...record, endTime: "" }, []), "");
  assert.notEqual(validateEntry({ ...record, text: "  \n " }, []), "");
});

test("rechaza fechas vacías, inexistentes y futuras", () => {
  for (const date of ["", "2025-02-30", "2025-13-02", "2099-01-01"]) {
    assert.notEqual(validateEntry({ ...record, date }, []), "");
  }
});

test("impide una segunda entrada por fecha y práctica, incluso con datos antiguos", () => {
  const legacy = { id: 123, applicationId: "practice-a", date: record.date, text: "Entrada antigua" };
  assert.match(validateEntry(record, [legacy]), /Ya existe/);
  assert.equal(validateEntry({ ...record, applicationId: "practice-b" }, [legacy]), "");
  assert.equal(validateEntry({ ...record, date: "2025-01-03" }, [legacy]), "");
  assert.match(validateEntry({ ...record, applicationId: 1 }, [{ ...legacy, applicationId: "1" }]), /Ya existe/);
});

test("permite editar el mismo registro pero impide moverlo a una fecha ocupada", () => {
  const other = { ...record, id: "other", date: "2025-01-03" };
  assert.equal(validateEntry({ ...record, endTime: "17:00" }, [record, other]), "");
  assert.match(validateEntry({ ...record, date: other.date }, [record, other]), /Ya existe/);
});

test("usa la fecha local en lugar de la fecha UTC", () => {
  const previousTimezone = process.env.TZ;
  try {
    process.env.TZ = "America/Santiago";
    assert.equal(localDate(new Date("2025-01-02T01:00:00Z")), "2025-01-01");
  } finally {
    if (previousTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = previousTimezone;
  }
});

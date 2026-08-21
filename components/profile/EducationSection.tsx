"use client";

import { useState, type FormEvent } from "react";
import { EducationForm, type EducationFormState } from "./EducationForm";
import { secondaryButtonClass, toMonthInput, fromMonthInput, type Education } from "./types";

const emptyForm: EducationFormState = {
  institution: "",
  degree: "",
  fieldOfStudy: "",
  startDate: "",
  endDate: "",
  description: "",
};

export function EducationSection({
  apiBase,
  education,
  setEducation,
  setError,
}: {
  apiBase: string;
  education: Education[];
  setEducation: (value: Education[]) => void;
  setError: (value: string | null) => void;
}) {
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<EducationFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  function startAdd() {
    setForm(emptyForm);
    setEditingId("new");
  }

  function startEdit(edu: Education) {
    setForm({
      institution: edu.institution,
      degree: edu.degree ?? "",
      fieldOfStudy: edu.fieldOfStudy ?? "",
      startDate: toMonthInput(edu.startDate),
      endDate: toMonthInput(edu.endDate),
      description: edu.description ?? "",
    });
    setEditingId(edu.id);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const body = {
      institution: form.institution,
      degree: form.degree,
      fieldOfStudy: form.fieldOfStudy,
      startDate: fromMonthInput(form.startDate),
      endDate: fromMonthInput(form.endDate),
      description: form.description,
    };

    const isNew = editingId === "new";
    const res = await fetch(isNew ? `${apiBase}/education` : `${apiBase}/education/${editingId}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to save education.");
      return;
    }

    const data = await res.json();
    if (isNew) {
      setEducation([data.education, ...education]);
    } else {
      setEducation(education.map((e) => (e.id === editingId ? data.education : e)));
    }
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    setError(null);
    const res = await fetch(`${apiBase}/education/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to delete education.");
      return;
    }
    setEducation(education.filter((e) => e.id !== id));
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Education</h2>
        {editingId === null && (
          <button onClick={startAdd} className={secondaryButtonClass}>
            Add education
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {education.map((edu) =>
          editingId === edu.id ? (
            <EducationForm key={edu.id} form={form} setForm={setForm} onSubmit={handleSubmit} onCancel={() => setEditingId(null)} saving={saving} />
          ) : (
            <div key={edu.id} className="rounded-lg border border-border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">
                    {edu.institution}
                    {edu.degree ? ` · ${edu.degree}` : ""}
                    {edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ""}
                  </p>
                  <p className="text-xs text-muted">
                    {toMonthInput(edu.startDate) || "—"} – {toMonthInput(edu.endDate) || "—"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(edu)} className={secondaryButtonClass}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(edu.id)} className={secondaryButtonClass}>
                    Delete
                  </button>
                </div>
              </div>
              {edu.description && <p className="mt-2 text-sm text-muted">{edu.description}</p>}
            </div>
          ),
        )}

        {editingId === "new" && (
          <EducationForm form={form} setForm={setForm} onSubmit={handleSubmit} onCancel={() => setEditingId(null)} saving={saving} />
        )}

        {education.length === 0 && editingId === null && (
          <p className="text-sm text-muted">No education added yet.</p>
        )}
      </div>
    </section>
  );
}

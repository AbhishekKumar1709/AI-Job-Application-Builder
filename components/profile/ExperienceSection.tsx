"use client";

import { useState, type FormEvent } from "react";
import { ExperienceForm, type ExperienceFormState } from "./ExperienceForm";
import { secondaryButtonClass, toMonthInput, fromMonthInput, avatarColor, type Experience } from "./types";

const emptyForm: ExperienceFormState = {
  company: "",
  title: "",
  location: "",
  startDate: "",
  endDate: "",
  current: false,
  description: "",
};

export function ExperienceSection({
  apiBase,
  experiences,
  setExperiences,
  setError,
}: {
  apiBase: string;
  experiences: Experience[];
  setExperiences: (value: Experience[]) => void;
  setError: (value: string | null) => void;
}) {
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<ExperienceFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  function startAdd() {
    setForm(emptyForm);
    setEditingId("new");
  }

  function startEdit(exp: Experience) {
    setForm({
      company: exp.company,
      title: exp.title,
      location: exp.location ?? "",
      startDate: toMonthInput(exp.startDate),
      endDate: toMonthInput(exp.endDate),
      current: exp.current,
      description: exp.description ?? "",
    });
    setEditingId(exp.id);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const body = {
      company: form.company,
      title: form.title,
      location: form.location,
      startDate: fromMonthInput(form.startDate),
      endDate: form.current ? null : fromMonthInput(form.endDate),
      current: form.current,
      description: form.description,
    };

    const isNew = editingId === "new";
    const res = await fetch(isNew ? `${apiBase}/experience` : `${apiBase}/experience/${editingId}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to save experience.");
      return;
    }

    const data = await res.json();
    if (isNew) {
      setExperiences([...experiences, data.experience]);
    } else {
      setExperiences(experiences.map((e) => (e.id === editingId ? data.experience : e)));
    }
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    setError(null);
    const res = await fetch(`${apiBase}/experience/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to delete experience.");
      return;
    }
    setExperiences(experiences.filter((e) => e.id !== id));
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const otherIndex = index + direction;
    if (otherIndex < 0 || otherIndex >= experiences.length) return;

    const current = experiences[index];
    const other = experiences[otherIndex];
    setError(null);

    const [resA, resB] = await Promise.all([
      fetch(`${apiBase}/experience/${current.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: other.sortOrder }),
      }),
      fetch(`${apiBase}/experience/${other.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: current.sortOrder }),
      }),
    ]);

    if (!resA.ok || !resB.ok) {
      setError("Failed to reorder experience.");
      return;
    }

    const reordered = [...experiences];
    reordered[index] = { ...other, sortOrder: current.sortOrder };
    reordered[otherIndex] = { ...current, sortOrder: other.sortOrder };
    setExperiences(reordered);
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Experience</h2>
        {editingId === null && (
          <button onClick={startAdd} className={secondaryButtonClass}>
            Add experience
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {experiences.map((exp, index) =>
          editingId === exp.id ? (
            <ExperienceForm key={exp.id} form={form} setForm={setForm} onSubmit={handleSubmit} onCancel={() => setEditingId(null)} saving={saving} />
          ) : (
            <div
              key={exp.id}
              className="flex gap-4 rounded-xl border border-border bg-background p-4 transition-colors hover:border-accent/50"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${avatarColor(index).bg} ${avatarColor(index).text}`}
                aria-hidden="true"
              >
                {exp.company.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      {exp.title} · {exp.company}
                    </p>
                    <p className="text-xs text-muted">
                      {exp.location ? `${exp.location} · ` : ""}
                      {toMonthInput(exp.startDate)} – {exp.current ? "Present" : toMonthInput(exp.endDate) || "—"}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => handleMove(index, -1)}
                      disabled={index === 0}
                      aria-label="Move up"
                      className={secondaryButtonClass}
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleMove(index, 1)}
                      disabled={index === experiences.length - 1}
                      aria-label="Move down"
                      className={secondaryButtonClass}
                    >
                      ↓
                    </button>
                    <button onClick={() => startEdit(exp)} className={secondaryButtonClass}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(exp.id)} className={secondaryButtonClass}>
                      Delete
                    </button>
                  </div>
                </div>
                {exp.description && <p className="mt-2 text-sm text-muted">{exp.description}</p>}
              </div>
            </div>
          ),
        )}

        {editingId === "new" && (
          <ExperienceForm form={form} setForm={setForm} onSubmit={handleSubmit} onCancel={() => setEditingId(null)} saving={saving} />
        )}

        {experiences.length === 0 && editingId === null && (
          <p className="text-sm text-muted">No experience added yet.</p>
        )}
      </div>
    </section>
  );
}

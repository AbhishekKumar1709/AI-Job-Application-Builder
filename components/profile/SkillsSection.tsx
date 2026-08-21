"use client";

import { useState, type FormEvent } from "react";
import { buttonClass, inputClass, type Skill } from "./types";

export function SkillsSection({
  apiBase,
  skills,
  setSkills,
  setError,
}: {
  apiBase: string;
  skills: Skill[];
  setSkills: (value: Skill[]) => void;
  setError: (value: string | null) => void;
}) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);

    const res = await fetch(`${apiBase}/skills`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to add skill.");
      return;
    }

    const data = await res.json();
    setSkills([...skills, data.skill].sort((a, b) => a.name.localeCompare(b.name)));
    setName("");
  }

  async function handleDelete(id: string) {
    setError(null);
    const res = await fetch(`${apiBase}/skills/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to delete skill.");
      return;
    }
    setSkills(skills.filter((s) => s.id !== id));
  }

  return (
    <section>
      <h2 className="text-lg font-semibold">Skills</h2>
      <form onSubmit={handleAdd} className="mt-4 flex gap-2">
        <input
          type="text"
          placeholder="e.g. TypeScript"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`${inputClass} flex-1`}
        />
        <button type="submit" disabled={saving} className={buttonClass}>
          Add
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill.id}
            className="flex items-center gap-2 rounded-full border border-border px-3 py-1 text-sm"
          >
            {skill.name}
            <button
              onClick={() => handleDelete(skill.id)}
              aria-label={`Remove ${skill.name}`}
              className="text-muted hover:text-red-500"
            >
              ×
            </button>
          </span>
        ))}
        {skills.length === 0 && <p className="text-sm text-muted">No skills added yet.</p>}
      </div>
    </section>
  );
}

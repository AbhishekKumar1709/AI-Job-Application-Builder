"use client";

import type { FormEvent } from "react";
import { buttonClass, inputClass, secondaryButtonClass } from "./types";

export type EducationFormState = {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  description: string;
};

export function EducationForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  saving,
}: {
  form: EducationFormState;
  setForm: (value: EducationFormState) => void;
  onSubmit: (event: FormEvent) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4">
      <input
        type="text"
        required
        placeholder="Institution"
        value={form.institution}
        onChange={(e) => setForm({ ...form, institution: e.target.value })}
        className={inputClass}
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Degree (optional)"
          value={form.degree}
          onChange={(e) => setForm({ ...form, degree: e.target.value })}
          className={inputClass}
        />
        <input
          type="text"
          placeholder="Field of study (optional)"
          value={form.fieldOfStudy}
          onChange={(e) => setForm({ ...form, fieldOfStudy: e.target.value })}
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs text-muted">
          Start date
          <input
            type="month"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          End date
          <input
            type="month"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            className={inputClass}
          />
        </label>
      </div>
      <textarea
        rows={3}
        placeholder="Description (optional)"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        className={inputClass}
      />
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className={buttonClass}>
          {saving ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={onCancel} className={secondaryButtonClass}>
          Cancel
        </button>
      </div>
    </form>
  );
}

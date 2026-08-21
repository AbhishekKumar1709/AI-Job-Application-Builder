"use client";

import type { FormEvent } from "react";
import { buttonClass, inputClass, secondaryButtonClass } from "./types";

export type ExperienceFormState = {
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
};

export function ExperienceForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  saving,
}: {
  form: ExperienceFormState;
  setForm: (value: ExperienceFormState) => void;
  onSubmit: (event: FormEvent) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          required
          placeholder="Job title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className={inputClass}
        />
        <input
          type="text"
          required
          placeholder="Company"
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
          className={inputClass}
        />
      </div>
      <input
        type="text"
        placeholder="Location (optional)"
        value={form.location}
        onChange={(e) => setForm({ ...form, location: e.target.value })}
        className={inputClass}
      />
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs text-muted">
          Start date
          <input
            type="month"
            required
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          End date
          <input
            type="month"
            disabled={form.current}
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            className={inputClass}
          />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.current}
          onChange={(e) => setForm({ ...form, current: e.target.checked, endDate: e.target.checked ? "" : form.endDate })}
        />
        I currently work here
      </label>
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

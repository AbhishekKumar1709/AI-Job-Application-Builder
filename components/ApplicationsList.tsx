"use client";

import { useEffect, useState, type FormEvent } from "react";
import { buttonClass, inputClass, secondaryButtonClass } from "./profile/types";

const STATUSES = ["SAVED", "APPLIED", "INTERVIEWING", "OFFER", "REJECTED", "WITHDRAWN"] as const;
type Status = (typeof STATUSES)[number];

const STATUS_LABEL: Record<Status, string> = {
  SAVED: "Saved",
  APPLIED: "Applied",
  INTERVIEWING: "Interviewing",
  OFFER: "Offer",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

type ResumeOption = { id: string; title: string };

type Application = {
  id: string;
  company: string;
  role: string;
  status: Status;
  jobUrl: string | null;
  notes: string | null;
  appliedAt: string | null;
  resumeId: string | null;
  resume: ResumeOption | null;
};

type FormState = {
  company: string;
  role: string;
  status: Status;
  jobUrl: string;
  notes: string;
  appliedAt: string;
  resumeId: string;
};

const emptyForm: FormState = {
  company: "",
  role: "",
  status: "APPLIED",
  jobUrl: "",
  notes: "",
  appliedAt: "",
  resumeId: "",
};

function toDateInput(value: string | null): string {
  return value ? value.slice(0, 10) : "";
}

export function ApplicationsList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [resumeOptions, setResumeOptions] = useState<ResumeOption[]>([]);

  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/applications").then((res) => res.json()),
      fetch("/api/resumes").then((res) => res.json()),
    ])
      .then(([appsData, resumesData]) => {
        setApplications(appsData.applications ?? []);
        setResumeOptions(resumesData.resumes ?? []);
      })
      .catch(() => setError("Failed to load applications."))
      .finally(() => setLoading(false));
  }, []);

  function startAdd() {
    setForm(emptyForm);
    setEditingId("new");
  }

  function startEdit(app: Application) {
    setForm({
      company: app.company,
      role: app.role,
      status: app.status,
      jobUrl: app.jobUrl ?? "",
      notes: app.notes ?? "",
      appliedAt: toDateInput(app.appliedAt),
      resumeId: app.resumeId ?? "",
    });
    setEditingId(app.id);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const body = {
      company: form.company,
      role: form.role,
      status: form.status,
      jobUrl: form.jobUrl,
      notes: form.notes,
      appliedAt: form.appliedAt || null,
      resumeId: form.resumeId || null,
    };

    const isNew = editingId === "new";
    const res = await fetch(isNew ? "/api/applications" : `/api/applications/${editingId}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to save application.");
      return;
    }

    const data = await res.json();
    if (isNew) {
      setApplications([data.application, ...applications]);
    } else {
      setApplications(applications.map((a) => (a.id === editingId ? data.application : a)));
    }
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    setError(null);
    const res = await fetch(`/api/applications/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to delete application.");
      return;
    }
    setApplications(applications.filter((a) => a.id !== id));
  }

  if (loading) {
    return <p className="mt-8 text-sm text-muted">Loading…</p>;
  }

  return (
    <div className="mt-8 flex flex-col gap-6">
      {error && <p className="text-sm text-red-500">{error}</p>}

      {editingId === null && (
        <button onClick={startAdd} className={`${buttonClass} self-start`}>
          Add application
        </button>
      )}

      {editingId && (
        <ApplicationForm
          form={form}
          setForm={setForm}
          resumeOptions={resumeOptions}
          onSubmit={handleSubmit}
          onCancel={() => setEditingId(null)}
          saving={saving}
        />
      )}

      <div className="flex flex-col gap-3">
        {applications.map((app) => (
          <div key={app.id} className="rounded-lg border border-border p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">
                  {app.role} · {app.company}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {STATUS_LABEL[app.status]}
                  {app.appliedAt ? ` · Applied ${toDateInput(app.appliedAt)}` : ""}
                  {app.resume ? ` · Resume: ${app.resume.title}` : ""}
                </p>
                {app.jobUrl && (
                  <a href={app.jobUrl} target="_blank" rel="noreferrer" className="mt-1 block text-xs text-accent hover:underline">
                    Job posting →
                  </a>
                )}
                {app.notes && <p className="mt-2 text-sm text-muted">{app.notes}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(app)} className={secondaryButtonClass}>
                  Edit
                </button>
                <button onClick={() => handleDelete(app.id)} className={secondaryButtonClass}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {applications.length === 0 && editingId === null && (
          <p className="text-sm text-muted">No applications tracked yet.</p>
        )}
      </div>
    </div>
  );
}

function ApplicationForm({
  form,
  setForm,
  resumeOptions,
  onSubmit,
  onCancel,
  saving,
}: {
  form: FormState;
  setForm: (value: FormState) => void;
  resumeOptions: ResumeOption[];
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
          placeholder="Company"
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
          className={inputClass}
        />
        <input
          type="text"
          required
          placeholder="Role"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs text-muted">
          Status
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as Status })}
            className={inputClass}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          Applied date
          <input
            type="date"
            value={form.appliedAt}
            onChange={(e) => setForm({ ...form, appliedAt: e.target.value })}
            className={inputClass}
          />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-xs text-muted">
        Resume used
        <select
          value={form.resumeId}
          onChange={(e) => setForm({ ...form, resumeId: e.target.value })}
          className={inputClass}
        >
          <option value="">None</option>
          {resumeOptions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.title}
            </option>
          ))}
        </select>
      </label>
      <input
        type="url"
        placeholder="Job posting URL (optional)"
        value={form.jobUrl}
        onChange={(e) => setForm({ ...form, jobUrl: e.target.value })}
        className={inputClass}
      />
      <textarea
        rows={3}
        placeholder="Notes (optional)"
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
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

"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { buttonClass, inputClass, secondaryButtonClass } from "./profile/types";

type ResumeSummary = { id: string; title: string; createdAt: string; updatedAt: string };

export function ResumeList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resumes, setResumes] = useState<ResumeSummary[]>([]);
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/resumes")
      .then((res) => res.json())
      .then((data) => setResumes(data.resumes ?? []))
      .catch(() => setError("Failed to load resumes."))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    setError(null);

    const res = await fetch("/api/resumes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim() }),
    });

    setCreating(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to create resume.");
      return;
    }

    const data = await res.json();
    setResumes([{ id: data.resume.id, title: data.resume.title, createdAt: data.resume.createdAt, updatedAt: data.resume.updatedAt }, ...resumes]);
    setTitle("");
  }

  async function handleDelete(id: string) {
    setError(null);
    const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to delete resume.");
      return;
    }
    setResumes(resumes.filter((r) => r.id !== id));
  }

  if (loading) {
    return <p className="mt-8 text-sm text-muted">Loading…</p>;
  }

  const filtered = resumes.filter((r) => r.title.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <div className="mt-8 flex flex-col gap-6">
      {error && <p className="text-sm text-red-500">{error}</p>}

      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          type="text"
          placeholder="New resume title, e.g. Backend Engineer — Acme"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`${inputClass} flex-1`}
        />
        <button type="submit" disabled={creating} className={buttonClass}>
          {creating ? "Creating…" : "Create resume"}
        </button>
      </form>

      {resumes.length > 0 && (
        <input
          type="text"
          placeholder="Search resumes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={inputClass}
        />
      )}

      <div className="flex flex-col gap-3">
        {filtered.map((resume) => (
          <div key={resume.id} className="flex items-center justify-between rounded-lg border border-border p-4">
            <Link href={`/resumes/${resume.id}`} className="font-medium text-accent hover:underline">
              {resume.title}
            </Link>
            <button onClick={() => handleDelete(resume.id)} className={secondaryButtonClass}>
              Delete
            </button>
          </div>
        ))}
        {resumes.length === 0 && <p className="text-sm text-muted">No resumes yet.</p>}
        {resumes.length > 0 && filtered.length === 0 && (
          <p className="text-sm text-muted">No resumes match &quot;{search}&quot;.</p>
        )}
      </div>
    </div>
  );
}

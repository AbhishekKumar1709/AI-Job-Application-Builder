"use client";

import { useEffect, useState, type FormEvent } from "react";
import { buttonClass, inputClass, secondaryButtonClass } from "./profile/types";

type Suggestion = { section: string; issue: string; suggestion: string };
type AtsResult = { score: number; issues: string[]; strengths: string[] };
type MatchResult = { matchScore: number; matchedKeywords: string[]; missingKeywords: string[]; suggestions: string[] };
type CoverLetter = { id: string; companyName: string | null; jobDescription: string; content: string; createdAt: string };

export function ResumeAITools({ resumeId }: { resumeId: string }) {
  const apiBase = `/api/resumes/${resumeId}`;

  return (
    <div className="mt-16 flex flex-col gap-12 border-t border-border pt-10">
      <h2 className="text-xl font-semibold">AI tools</h2>
      <OptimizeSection apiBase={apiBase} />
      <AtsSection apiBase={apiBase} />
      <MatchAndCoverLetterSection apiBase={apiBase} />
    </div>
  );
}

function OptimizeSection({ apiBase }: { apiBase: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    const res = await fetch(`${apiBase}/optimize`, { method: "POST" });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to get suggestions.");
      return;
    }
    const data = await res.json();
    setSuggestions(data.suggestions);
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Optimization suggestions</h3>
        <button onClick={run} disabled={loading} className={buttonClass}>
          {loading ? "Analyzing…" : "Get suggestions"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      {suggestions && (
        <div className="mt-4 flex flex-col gap-3">
          {suggestions.length === 0 && <p className="text-sm text-muted">No suggestions — looks solid.</p>}
          {suggestions.map((s, i) => (
            <div key={i} className="rounded-lg border border-border p-3 text-sm">
              <p className="font-medium">{s.section}</p>
              <p className="mt-1 text-muted">{s.issue}</p>
              <p className="mt-1">{s.suggestion}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function AtsSection({ apiBase }: { apiBase: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AtsResult | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    const res = await fetch(`${apiBase}/ats-check`, { method: "POST" });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to run ATS check.");
      return;
    }
    const data = await res.json();
    setResult(data.result);
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">ATS compatibility</h3>
        <button onClick={run} disabled={loading} className={buttonClass}>
          {loading ? "Checking…" : "Check ATS compatibility"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      {result && (
        <div className="mt-4 rounded-lg border border-border p-4">
          <p className="text-2xl font-semibold">{result.score}/100</p>
          {result.strengths.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium">Strengths</p>
              <ul className="mt-1 list-disc pl-5 text-sm text-muted">
                {result.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
          {result.issues.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium">Issues</p>
              <ul className="mt-1 list-disc pl-5 text-sm text-muted">
                {result.issues.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function MatchAndCoverLetterSection({ apiBase }: { apiBase: string }) {
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");

  const [matching, setMatching] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

  const [generating, setGenerating] = useState(false);
  const [letterError, setLetterError] = useState<string | null>(null);
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);

  useEffect(() => {
    fetch(`${apiBase}/cover-letters`)
      .then((res) => res.json())
      .then((data) => setCoverLetters(data.coverLetters ?? []))
      .catch(() => {});
  }, [apiBase]);

  async function handleMatch(event: FormEvent) {
    event.preventDefault();
    if (!jobDescription.trim()) return;
    setMatching(true);
    setMatchError(null);
    const res = await fetch(`${apiBase}/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobDescription }),
    });
    setMatching(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMatchError(data.error ?? "Failed to match against job description.");
      return;
    }
    const data = await res.json();
    setMatchResult(data.result);
  }

  async function handleGenerate() {
    if (!jobDescription.trim()) return;
    setGenerating(true);
    setLetterError(null);
    const res = await fetch(`${apiBase}/cover-letters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobDescription, companyName: companyName || undefined }),
    });
    setGenerating(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setLetterError(data.error ?? "Failed to generate cover letter.");
      return;
    }
    const data = await res.json();
    setCoverLetters([data.coverLetter, ...coverLetters]);
  }

  async function handleDeleteLetter(letterId: string) {
    const res = await fetch(`${apiBase}/cover-letters/${letterId}`, { method: "DELETE" });
    if (res.ok) {
      setCoverLetters(coverLetters.filter((l) => l.id !== letterId));
    }
  }

  return (
    <section>
      <h3 className="text-lg font-semibold">Job match &amp; cover letter</h3>
      <form onSubmit={handleMatch} className="mt-4 flex flex-col gap-3">
        <input
          type="text"
          placeholder="Company name (optional, used for the cover letter)"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className={inputClass}
        />
        <textarea
          rows={6}
          required
          placeholder="Paste the job description here"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className={inputClass}
        />
        <div className="flex gap-2">
          <button type="submit" disabled={matching} className={buttonClass}>
            {matching ? "Matching…" : "Check match"}
          </button>
          <button type="button" onClick={handleGenerate} disabled={generating} className={secondaryButtonClass}>
            {generating ? "Writing…" : "Generate cover letter"}
          </button>
        </div>
      </form>

      {matchError && <p className="mt-2 text-sm text-red-500">{matchError}</p>}
      {letterError && <p className="mt-2 text-sm text-red-500">{letterError}</p>}

      {matchResult && (
        <div className="mt-4 rounded-lg border border-border p-4">
          <p className="text-2xl font-semibold">{matchResult.matchScore}/100 match</p>
          {matchResult.matchedKeywords.length > 0 && (
            <p className="mt-2 text-sm">
              <span className="font-medium">Matched: </span>
              {matchResult.matchedKeywords.join(", ")}
            </p>
          )}
          {matchResult.missingKeywords.length > 0 && (
            <p className="mt-2 text-sm">
              <span className="font-medium">Missing: </span>
              {matchResult.missingKeywords.join(", ")}
            </p>
          )}
          {matchResult.suggestions.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-sm text-muted">
              {matchResult.suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {coverLetters.length > 0 && (
        <div className="mt-6 flex flex-col gap-4">
          <p className="text-sm font-medium">Generated cover letters</p>
          {coverLetters.map((letter) => (
            <div key={letter.id} className="rounded-lg border border-border p-4">
              <div className="flex items-start justify-between">
                <p className="text-sm text-muted">
                  {letter.companyName ? `${letter.companyName} · ` : ""}
                  {new Date(letter.createdAt).toLocaleString()}
                </p>
                <button onClick={() => handleDeleteLetter(letter.id)} className={secondaryButtonClass}>
                  Delete
                </button>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm">{letter.content}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

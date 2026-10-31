"use client";

import { FormEvent, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { safeExternalUrl } from "@/lib/url";

type Result = { id: string; title: string; detail: string; href: string };

export function DiscoverySearch() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [results, setResults] = useState<Result[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function search(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const qs = new URLSearchParams();
      if (query.trim()) qs.set("q", query.trim());
      if (city) qs.set("city", city);
      const [companiesRes, jobsRes] = await Promise.all([
        fetch(`/api/companies?${qs}`),
        fetch(`/api/jobs?${qs}`),
      ]);
      if (!companiesRes.ok || !jobsRes.ok) throw new Error("The directory is temporarily unavailable. Please try again shortly.");
      const [companies, jobs] = await Promise.all([companiesRes.json(), jobsRes.json()]);
      setResults([
        ...companies.items.map((company: { id: string; name: string; industry?: string | null; slug: string }) => ({ id: `c-${company.id}`, title: company.name, detail: company.industry || "Verified company", href: `/companies/${company.slug}` })),
        ...jobs.items.map((job: { id: string; title: string; company: { name: string }; originalUrl: string }) => ({ id: `j-${job.id}`, title: job.title, detail: `${job.company.name} · job`, href: safeExternalUrl(job.originalUrl) || "" })),
      ].filter((item) => item.href));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search is unavailable.");
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  return <>
    <form className="hero-search" onSubmit={search}><Search size={18} /><input aria-label="Search companies, jobs and skills" placeholder="Try a company, role or skill" value={query} onChange={(event) => setQuery(event.target.value)} /><button aria-label="Search" disabled={loading}><ArrowUpRight size={17} /></button></form>
    <div className="region-row">{[["", "All MMR"], ["Mumbai", "Mumbai"], ["Navi Mumbai", "Navi Mumbai"], ["Thane", "Thane"]].map(([value, label]) => <button type="button" className={city === value ? "region active" : "region"} key={value} onClick={() => setCity(value)}>{label}</button>)}</div>
    {(results || error) && <div className="search-results" aria-live="polite">{loading ? <p>Searching verified listings…</p> : error ? <p>{error}</p> : results?.length ? results.map((item) => <a key={item.id} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noreferrer" : undefined}><span>{item.title}<small>{item.detail}</small></span><ArrowUpRight size={15} /></a>) : <p>No verified companies or open jobs matched yet. Check back as the directory grows.</p>}</div>}
  </>;
}

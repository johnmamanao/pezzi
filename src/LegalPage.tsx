import type { ReactNode } from 'react'

type LegalPageProps = {
  kind: 'privacy' | 'terms'
  title: string
  summary: string
  children: ReactNode
}

export function LegalPage({ kind, title, summary, children }: LegalPageProps) {
  return <div className="legal-page">
    <header className="legal-header">
      <a className="legal-brand" href="/" aria-label="Pezzi home"><span className="legal-brand-mark" aria-hidden="true"><i /><i /><i /><i /></span>pezzi</a>
      <nav aria-label="Legal navigation"><a href="/">Home</a><a href="/studio">Studio</a><a href="/privacy" aria-current={kind === 'privacy' ? 'page' : undefined}>Privacy</a><a href="/terms" aria-current={kind === 'terms' ? 'page' : undefined}>Terms</a></nav>
    </header>
    <main className="legal-layout" id="main">
      <div className="legal-intro"><h1>{title}</h1><p>{summary}</p><span>Last updated September 27, 2026</span></div>
      <article className="legal-article">{children}</article>
    </main>
    <footer className="legal-footer"><span>© pezzi {new Date().getFullYear()}</span><a href="/">Back to Pezzi ↗</a></footer>
  </div>
}

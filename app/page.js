'use client';

import { useState } from 'react';

const sampleLinks = `https://gulfbusiness.com/en/2026/transport/dubai-unveils-42km-gold-line-underground-metro-project-with-2032-completion-target/
https://gulfbusiness.com/en/2026/dubai/why-the-worlds-ultra-rich-are-flocking-to-dubai-amid-a-historic-wealth-surge/
https://gulfbusiness.com/en/2026/abu-dhabi/abu-dhabi-ghantoot-toll-gate-may-4-darb-expansion/`;

export default function Page() {
  const [links, setLinks] = useState('');
  const [html, setHtml] = useState('');
  const [subjectLines, setSubjectLines] = useState([]);
  const [preheader, setPreheader] = useState('');
  const [stories, setStories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function generateNewsletter() {
    setLoading(true);
    setError('');
    setHtml('');
    setStories([]);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      setHtml(data.html);
      setStories(data.stories);
      setSubjectLines(data.subjectLines || []);
      setPreheader(data.preheader || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function copyHtml() {
    await navigator.clipboard.writeText(html);
    alert('HTML copied. Paste it into Eloqua.');
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <h1 style={styles.h1}>Gulf Business newsletter builder</h1>
        <p style={styles.p}>Paste GulfBusiness.com story links in the order you want them to appear. Link 1 becomes the lead story.</p>

        <textarea
          style={styles.textarea}
          value={links}
          onChange={(e) => setLinks(e.target.value)}
          placeholder={sampleLinks}
        />

        <div style={styles.row}>
          <button style={styles.button} onClick={generateNewsletter} disabled={loading}>
            {loading ? 'Generating…' : 'Generate newsletter'}
          </button>
          <button style={styles.secondaryButton} onClick={() => setLinks(sampleLinks)}>
            Load sample links
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}
      </section>

      {stories.length > 0 && (
        <section style={styles.card}>
          <h2 style={styles.h2}>Stories pulled from backend</h2>
          <ol>
            {stories.map((story, index) => (
              <li key={story.url} style={styles.storyItem}>
                <strong>{index + 1}. {story.title}</strong><br />
                <span>{story.excerpt}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {html && (
        <section style={styles.card}>
          <h2 style={styles.h2}>Subject line ideas</h2>
          <ul>
            {subjectLines.map((s) => <li key={s}>{s}</li>)}
          </ul>
          <p><strong>Pre-header:</strong> {preheader}</p>

          <div style={styles.row}>
            <button style={styles.button} onClick={copyHtml}>Copy Eloqua HTML</button>
          </div>

          <h2 style={styles.h2}>Eloqua HTML</h2>
          <textarea readOnly style={styles.output} value={html} />
        </section>
      )}
    </main>
  );
}

const styles = {
  page: { fontFamily: 'Arial, sans-serif', background: '#f3f4f6', minHeight: '100vh', padding: 24 },
  card: { background: '#fff', borderRadius: 14, padding: 24, maxWidth: 1000, margin: '0 auto 20px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' },
  h1: { marginTop: 0, fontSize: 32 },
  h2: { marginTop: 0, fontSize: 22 },
  p: { color: '#444', lineHeight: 1.5 },
  textarea: { width: '100%', minHeight: 180, padding: 14, fontSize: 15, borderRadius: 10, border: '1px solid #ccc', boxSizing: 'border-box' },
  output: { width: '100%', minHeight: 420, padding: 14, fontSize: 13, borderRadius: 10, border: '1px solid #ccc', boxSizing: 'border-box', fontFamily: 'monospace' },
  row: { display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' },
  button: { background: '#000', color: '#fff', border: 0, padding: '12px 18px', borderRadius: 10, cursor: 'pointer', fontWeight: 'bold' },
  secondaryButton: { background: '#e5e7eb', color: '#111', border: 0, padding: '12px 18px', borderRadius: 10, cursor: 'pointer', fontWeight: 'bold' },
  error: { color: '#b00020', fontWeight: 'bold' },
  storyItem: { marginBottom: 12, lineHeight: 1.4 }
};

import { useState } from 'react';
import { useContent } from '../../context/ContentContext';

export function ComponentSettings() {
  const { content, updateContent, importJson } = useContent();
  const [json, setJson] = useState('');
  const [message, setMessage] = useState('');
  const sections = ['header', 'hero', 'showreel', 'clientlogos', 'about', 'services', 'portfolio', 'process', 'gallery', 'contact', 'footer'];
  return <section className="space-y-4 p-5 border border-gray-700 rounded-xl">
    <h2 className="text-xl font-bold">Website components</h2>
    <p>Choose which sections appear on the website. Publish to apply your changes.</p>
    <div className="flex flex-wrap gap-4">{sections.map(section => <label key={section} className="capitalize">
      <input type="checkbox" checked={content.sectionVisibility?.[section] !== false} onChange={e => updateContent({ sectionVisibility: { ...content.sectionVisibility, [section]: e.target.checked } })} /> {section}
    </label>)}</div>
    <details className="space-y-3">
      <summary className="cursor-pointer">Advanced content editor</summary>
      <p>Edit all content fields, including section headings, showreel caption/specs, collections and optional settings. Keep required sections; use empty lists to delete collection items.</p>
      <button className="p-2 bg-gray-700 rounded" onClick={() => setJson(JSON.stringify(content, null, 2))}>Load current draft</button>
      <textarea aria-label="Website content JSON" className="w-full h-96 bg-black p-3 font-mono text-xs" value={json} onChange={e => setJson(e.target.value)} />
      <button className="p-2 bg-blue-600 rounded" onClick={() => { const result = importJson(json); setMessage(result.success ? 'Draft updated. Publish to save to Supabase.' : result.error || 'Invalid content'); }}>Apply to draft</button>
      <p role="status">{message}</p>
    </details>
  </section>;
}

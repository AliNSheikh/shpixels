import { useEffect, useState } from 'react';
import { Inbox, RefreshCw } from 'lucide-react';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  service?: string | null;
  budget?: string | null;
  message?: string | null;
  source_page?: string | null;
  status: 'new' | 'read' | 'replied' | 'archived';
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
}

const inputClass = 'w-full px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed] focus:outline-none focus:border-[#2563eb]';

export function InquiryManager() {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/inquiries?limit=200', { credentials: 'same-origin', cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to load inquiries.');
      setItems(result.inquiries || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load inquiries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async (item: Inquiry, updates: Partial<Inquiry>) => {
    const next = { ...item, ...updates };
    setItems((current) => current.map((row) => row.id === item.id ? next : row));

    try {
      const response = await fetch('/api/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          id: next.id,
          status: next.status,
          adminNotes: next.admin_notes || ''
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to update inquiry.');
      setItems((current) => current.map((row) => row.id === item.id ? result.inquiry : row));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update inquiry.');
      void load();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#2b2b2b]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black uppercase font-quicksand text-[#f1f2ed]">Contact Inquiries</h2>
          <p className="text-xs text-[#a8a6a1] mt-1">Private submission log stored in Supabase. Update status and internal notes here.</p>
        </div>
        <button onClick={() => void load()} className="px-3 py-2 rounded-xl bg-[#232323] text-xs text-[#f1f2ed] flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {error && <div className="p-3 rounded-xl bg-red-950/30 border border-red-900/50 text-xs text-red-300">{error}</div>}

      {!loading && items.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] text-[#706e6a]">
          <Inbox className="w-8 h-8 mx-auto mb-3" />
          No inquiries yet.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article key={item.id} className="p-5 rounded-2xl bg-[#1d1d1d] border border-[#2b2b2b] space-y-4">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-[#f1f2ed]">{item.name}</div>
                  <div className="text-xs text-[#a8a6a1]">{item.email}{item.phone ? ` • ${item.phone}` : ''}</div>
                  <div className="text-[10px] font-mono text-[#706e6a] mt-1">{new Date(item.created_at).toLocaleString()}</div>
                </div>
                <select className="px-3 py-2 rounded-xl bg-[#232323] border border-[#2b2b2b] text-xs text-[#f1f2ed]" value={item.status} onChange={(e) => void save(item, { status: e.target.value as Inquiry['status'] })}>
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-3 text-xs">
                {item.service && <div><span className="text-[#706e6a]">Service:</span> <span className="text-[#d7d6d2]">{item.service}</span></div>}
                {item.budget && <div><span className="text-[#706e6a]">Budget:</span> <span className="text-[#d7d6d2]">{item.budget}</span></div>}
              </div>

              {item.message && <p className="text-sm leading-relaxed text-[#d7d6d2] whitespace-pre-wrap">{item.message}</p>}

              <div>
                <label className="block text-[10px] font-mono uppercase text-[#706e6a] mb-1">Internal Admin Notes</label>
                <textarea
                  rows={2}
                  className={inputClass}
                  value={item.admin_notes || ''}
                  onChange={(e) => setItems((current) => current.map((row) => row.id === item.id ? { ...row, admin_notes: e.target.value } : row))}
                  onBlur={(e) => void save(item, { admin_notes: e.target.value })}
                  placeholder="Private notes..."
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

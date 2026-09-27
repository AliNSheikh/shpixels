import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { useContent } from '../../context/ContentContext';

export function AdminAuthModal() {
  const { loginAdmin, setIsAdminView, content } = useContent();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      const result = await loginAdmin(email, password);
      if (!result.success) throw new Error(result.error);
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const inputClass = 'w-full rounded-xl bg-[#232323] border border-[#444] p-3 text-white';

  return <div className="min-h-screen bg-[#111] flex items-center justify-center p-4 text-white">
    <div className="max-w-md w-full rounded-2xl bg-[#171717] border border-[#333] p-8 space-y-6">
      <Lock className="mx-auto text-blue-400" aria-hidden="true" />
      <h1 className="text-2xl font-bold text-center">{content.branding.siteName} CMS</h1>
      <h2 className="text-center">Administrator sign in</h2>
      {error && <p role="alert" className="text-red-300">{error}</p>}

      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          Email
          <input
            id="admin-email-input"
            className={inputClass}
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={busy}
          />
        </label>

        <label className="block">
          Password
          <input
            id="admin-password-input"
            className={inputClass}
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={busy}
          />
        </label>

        <button
          id="admin-login-submit-btn"
          disabled={busy}
          className="w-full rounded-xl bg-blue-600 p-3 disabled:opacity-50"
        >
          {busy ? 'Please wait...' : 'Sign in'}
        </button>
      </form>

      <a className="block text-gray-400 underline" href="/" onClick={() => setIsAdminView(false)}>
        Back to website
      </a>
    </div>
  </div>;
}

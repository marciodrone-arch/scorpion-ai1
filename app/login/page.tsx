
'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const endpoint =
        mode === 'register'
          ? '/api/auth/sign-up/email'
          : '/api/auth/sign-in/email';

      const body =
        mode === 'register'
          ? { name, email, password }
          : { email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Não foi possível concluir.');
      }

      setMessage(
        mode === 'register'
          ? 'Cadastro realizado! Sua conta foi criada.'
          : 'Login realizado com sucesso!'
      );

      window.location.href = '/';
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Erro inesperado.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-5">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-white text-center">
          ScorpionAI
        </h1>

        <p className="text-slate-400 text-center mt-2 mb-7">
          {mode === 'register' ? 'Crie sua conta' : 'Acesse sua conta'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <input
              className="w-full rounded-lg bg-slate-800 border border-slate-700 p-3 text-white"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <input
            className="w-full rounded-lg bg-slate-800 border border-slate-700 p-3 text-white"
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="w-full rounded-lg bg-slate-800 border border-slate-700 p-3 text-white"
            type="password"
            placeholder="Senha (mínimo 8 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-orange-600 hover:bg-orange-700 disabled:opacity-50 p-3 font-semibold text-white"
          >
            {loading
              ? 'Aguarde...'
              : mode === 'register'
                ? 'Criar minha conta'
                : 'Entrar'}
          </button>
        </form>

        {message && (
          <p className="mt-5 text-center text-sm text-white break-words">
            {message}
          </p>
        )}

        <button
          onClick={() => {
            setMode(mode === 'register' ? 'login' : 'register');
            setMessage('');
          }}
          className="w-full mt-6 text-sm text-orange-400 hover:text-orange-300"
        >
          {mode === 'register'
            ? 'Já tenho conta. Quero entrar.'
            : 'Ainda não tenho conta. Quero me cadastrar.'}
        </button>
      </div>
    </main>
  );
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export function AuthPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!supabase) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-bold text-slate-800">家账</h1>
        <p className="text-sm text-slate-500">请配置 Supabase 环境变量后启动</p>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const sb = supabase!

    const { error: signInErr } = await sb.auth.signInWithPassword({
      email,
      password,
    })

    if (signInErr) {
      if (signInErr.message === 'Invalid login credentials') {
        const { error: signUpErr } = await sb.auth.signUp({
          email,
          password,
        })
        if (signUpErr) {
          setError(signUpErr.message)
        } else {
          navigate('/')
        }
      } else {
        setError(signInErr.message)
      }
    } else {
      navigate('/')
    }

    setSubmitting(false)
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col items-center justify-center gap-6 px-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800">家账</h1>
        <p className="mt-1 text-sm text-slate-500">小家庭记账，各记各的，月底一目了然</p>
      </div>
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
        <input
          type="email"
          placeholder="邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
        />
        <input
          type="password"
          placeholder="密码（至少 6 位）"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? '处理中...' : '登录 / 注册'}
        </button>
      </form>
    </div>
  )
}

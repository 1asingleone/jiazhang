import { useState } from 'react'
import { useMyFamily, useCreateFamily, useJoinFamily, useFamilyMembers } from '@/hooks/use-family'
import { supabase } from '@/lib/supabase'

export function FamilyPage() {
  const { data: family, isLoading } = useMyFamily()
  const { data: members } = useFamilyMembers(family?.id)

  if (!supabase) {
    return <SetupPrompt />
  }

  if (isLoading) {
    return <Loading />
  }

  if (!family) {
    return <NoFamily />
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="rounded-xl bg-blue-50 p-4">
        <h2 className="text-sm font-medium text-blue-800">{family.name}</h2>
        <p className="mt-1 text-xs text-blue-600">
          邀请码：<span className="font-mono font-bold">{family.invite_code}</span>
        </p>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">家庭成员</h3>
        <div className="flex flex-col gap-2">
          {members?.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
            >
              <span className="text-sm text-slate-800">
                {m.profiles?.name || m.user_id.slice(0, 8)}
              </span>
              <span className="text-xs text-slate-400">
                {m.role === 'admin' ? '管理员' : '成员'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => supabase!.auth.signOut()}
        className="mt-auto rounded-lg border border-red-200 px-4 py-2 text-sm text-red-500 transition-colors hover:bg-red-50"
      >
        退出登录
      </button>
    </div>
  )
}

function SetupPrompt() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <p className="text-sm text-slate-400">请配置 Supabase 环境变量</p>
    </div>
  )
}

function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <p className="text-sm text-slate-400">加载中...</p>
    </div>
  )
}

function NoFamily() {
  const [tab, setTab] = useState<'create' | 'join'>('create')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const createFamily = useCreateFamily()
  const joinFamily = useJoinFamily()

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-slate-800">加入家庭</h2>
        <p className="mt-1 text-sm text-slate-500">创建家庭或输入邀请码加入</p>
      </div>

      <div className="flex rounded-lg border border-slate-200 p-1">
        <button
          onClick={() => setTab('create')}
          className={`flex-1 rounded-md py-2 text-sm transition-colors ${
            tab === 'create' ? 'bg-blue-600 text-white' : 'text-slate-600'
          }`}
        >
          创建家庭
        </button>
        <button
          onClick={() => setTab('join')}
          className={`flex-1 rounded-md py-2 text-sm transition-colors ${
            tab === 'join' ? 'bg-blue-600 text-white' : 'text-slate-600'
          }`}
        >
          加入家庭
        </button>
      </div>

      {tab === 'create' ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            createFamily.mutate(name)
          }}
          className="flex flex-col gap-3"
        >
          <input
            placeholder="家庭名称"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
          />
          {createFamily.error && (
            <p className="text-xs text-red-500">{createFamily.error.message}</p>
          )}
          <button
            type="submit"
            disabled={createFamily.isPending}
            className="rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {createFamily.isPending ? '创建中...' : '创建家庭'}
          </button>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            joinFamily.mutate(code)
          }}
          className="flex flex-col gap-3"
        >
          <input
            placeholder="输入邀请码"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm uppercase focus:border-blue-500 focus:outline-none"
          />
          {joinFamily.error && (
            <p className="text-xs text-red-500">{joinFamily.error.message}</p>
          )}
          <button
            type="submit"
            disabled={joinFamily.isPending}
            className="rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {joinFamily.isPending ? '加入中...' : '加入家庭'}
          </button>
        </form>
      )}
    </div>
  )
}

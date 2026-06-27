import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useTransactions } from '@/hooks/use-transactions'
import { useFamilyMembers } from '@/hooks/use-family'
import { useMyFamily } from '@/hooks/use-family'

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
]

export function StatsPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const monthStr = `${year}-${String(month).padStart(2, '0')}`
  const { data: family } = useMyFamily()
  const { data: transactions } = useTransactions(monthStr)
  const { data: members } = useFamilyMembers(family?.id)

  function prevMonth() {
    if (month === 1) {
      setYear(year - 1)
      setMonth(12)
    } else {
      setMonth(month - 1)
    }
  }

  function nextMonth() {
    if (month === 12) {
      setYear(year + 1)
      setMonth(1)
    } else {
      setMonth(month + 1)
    }
  }

  const expenseByCategory = transactions
    ?.filter((t) => t.type === 'expense')
    .reduce(
      (acc, t) => {
        const cat = t.category
        acc[cat] = (acc[cat] || 0) + Number(t.amount)
        return acc
      },
      {} as Record<string, number>,
    )

  const pieData = Object.entries(expenseByCategory ?? {}).map(([name, value]) => ({
    name,
    value,
  }))

  const totalExpense = pieData.reduce((s, d) => s + d.value, 0)

  const expenseByMember = transactions
    ?.filter((t) => t.type === 'expense')
    .reduce(
      (acc, t) => {
        acc[t.user_id] = (acc[t.user_id] || 0) + Number(t.amount)
        return acc
      },
      {} as Record<string, number>,
    )

  const memberRanking = Object.entries(expenseByMember ?? {})
    .sort(([, a], [, b]) => b - a)
    .map(([userId, amount]) => {
      const member = members?.find((m) => m.user_id === userId)
      return { userId, amount, name: member?.profiles?.name || userId.slice(0, 8) }
    })

  const formatCurrency = (value: number) =>
    `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-center gap-4">
        <button onClick={prevMonth} className="text-slate-400 transition-colors hover:text-slate-600">
          <ChevronLeft className="size-5" />
        </button>
        <h2 className="text-base font-semibold text-slate-800">
          {year}年{month}月
        </h2>
        <button
          onClick={nextMonth}
          className="text-slate-400 transition-colors hover:text-slate-600"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      <div className="rounded-xl bg-red-50 p-4 text-center">
        <p className="text-xs text-red-600">本月支出</p>
        <p className="text-3xl font-bold text-red-700">
          {formatCurrency(totalExpense)}
        </p>
      </div>

      {pieData.length > 0 && (
        <div className="rounded-xl border border-slate-200 p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">支出分类</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap gap-2">
            {pieData.map((d, i) => (
              <span key={d.name} className="flex items-center gap-1 text-xs text-slate-500">
                <span
                  className="inline-block size-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                {d.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {memberRanking.length > 1 && (
        <div className="rounded-xl border border-slate-200 p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">成员支出排行</h3>
          <div className="flex flex-col gap-2">
            {memberRanking.map((m, i) => (
              <div key={m.userId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-400">#{i + 1}</span>
                  <span className="text-sm text-slate-700">{m.name}</span>
                </div>
                <span className="text-sm font-medium text-slate-800">
                  {formatCurrency(m.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {transactions?.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-400">该月暂无账单</p>
      )}
    </div>
  )
}

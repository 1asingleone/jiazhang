import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useMyFamily } from '@/hooks/use-family'
import { useTransactions, useCreateTransaction, useDeleteTransaction, CATEGORIES } from '@/hooks/use-transactions'
import { supabase } from '@/lib/supabase'

const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => c !== '工资' && c !== '红包' && c !== '其他收入')
const INCOME_CATEGORIES = ['工资', '红包', '其他收入']

export function TransactionsPage() {
  const { data: family } = useMyFamily()
  const now = new Date()
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const { data: transactions } = useTransactions(month)
  const deleteTx = useDeleteTransaction()
  const [showForm, setShowForm] = useState(false)

  if (!supabase) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-4">
        <p className="text-sm text-slate-400">请配置 Supabase 环境变量</p>
      </div>
    )
  }

  if (!family) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-4">
        <p className="text-sm text-slate-400">请先在「家庭」页面创建或加入家庭</p>
      </div>
    )
  }

  const totalExpense = transactions?.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0) ?? 0
  const totalIncome = transactions?.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0) ?? 0

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex gap-3">
        <div className="flex-1 rounded-xl bg-red-50 p-4">
          <p className="text-xs text-red-600">本月支出</p>
          <p className="text-2xl font-bold text-red-700">
            ¥{totalExpense.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="flex-1 rounded-xl bg-green-50 p-4">
          <p className="text-xs text-green-600">本月收入</p>
          <p className="text-2xl font-bold text-green-700">
            ¥{totalIncome.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {transactions?.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">暂无账单，记第一笔吧</p>
        )}
        {transactions?.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center gap-3 rounded-lg border border-slate-100 px-4 py-3"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {tx.category}
                </span>
                {tx.note && (
                  <span className="text-xs text-slate-400">{tx.note}</span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                <span>{tx.transaction_date}</span>
                {tx.payment_method && <span>{tx.payment_method}</span>}
              </div>
            </div>
            <span
              className={`text-sm font-semibold ${
                tx.type === 'expense' ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {tx.type === 'expense' ? '-' : '+'}¥{Number(tx.amount).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
            </span>
            <button
              onClick={() => deleteTx.mutate(tx.id)}
              className="text-slate-300 transition-colors hover:text-red-500"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-20 right-1/2 z-10 flex size-14 translate-x-[240px] items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-colors hover:bg-blue-700"
      >
        <Plus className="size-7" />
      </button>

      {showForm && <AddTransactionForm onClose={() => setShowForm(false)} />}
    </div>
  )
}

function AddTransactionForm({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [category, setCategory] = useState('餐饮')
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [note, setNote] = useState('')
  const createTx = useCreateTransaction()

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
  const payMethods = ['现金', '微信', '支付宝', '信用卡', '储蓄卡']

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount) return
    createTx.mutate(
      {
        type,
        category,
        amount: Number(amount),
        paymentMethod: paymentMethod || undefined,
        note: note || undefined,
      },
      { onSuccess: () => onClose() },
    )
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end bg-black/30">
      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-[480px] rounded-t-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">记一笔</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-slate-400"
          >
            取消
          </button>
        </div>

        <div className="mb-4 flex rounded-lg border border-slate-200 p-1">
          <button
            type="button"
            onClick={() => { setType('expense'); setCategory('餐饮') }}
            className={`flex-1 rounded-md py-2 text-sm transition-colors ${
              type === 'expense' ? 'bg-red-500 text-white' : 'text-slate-600'
            }`}
          >
            支出
          </button>
          <button
            type="button"
            onClick={() => { setType('income'); setCategory('工资') }}
            className={`flex-1 rounded-md py-2 text-sm transition-colors ${
              type === 'income' ? 'bg-green-500 text-white' : 'text-slate-600'
            }`}
          >
            收入
          </button>
        </div>

        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          autoFocus
          className="mb-4 w-full text-center text-3xl font-bold text-slate-800 focus:outline-none"
        />

        <div className="mb-4 grid grid-cols-4 gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                category === c
                  ? type === 'expense'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {payMethods.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setPaymentMethod(m === paymentMethod ? '' : m)}
              className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                paymentMethod === m
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <input
          placeholder="备注（可选）"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mb-6 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
        />

        <button
          type="submit"
          disabled={createTx.isPending}
          className={`w-full rounded-lg py-3 text-sm font-medium text-white transition-colors disabled:opacity-50 ${
            type === 'expense'
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {createTx.isPending ? '保存中...' : '记一笔'}
        </button>
      </form>
    </div>
  )
}

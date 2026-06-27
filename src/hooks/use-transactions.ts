import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import { useMyFamily } from '@/hooks/use-family'
import type { Transaction } from '@/types'

const CATEGORIES = [
  '餐饮',
  '食品',
  '交通',
  '购物',
  '居住',
  '娱乐',
  '医疗',
  '教育',
  '通讯',
  '人情',
  '其他支出',
  '工资',
  '红包',
  '其他收入',
] as const

export { CATEGORIES }

function getMonthRange(month: string) {
  const [y, m] = month.split('-').map(Number)
  const start = `${month}-01`
  const nextMonth = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`
  return { start, end: nextMonth }
}

export function useTransactions(month: string) {
  const { user } = useAuth()
  const { data: family } = useMyFamily()

  return useQuery({
    queryKey: ['transactions', family?.id, month],
    queryFn: async () => {
      if (!family?.id || !supabase) return []

      const { start, end } = getMonthRange(month)
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('family_id', family.id)
        .gte('transaction_date', start)
        .lt('transaction_date', end)
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Transaction[]
    },
    enabled: !!family?.id && !!supabase && !!user,
  })
}

export function useCreateTransaction() {
  const { user } = useAuth()
  const { data: family } = useMyFamily()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      type: 'income' | 'expense'
      category: string
      amount: number
      paymentMethod?: string
      note?: string
      tags?: string[]
    }) => {
      if (!supabase || !user || !family) throw new Error('Not ready')

      const { error } = await supabase.from('transactions').insert({
        family_id: family.id,
        user_id: user.id,
        type: input.type,
        category: input.category,
        amount: input.amount,
        payment_method: input.paymentMethod ?? null,
        note: input.note ?? null,
        tags: input.tags ?? null,
        transaction_date: new Date().toISOString().split('T')[0],
      })

      if (error) throw error
    },
    onSuccess: () => {
      const now = new Date()
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      qc.invalidateQueries({ queryKey: ['transactions', family?.id, month] })
    },
  })
}

export function useDeleteTransaction() {
  const { user } = useAuth()
  const { data: family } = useMyFamily()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error('Not ready')
      const { error } = await supabase.from('transactions').delete().eq('id', id).eq('user_id', user!.id)
      if (error) throw error
    },
    onSuccess: () => {
      const now = new Date()
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      qc.invalidateQueries({ queryKey: ['transactions', family?.id, month] })
    },
  })
}

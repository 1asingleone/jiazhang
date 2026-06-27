import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import type { Family, FamilyMember } from '@/types'

async function createFamilyApi(name: string, userId: string): Promise<Family> {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase()
  const { data, error } = await supabase!
    .from('families')
    .insert({ name, invite_code: code, created_by: userId })
    .select()
    .single()

  if (error) throw error

  await supabase!
    .from('family_members')
    .insert({ family_id: data.id, user_id: userId, role: 'admin' })

  return data
}

async function joinFamilyApi(code: string, userId: string): Promise<Family> {
  const { data: family, error: findErr } = await supabase!
    .from('families')
    .select()
    .eq('invite_code', code)
    .single()

  if (findErr) throw new Error('邀请码无效')
  if (!family) throw new Error('邀请码无效')

  const { error: joinErr } = await supabase!
    .from('family_members')
    .insert({ family_id: family.id, user_id: userId, role: 'member' })

  if (joinErr) {
    if (joinErr.code === '23505') throw new Error('已经在家庭中')
    throw joinErr
  }

  return family
}

export function useMyFamily() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['my-family', user?.id],
    queryFn: async () => {
      if (!user || !supabase) return null

      const { data: member } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!member) return null

      const { data: family } = await supabase
        .from('families')
        .select()
        .eq('id', member.family_id)
        .single()

      return family ?? null
    },
    enabled: !!user && !!supabase,
  })
}

export function useFamilyMembers(familyId: string | undefined) {
  return useQuery({
    queryKey: ['family-members', familyId],
    queryFn: async () => {
      if (!familyId || !supabase) return []

      const { data, error } = await supabase
        .from('family_members')
        .select('*, profiles(name, avatar_url)')
        .eq('family_id', familyId)

      if (error) throw error
      return data as FamilyMember[]
    },
    enabled: !!familyId && !!supabase,
  })
}

export function useCreateFamily() {
  const { user } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (name: string) => createFamilyApi(name, user!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-family'] })
    },
  })
}

export function useJoinFamily() {
  const { user } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (code: string) => joinFamilyApi(code, user!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-family'] })
    },
  })
}

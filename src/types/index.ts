export interface Profile {
  id: string
  name: string
  avatar_url: string | null
  created_at: string
}

export interface Family {
  id: string
  name: string
  invite_code: string
  created_by: string
  created_at: string
}

export interface FamilyMember {
  id: string
  family_id: string
  user_id: string
  role: 'admin' | 'member'
  joined_at: string
}

export interface Transaction {
  id: string
  family_id: string
  user_id: string
  type: 'income' | 'expense'
  category: string
  amount: number
  payment_method: string | null
  note: string | null
  tags: string[] | null
  transaction_date: string
  created_at: string
}

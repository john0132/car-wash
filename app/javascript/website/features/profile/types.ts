export interface ProfileData {
  name: string
  last_name: string | null
  email: string
  points: number
  wallet: number
  created_at: string
}

export interface DeviceSession {
  id: number
  user_agent: string | null
  ip_address: string | null
  created_at: string
}

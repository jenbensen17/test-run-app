export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      allowed_emails: {
        Row: {
          id: number
          created_at: string
          type: 'domain' | 'specific'
          value: string // either domain or full email address
        }
        Insert: {
          id?: number
          created_at?: string
          type: 'domain' | 'specific'
          value: string
        }
        Update: {
          id?: number
          created_at?: string
          type?: 'domain' | 'specific'
          value?: string
        }
      }
    }
  }
} 
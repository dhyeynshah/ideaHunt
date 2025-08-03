import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabase } from './supabase'

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Sign in with Supabase
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          })

          if (error) {
            console.error('Auth error:', error)
            return null
          }

          if (data.user) {
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.full_name || data.user.email,
            }
          }

          return null
        } catch (error) {
          console.error('Sign in error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        // Check if user exists in our users table
        const { data: existingUser, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking user:', error)
          return false
        }

        if (!existingUser) {
          // Create new user in our users table
          const { error: insertError } = await supabase
            .from('users')
            .insert([{
              email: user.email,
              username: user.email.split('@')[0].toLowerCase() || `user${Date.now()}`,
              display_name: user.name,
            }])

          if (insertError) {
            console.error('Error creating user:', insertError)
            return false
          }
        }

        return true
      } catch (error) {
        console.error('Sign in error:', error)
        return false
      }
    },
    async jwt({ token, user }) {
      if (user) {
        // Get user data from our users table
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .single()

        token.userData = userData
      }
      return token
    },
    async session({ session, token }) {
      session.user.userData = token.userData
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  session: {
    strategy: 'jwt'
  }
}

export default NextAuth(authConfig)
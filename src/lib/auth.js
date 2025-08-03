import NextAuth from 'next-auth'
import { supabase } from './supabase'

export const authConfig = {
  providers: [
    {
      id: 'slack',
      name: 'Slack',
      type: 'oauth',
      client: {
        token_endpoint_auth_method: 'client_secret_post'
      },
      authorization: {
        url: 'https://slack.com/oauth/v2/authorize',
        params: {
          user_scope: 'openid,profile,email'
        }
      },
      token: 'https://slack.com/api/oauth.v2.access',
      userinfo: {
        url: 'https://slack.com/api/openid.connect.userInfo',
        async request({ tokens }) {
          const response = await fetch('https://slack.com/api/openid.connect.userInfo', {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
            },
          })
          return await response.json()
        }
      },
      clientId: process.env.SLACK_CLIENT_ID,
      clientSecret: process.env.SLACK_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          slackId: profile.sub
        }
      }
    }
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === 'slack') {
        try {
          // Check if user exists in Supabase
          const { data: existingUser, error } = await supabase
            .from('users')
            .select('*')
            .eq('slack_id', user.slackId)
            .single()

          if (error && error.code !== 'PGRST116') {
            console.error('Error checking user:', error)
            return false
          }

          if (!existingUser) {
            // Create new user
            const { error: insertError } = await supabase
              .from('users')
              .insert([{
                slack_id: user.slackId,
                username: user.name?.replace(/\s+/g, '').toLowerCase() || `user${Date.now()}`,
                display_name: user.name,
                email: user.email,
                avatar_url: user.image
              }])

            if (insertError) {
              console.error('Error creating user:', insertError)
              return false
            }
          } else {
            // Update existing user info
            const { error: updateError } = await supabase
              .from('users')
              .update({
                display_name: user.name,
                email: user.email,
                avatar_url: user.image,
                updated_at: new Date().toISOString()
              })
              .eq('slack_id', user.slackId)

            if (updateError) {
              console.error('Error updating user:', updateError)
            }
          }

          return true
        } catch (error) {
          console.error('Sign in error:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        // Get user data from Supabase
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('slack_id', user.slackId)
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
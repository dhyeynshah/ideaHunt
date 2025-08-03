'use client'

import { signIn, getProviders } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignIn() {
  const [providers, setProviders] = useState(null)

  useEffect(() => {
    (async () => {
      const res = await getProviders()
      setProviders(res)
    })()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">HC</span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Sign in to YSWS Hunt
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Join the community and start shipping awesome projects!
          </p>
        </CardHeader>
        <CardContent>
          {providers && (
            <div className="space-y-4">
              {Object.values(providers).map((provider) => (
                <Button
                  key={provider.name}
                  onClick={() => signIn(provider.id, { callbackUrl: '/' })}
                  className="w-full bg-red-500 hover:bg-red-600"
                >
                  Sign in with {provider.name}
                </Button>
              ))}
            </div>
          )}
          
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">🚢 About YSWS</h4>
            <p className="text-sm text-gray-600">
              You Ship, We Ship! Build amazing projects and get rewarded with stickers, 
              hardware, and other maker goodies from Hack Club.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
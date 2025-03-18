import { handleAuth } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';

export const GET = handleAuth({
  returnPathname: '/dashboard',
  onSuccess: async (data) => {
    const user = data.user;
    const oauthTokensScopes = data.oauthTokens?.scopes;
    const oauthTokensExpiresAt = data.oauthTokens?.expiresAt;
    const accessToken = data.accessToken;
    const refreshToken = data.refreshToken;

    try {
      // Make sure this URL is correct
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({
          user,
          accessToken,
          refreshToken,
          oauthTokensScopes,
          oauthTokensExpiresAt
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to create session:', errorData);
        throw new Error(`Failed to create session: ${errorData.error || response.statusText}`);
      }
      
      // Session created successfully
      console.log('Session created successfully');
    } catch (error) {
      console.error('Error creating session:', error);
      redirect('/auth/error?message=Failed to create session');
    }
  },
  onError: async (error) => {
    console.error('Authentication error:', error);
    redirect('/auth/error?message=Authentication failed');
  },
});
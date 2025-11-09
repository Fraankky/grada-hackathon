import { cookies } from "next/headers";

import { createSession } from "@/services/auth";
import { getUserByEmail } from "@/services/user";
import { google } from "@/utils/arctic";
import { prisma } from "@/utils/prisma";

export async function GET(request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  
  const cookieStore = await cookies()
  const codeVerifier = cookieStore.get('codeVerifier')?.value;
  
  const baseUrl = `${url.protocol}//${url.host}`
  
  if (!code || !codeVerifier) {
    console.error('Missing code or codeVerifier');
    return Response.redirect(`${baseUrl}/auth/login?error=missing_code`)
  }

  try {
    const tokens = await google.validateAuthorizationCode(code, codeVerifier);
    const accessToken = tokens.accessToken();

    const res = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch user info: ${res.status}`);
    }

    const userData = await res.json()
  
    const existingUser = await getUserByEmail(userData.email);

    
    if (existingUser) {
      const newSession = await createSession(existingUser.id);
      
      cookieStore.set('session', newSession.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });

      await prisma.user.update({
        where: { id: existingUser.id },
        data: { 
          avatar: userData.picture, 
        }
      });

      return Response.redirect(`${baseUrl}/`)
    } else {
      const newUser = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          avatar: userData.picture,
        },
      });

      const newSession = await createSession(newUser.id);
      
      cookieStore.set('session', newSession.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });

      return Response.redirect(`${baseUrl}/`);
    }
  } catch (err) {
    if (err.message?.includes('invalid_grant')) {
      return Response.redirect(`${baseUrl}/auth/login?error=invalid_grant`);
    }
    if (err.message?.includes('invalid_client')) {
      return Response.redirect(`${baseUrl}/auth/login?error=invalid_client`);
    }
    console.error('OAuth callback error:', err);
    return Response.redirect(`${baseUrl}/auth/login?error=auth_failed&details=${encodeURIComponent(err.message)}`);
  }
}
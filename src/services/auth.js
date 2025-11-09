import { prisma } from '@/utils/prisma';
import bcrypt from 'bcrypt'


import { cookies } from 'next/headers';

export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hashedpassword) {
  return await bcrypt.compare(password, hashedpassword)
}

export async function createSession(userId) {
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

  return await prisma.session.create({
    data: { userId, expiresAt },
  });
}

export async function getSession(sessionId) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt < new Date()) {
    return null;
  }
  return session;
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');

  if (!session) {
    return null;
  }

  return await getSession(session.value);
}

export async function deleteSession(sessionId) {
  return await prisma.session.delete({
    where: { id: sessionId },
  });
}

export async function getAllSessions(userId) {
  return await prisma.session.findMany({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

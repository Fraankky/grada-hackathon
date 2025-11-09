"use server";

import * as arctic from "arctic";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  createSession,
  getCurrentSession,
  verifyPassword,
} from "@/services/auth";
import { createUser, getUserByEmail } from "@/services/user";
import { prisma } from "@/utils/prisma";

import { google } from "@/utils/arctic"



export async function registerAction(_, formData) {
  try {
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");

    if (!name || !email || !password) {
      return {
        status: "error",
        error: "All fields are required",
        message: "Name, Email, and Password fields are required",
        fieldErrors: {},
      };
    }

    

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return {
        status: "error",
        error: "User already exists",
        message: "An account with this email already exists",
        fieldErrors: {},
      };
    }

    const newUser = await createUser(name, email, password);

    return {
      status: "success",
      success: "User created successfully",
      message: "Account created successfully! Please login.",
      user: newUser,
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      status: "error",
      error: "An error occurred during registration",
      message: "An error occurred during registration. Please try again.",
      fieldErrors: {},
    };
  }
}

export async function loginAction(_, formData) {
  try {
    const cookieStore = await cookies();

    const email = formData.get("email");
    const password = formData.get("password");

    if (!email || !password) {
      return {
        status: "error",
        error: "All fields are required",
        message: "Email and Password fields are required",
        fieldErrors: {},
      };
    }

    const getWithPassword = true;
    const user = await getUserByEmail(email, getWithPassword);
    if (!user) {
      return {
        status: "error",
        error: "User not found",
        message: "No account found with this email address",
        fieldErrors: {
          email: "Email not found",
        },
      };
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return {
        status: "error",
        error: "Invalid password",
        message: "Invalid password",
        fieldErrors: {
          password: "incorrect password",
        },
      };
    }

     const session = await createSession(user.id);
     cookieStore.set("session", session.id, {
       httpOnly: true,
       secure: process.env.NODE_ENV === "production",
       maxAge: 60 * 60 * 24 * 30,
       path: "/",
     });

     // Return success before redirect
     return {
       status: "success",
       success: "Login successful",
       message: "Welcome back!",
     };
   } catch (error) {
     console.error("Login error:", error);
     return {
       status: "error",
       error: "An error occurred during login",
       fieldErrors: {},
     };
   }
}

export async function logoutAction() {
  const session = await getCurrentSession();
  const cookieStore = await cookies();

  if (!session) {
    redirect("/login");
  }

  await prisma.session.delete({
    where: {
      id: session.id,
    },
  });

  cookieStore.delete("session");
  redirect("/login");
}

export async function googleLoginAction() {
  const cookieStore = await cookies()

  const state = arctic.generateState();
  const codeVerifier = arctic.generateCodeVerifier();
  const scopes = ['openid', 'profile', 'email'];

  const url = google.createAuthorizationURL(state, codeVerifier, scopes)

  cookieStore.set("codeVerifier", codeVerifier)
  redirect("/")
}

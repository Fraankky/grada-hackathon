"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { loginAction } from "../action";
import SocialLogin from "../_components/social-login";

export default function Page() {
  const [state, action, pending] = useActionState(loginAction);
  const router = useRouter();

  // Redirect on successful login
  useEffect(() => {
    if (state?.status === "success") {
      router.push("/");
    }
  }, [state, router]);

  return (
    <main>
      <div className="w-full max-w-md mx-auto">
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-3xl text-gray-900 py-3">
            Welcome Back 
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Google Login */}
          <SocialLogin />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-gray-500">Or Sign in with email</span>
            </div>
          </div>
          {/* Login Form */}
          <form action={action} className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-gray-600">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email address"
                required
                className={`w-full ${
                  state?.fieldErrors?.email
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="password" className="text-gray-600">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter password"
                required
                className={`w-full ${
                  state?.fieldErrors?.password
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" name="remember" />
              <Label
                htmlFor="remember"
                className="text-sm font-normal text-gray-600">
                Remember me
              </Label>
            </div>
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={pending}>
              Login
            </Button>
            <div>
              <div>
                <p className="text-sm text-gray-700">
                  Dont have an account?{" "}
                  <Link
                    href="/register"
                    className="text-indigo-600 hover:underline">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </CardContent>
      </div>
    </main>
  );
}

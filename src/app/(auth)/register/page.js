"use client";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { registerAction } from "../action";
import SocialLogin from "../_components/social-login";

export default function Page() {
  const [state, action, pending] = useActionState(registerAction, null);

  useEffect(() => {
    if (state?.status === "success") {
      toast.success("Success!", {
        description: state.message,
        className: "bg-green-50 border-green-200 text-green-800",
      });
    }

    if (state?.status === "error") {
      toast.error("Error", {
        description: state.message,
      });
    }
  }, [state]);

  return (
    <main className="space-y-6">
      <div className="w-full max-w-md mx-auto">
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-3xl text-gray-900 py-3">
            Create your account
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
              <span className="px-2 text-gray-500">Or Sign up with email</span>
            </div>
          </div>
          {/* Login Form */}
          <form action={action} className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-gray-600">
                Full name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                required
                className="w-full"
              />
            </div>
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
                className="w-full"
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
                className="w-full"
              />
            </div>
            {state?.status === "error" && (
              <p className="text-red-500 text-sm">{state?.message}</p>
            )}
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={pending}>
              Login
            </Button>
            <div>
              <div>
                <p className="text-sm text-gray-700">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-indigo-600 hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 py-3">
                  By clicking &apos;Continue&apos;, you acknowledge that you
                  have read and accept the{" "}
                  <span className="text-indigo-600">Terms of Service</span> and{" "}
                  <span className="text-indigo-600">Privacy Policy.</span>
                </p>
              </div>
            </div>
          </form>
        </CardContent>
      </div>
    </main>
  );
}

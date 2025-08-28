// app/login/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Mail, Lock, Award } from "lucide-react";
import Image from "next/image";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const { user } = await loginUser(data.email, data.password);
      toast.success("Login successful");

      const redirect = localStorage.getItem("redirectAfterLogin");
      localStorage.removeItem("redirectAfterLogin");

      if (redirect) {
        router.push(redirect);
      } else {
        const role = user.userRoles?.[0]?.role?.name || "PESERTA";
        if (role === "ADMIN" || role === "SUPERADMIN") router.push("/admin");
        else if (role === "JURI") router.push("/jury");
        else router.push("/peserta");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-yellow-400/10 to-yellow-500/10 blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-gradient-to-r from-yellow-500/5 to-yellow-600/5 blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'32\\' height=\\'32\\' viewBox=\\'0 0 32 32\\'><path fill=\\'%23FFD700\\' d=\\'M0 31h32v1H0zM31 0v32h1V0z\\'/></svg>')] opacity-3" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4">
        <Card className="w-full max-w-lg border-0 shadow-2xl shadow-black/50 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 overflow-hidden">
          {/* Header with Logo and Brand */}
          <div className="relative bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 p-8 text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-yellow-600/5"></div>
            <div className="relative z-10">
              {/* Logo Container */}
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full blur-lg opacity-50 animate-pulse"></div>
                  <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-2xl border-4 border-yellow-400/50">
                    <Image
                      src="/logo.png"
                      alt="Mandaya Award Logo"
                      width={48}
                      height={48}
                      className="rounded-full drop-shadow-lg"
                    />
                  </div>
                </div>
              </div>
              
              {/* Brand Text */}
              <div className="space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-sm">
                  Mandaya Award
                </h1>
                <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
                  <Award className="h-4 w-4 text-yellow-500" />
                  <p className="text-sm font-medium">Excellence Recognition Platform</p>
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-8">
            {/* Welcome Section */}
            <div className="text-center mb-8">
              <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Welcome back
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Sign in to your account to continue
              </CardDescription>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              {/* Email */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email address
                </Label>
                <div className="relative group">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-yellow-500 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    className="pl-12 h-12 border-gray-300 focus:border-yellow-500 focus:ring-yellow-500/20 dark:border-gray-600 dark:bg-gray-800 dark:focus:border-yellow-400 transition-all duration-200"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </Label>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 font-medium transition-colors hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-yellow-500 transition-colors" />
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-12 pr-12 h-12 border-gray-300 focus:border-yellow-500 focus:ring-yellow-500/20 dark:border-gray-600 dark:bg-gray-800 dark:focus:border-yellow-400 transition-all duration-200"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white font-semibold shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all duration-300 transform hover:scale-[1.02]"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign in to your account"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

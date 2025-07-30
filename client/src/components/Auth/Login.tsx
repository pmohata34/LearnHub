import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/authContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const { setUser } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server response is not valid JSON. Is the endpoint correct?");
      }

      if (!res.ok) throw new Error(data.message || "Login failed");

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.user.fullname || data.user.name}`,
      });

      setLocation("/dashboard");
    } catch (err: any) {
      toast({
        title: "Login Failed",
        description: err.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login to LearnHub</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              required
              autoComplete="email"
              onChange={handleChange}
            />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              required
              autoComplete="current-password"
              onChange={handleChange}
            />
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm">
            Don’t have an account?{" "}
            <a href="/signup" className="text-indigo-600 hover:underline">
              Signup
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
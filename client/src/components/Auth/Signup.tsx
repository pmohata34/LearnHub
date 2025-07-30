import { useState } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/authContext";
import { generateUsername } from "@/lib/generateUsername";

const Signup = () => {
  const { setUser } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [form, setForm] = useState({
    fullname: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const username = generateUsername(form.fullname, form.email);
    const payload = { ...form, username };

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const text = await res.text();
      const data = JSON.parse(text);

      if (!res.ok) {
        throw new Error(data.message || "Signup failed");
      }

      const userData = data.user;
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      toast({
        title: "Signup Successful",
        description: `Welcome to LearnHub, ${userData.fullname}`
      });

      setLocation("/dashboard");
    } catch (err: any) {
      toast({
        title: "Signup Failed",
        description: err.message || "Could not register",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Create your LearnHub Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <Input
              id="fullname"
              name="fullname"
              type="text"
              placeholder="Your full name"
              value={form.fullname}
              onChange={handleChange}
              required
              maxLength={30}
              autoComplete="name"
            />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing up..." : "Signup"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <a href="/login" className="text-indigo-600 hover:underline">
              Login
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
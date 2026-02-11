import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/useAuth";

const LoginPage = () => {
  const authContext = useAuth();
  const { login, logout, error: authError, clearError } = authContext || {};
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
    if (authError && clearError) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (clearError) clearError();
    setLoading(true);
    const emailRegex = /^[a-z0-9]+@[a-z]+\.[a-z]{2,3}$/;
    // Clear any existing session before login attempt
    if (logout) logout();

    try {
      if (!form.email || !form.password) {
        throw new Error("Please fill in all fields");
      }

        if (!emailRegex.test(form.email)) {
          setError("Email must be in format like riya12@gmail.com");
          setLoading(false);
          return;
        }

      const res = await api.login(form);

      if (!res.data || !res.data.user || !res.data.token) {
        throw new Error("Invalid response from server");
      }

      if (login) {
        login(res.data.user, res.data.token);
        navigate("/");
      } else {
        throw new Error("Authentication system not available");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Login failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-[1.5rem] bg-[#f3f4f6]">
      <div className="w-[360px] max-w-[90vw] p-[2rem] my-[5%] mx-auto bg-white rounded-[12px]
        shadow-[0_10px_30px_rgba(15,23,42,0.12)] border border-[#e5e7eb] text-[#111827] text-center
        max-[480px]:p-[1.5rem]"
      >
        {/* Header */}
        <div>
          <h1 className="inline-flex items-center gap-[0.6rem] justify-center whitespace-nowrap">
            <span
              className="inline-block w-[40px] h-[40px] rounded-[14px] bg-[#2563eb]
                shadow-[0_10px_24px_rgba(37,99,235,0.35)]"
              style={{
                WebkitMaskImage:
                  "url(\"data:image/svg+xml,%3Csvg%20xmlns%3D%27http://www.w3.org/2000/svg%27%20viewBox%3D%270%200%2024%2024%27%3E%3Cpath%20fill%3D%27%23000%27%20d%3D%27M7%207a3%203%200%201%201%200%206a3%203%200%200%201%200-6Zm10%2010a3%203%200%201%201%200%206a3%203%200%200%201%200-6ZM17%203a3%203%200%201%201%200%206a3%203%200%200%201%200-6ZM8.8%2012.2l6.4%203.6l1-1.7l-6.4-3.6l-1%201.7Zm6.4-4L8.8%2011.8l1%201.7l6.4-3.6l-1-1.7Z%27/%3E%3C/svg%3E\")",
                maskImage:
                  "url(\"data:image/svg+xml,%3Csvg%20xmlns%3D%27http://www.w3.org/2000/svg%27%20viewBox%3D%270%200%2024%2024%27%3E%3Cpath%20fill%3D%27%23000%27%20d%3D%27M7%207a3%203%200%201%201%200%206a3%203%200%200%201%200-6Zm10%2010a3%203%200%201%201%200%206a3%203%200%200%201%200-6ZM17%203a3%203%200%201%201%200%206a3%203%200%200%201%200-6ZM8.8%2012.2l6.4%203.6l1-1.7l-6.4-3.6l-1%201.7Zm6.4-4L8.8%2011.8l1%201.7l6.4-3.6l-1-1.7Z%27/%3E%3C/svg%3E\")",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
                WebkitMaskSize: "70%",
                maskSize: "70%",
              }}
              aria-hidden="true"
            />
            <span className="text-[clamp(1.5rem,5vw,2.35rem)] font-[900] tracking-[-0.03em] text-[#2563eb]">
              Task Manager
            </span>
          </h1>
          <p className="mt-[0.4rem] text-[0.9rem] text-[#6b7280]">
            Streamline your workflow with intelligent task management.
          </p>
        </div>

        {/* Form */}
        <form
          className="mt-[1.5rem] flex flex-col gap-[1rem]"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-[0.4rem] text-left">
            <label className="text-[0.85rem] text-[#4b5563]">Email</label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-[1rem] py-[0.75rem] rounded-[8px] border border-[#d1d5db]
                bg-white text-[#111827] text-[1rem]
                focus:outline-none focus:border-[#2563eb]
                focus:shadow-[0_0_0_1px_rgba(37,99,235,0.3)]"
            />
          </div>

          <div className="flex flex-col gap-[0.4rem] text-left">
            <label className="text-[0.85rem] text-[#4b5563]">Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-[1rem] py-[0.75rem] rounded-[8px] border border-[#d1d5db]
                bg-white text-[#111827] text-[1rem]
                focus:outline-none focus:border-[#2563eb]
                focus:shadow-[0_0_0_1px_rgba(37,99,235,0.3)]"
            />
          </div>

          {error && (
            <div className="text-[0.85rem] text-[#ef4444] bg-[#fee2e2] px-3 py-2 rounded-md">{error}</div>
          )}

          <button
            disabled={loading}
            className="w-full px-[1rem] py-[0.75rem] text-[1rem] rounded-[8px]
              bg-[#2563eb] text-white transition-all
              hover:bg-[#1d4ed8] hover:brightness-105
              hover:shadow-[0_12px_24px_rgba(37,99,235,0.35)]
              hover:-translate-y-[1px]
              disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-[1rem] text-[0.8rem] text-[#6b7280] text-center">
          New here?{" "}
          <Link
            to="/register"
            className="text-[#60a5fa] font-[500] hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

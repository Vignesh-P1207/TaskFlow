import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    try {
      await register(form.fullName, form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Abstract background elements for extra depth */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] mix-blend-multiply opacity-70 animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-container/30 rounded-full blur-[120px] mix-blend-multiply opacity-70 animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>

      <div className="w-full max-w-[440px] relative z-10">
        <div className="glass-panel rounded-2xl p-10 flex flex-col gap-8 shadow-2xl relative">
          {/* Close button to return to Landing page */}
          <Link to="/" className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-surface-variant/30 text-on-surface-variant hover:bg-error-container/50 hover:text-error transition-colors" title="Back to Home">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </Link>

          <header className="flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-container text-on-primary flex items-center justify-center shadow-lg mb-2 transform transition-transform hover:scale-110 duration-700">
              <span className="material-symbols-outlined text-4xl">task_alt</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary tracking-tight">
              TaskFlow
            </h1>
            <p className="text-on-surface-variant text-sm font-medium tracking-wide opacity-90">Create an account to get started.</p>
          </header>

          {error && (
            <div className="bg-error-container/80 backdrop-blur-sm border border-error/20 text-on-error-container text-sm rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm transform animate-fade-in-up">
              <span className="material-symbols-outlined text-[20px] text-error">error</span>
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5 group">
              <label className="text-sm font-semibold text-on-surface-variant ml-1 transition-colors group-focus-within:text-primary">Full Name</label>
              <input
                type="text"
                required
                placeholder="Jane Doe"
                className="w-full px-4 py-3.5 bg-white/60 border border-white/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all shadow-sm font-medium text-on-surface placeholder:text-outline-variant"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1.5 group">
              <label className="text-sm font-semibold text-on-surface-variant ml-1 transition-colors group-focus-within:text-primary">Email</label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                className="w-full px-4 py-3.5 bg-white/60 border border-white/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all shadow-sm font-medium text-on-surface placeholder:text-outline-variant"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1.5 group">
              <label className="text-sm font-semibold text-on-surface-variant ml-1 transition-colors group-focus-within:text-primary">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-3.5 bg-white/60 border border-white/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all shadow-sm font-medium text-on-surface placeholder:text-outline-variant tracking-wider pr-12"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary p-1 focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-primary-container hover:from-primary-container hover:to-primary text-on-primary font-bold py-3.5 rounded-xl shadow-[0_8px_20px_-6px_rgba(79,70,229,0.4)] hover:shadow-[0_12px_25px_-6px_rgba(79,70,229,0.5)] transform hover:-translate-y-0.5 transition-all duration-500 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-[0_8px_20px_-6px_rgba(79,70,229,0.4)] mt-4"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-on-surface-variant text-sm font-medium">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-primary hover:text-secondary-container transition-colors underline decoration-2 underline-offset-4 decoration-primary/30 hover:decoration-secondary-container">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

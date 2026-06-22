import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../api/auth";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Invalid or missing password reset token.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus("error");
      setErrorMessage("Passwords do not match.");
      return;
    }
    
    setStatus("loading");
    setErrorMessage("");

    try {
      await resetPassword({ token, newPassword: password });
      setStatus("success");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err.response?.data?.message || "Failed to reset password. Token may be expired.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] mix-blend-multiply opacity-70 animate-pulse" style={{ animationDuration: '9s' }}></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary-container/30 rounded-full blur-[120px] mix-blend-multiply opacity-70 animate-pulse" style={{ animationDuration: '11s', animationDelay: '1s' }}></div>

      <div className="w-full max-w-[440px] relative z-10">
        <div className="glass-panel rounded-2xl p-10 flex flex-col gap-8 shadow-2xl">
          
          <header className="flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-container text-on-primary flex items-center justify-center shadow-lg mb-2">
              <span className="material-symbols-outlined text-4xl">vpn_key</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary tracking-tight">
              New Password
            </h1>
            <p className="text-on-surface-variant text-sm font-medium tracking-wide opacity-90">
              Please enter your new password below.
            </p>
          </header>

          {status === "error" && (
            <div className="bg-error-container/80 backdrop-blur-sm border border-error/20 text-on-error-container text-sm rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm transform animate-fade-in-up">
              <span className="material-symbols-outlined text-[20px] text-error">error</span>
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {status === "success" ? (
            <div className="bg-emerald-100/80 backdrop-blur-sm border border-emerald-300/50 text-emerald-800 text-sm rounded-xl px-4 py-6 flex flex-col items-center text-center gap-3 shadow-sm transform animate-fade-in-up">
              <span className="material-symbols-outlined text-[40px] text-emerald-600 mb-1">check_circle</span>
              <h3 className="font-bold text-lg text-emerald-900">Password Updated!</h3>
              <p className="font-medium">
                Your password has been successfully reset. Redirecting to login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5 group">
                <label className="text-sm font-semibold text-on-surface-variant ml-1 transition-colors group-focus-within:text-primary">New Password</label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-outline-variant pointer-events-none group-focus-within:text-primary transition-colors">
                    lock
                  </span>
                  <input
                    type="password"
                    required
                    minLength="6"
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3.5 bg-white/60 border border-white/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all shadow-sm font-medium text-on-surface placeholder:text-outline-variant"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={!token}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 group">
                <label className="text-sm font-semibold text-on-surface-variant ml-1 transition-colors group-focus-within:text-primary">Confirm Password</label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-outline-variant pointer-events-none group-focus-within:text-primary transition-colors">
                    lock_reset
                  </span>
                  <input
                    type="password"
                    required
                    minLength="6"
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3.5 bg-white/60 border border-white/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all shadow-sm font-medium text-on-surface placeholder:text-outline-variant"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={!token}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === "loading" || !token}
                className="w-full bg-gradient-to-r from-primary to-primary-container hover:from-primary-container hover:to-primary text-on-primary font-bold py-3.5 rounded-xl shadow-[0_8px_20px_-6px_rgba(79,70,229,0.4)] hover:shadow-[0_12px_25px_-6px_rgba(79,70,229,0.5)] transform hover:-translate-y-0.5 transition-all duration-500 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-[0_8px_20px_-6px_rgba(79,70,229,0.4)] mt-2 flex items-center justify-center gap-2"
              >
                {status === "loading" ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">autorenew</span>
                    Updating...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    Confirm Reset
                  </>
                )}
              </button>
            </form>
          )}

          <div className="text-center pt-2">
            <Link to="/login" className="text-sm font-bold text-primary hover:text-secondary-container transition-colors underline decoration-2 underline-offset-4 decoration-primary/30 hover:decoration-secondary-container">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

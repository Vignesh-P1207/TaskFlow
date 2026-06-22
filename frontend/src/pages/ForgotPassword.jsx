import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await forgotPassword({ email });
      setPreviewUrl(res.previewUrl || "");
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Abstract background elements for extra depth */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] mix-blend-multiply opacity-70 animate-pulse" style={{ animationDuration: '9s' }}></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary-container/30 rounded-full blur-[120px] mix-blend-multiply opacity-70 animate-pulse" style={{ animationDuration: '11s', animationDelay: '1s' }}></div>

      <div className="w-full max-w-[440px] relative z-10">
        <div className="glass-panel rounded-2xl p-10 flex flex-col gap-8 shadow-2xl">
          
          <header className="flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-container text-on-primary flex items-center justify-center shadow-lg mb-2 transform transition-transform hover:scale-110 duration-700">
              <span className="material-symbols-outlined text-4xl">lock_reset</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary tracking-tight">
              Reset Password
            </h1>
            <p className="text-on-surface-variant text-sm font-medium tracking-wide opacity-90">
              Enter your email and we'll send you a recovery link.
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
              <span className="material-symbols-outlined text-[40px] text-emerald-600 mb-1">mark_email_read</span>
              <h3 className="font-bold text-lg text-emerald-900">Email Sent!</h3>
              <p className="font-medium">
                We've sent a password recovery link to <strong>{email}</strong>. Please check your inbox.
              </p>
              
              {previewUrl && (
                <div className="mt-2 w-full p-3 bg-white/60 rounded-lg border border-emerald-200">
                  <p className="text-xs font-bold text-emerald-700 mb-2 uppercase tracking-wide">Developer Demo Mode</p>
                  <a href={previewUrl} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold transition-colors">
                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                    View Generated Email
                  </a>
                </div>
              )}

              <Link to="/login" className="mt-2 px-6 py-2.5 rounded-xl font-bold bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200 hover:shadow-sm transition-all">
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5 group">
                <label className="text-sm font-semibold text-on-surface-variant ml-1 transition-colors group-focus-within:text-primary">Email Address</label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-outline-variant pointer-events-none group-focus-within:text-primary transition-colors">
                    mail
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-white/60 border border-white/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all shadow-sm font-medium text-on-surface placeholder:text-outline-variant"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-gradient-to-r from-primary to-primary-container hover:from-primary-container hover:to-primary text-on-primary font-bold py-3.5 rounded-xl shadow-[0_8px_20px_-6px_rgba(79,70,229,0.4)] hover:shadow-[0_12px_25px_-6px_rgba(79,70,229,0.5)] transform hover:-translate-y-0.5 transition-all duration-500 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-[0_8px_20px_-6px_rgba(79,70,229,0.4)] mt-2 flex items-center justify-center gap-2"
              >
                {status === "loading" ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">autorenew</span>
                    Sending Link...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">send</span>
                    Send Recovery Link
                  </>
                )}
              </button>
            </form>
          )}

          <div className="text-center pt-2">
            <p className="text-on-surface-variant text-sm font-medium">
              Remember your password?{" "}
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

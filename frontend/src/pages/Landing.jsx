import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Landing() {
  const { user } = useAuth();

  // If the user is already logged in, skip the landing page and go to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-surface/30 flex flex-col">
      {/* Premium Background Blurs */}
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-primary/20 rounded-full blur-[120px] mix-blend-multiply opacity-70 animate-pulse" style={{ animationDuration: '9s' }}></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-secondary-container/30 rounded-full blur-[120px] mix-blend-multiply opacity-70 animate-pulse" style={{ animationDuration: '11s', animationDelay: '1s' }}></div>

      <nav className="relative z-10 flex justify-between items-center py-6 px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-[24px]">task_alt</span>
          </div>
          <span className="font-display font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">TaskFlow</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-on-surface-variant font-bold hover:text-primary transition-colors">Log in</Link>
          <Link to="/register" className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">Get Started</Link>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto mt-[-40px]">
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-white/40 border border-white/60 backdrop-blur-sm shadow-sm animate-fade-in-up">
          <span className="text-sm font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">stars</span>
            The ultimate project management tool
          </span>
        </div>
        
        <h1 className="font-display text-5xl md:text-7xl font-extrabold text-on-surface mb-8 leading-tight tracking-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          Manage your work with <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Effortless Precision</span>
        </h1>
        
        <p className="text-lg md:text-xl text-on-surface-variant font-medium mb-12 max-w-2xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          TaskFlow helps teams organize, track, and conquer their projects. Say goodbye to chaos and hello to seamless productivity.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <Link to="/register" className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-8 py-4 rounded-xl font-bold shadow-[0_8px_20px_-6px_rgba(79,70,229,0.4)] hover:shadow-[0_12px_25px_-6px_rgba(79,70,229,0.5)] transform hover:-translate-y-0.5 transition-all duration-500 text-lg flex items-center justify-center gap-2">
            Start for free
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
          <Link to="/login" className="bg-white/50 hover:bg-white/80 border border-white/80 text-on-surface px-8 py-4 rounded-xl font-bold shadow-sm transition-all text-lg flex items-center justify-center">
            Sign in
          </Link>
        </div>
      </main>

      <footer className="relative z-10 py-8 text-center text-on-surface-variant text-sm font-medium">
        &copy; {new Date().getFullYear()} TaskFlow. Built for ultimate productivity.
      </footer>
    </div>
  );
}

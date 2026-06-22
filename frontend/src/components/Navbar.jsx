import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const linkClass = (path) =>
    `relative font-bold text-sm h-full flex items-center px-4 transition-all duration-300 ${
      location.pathname === path
        ? "text-primary"
        : "text-on-surface-variant hover:text-primary"
    }`;

  return (
    <nav className="bg-white/70 backdrop-blur-xl fixed top-0 w-full z-50 shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-b border-white">
      <div className="flex justify-between items-center h-[72px] px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-10">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary flex items-center justify-center shadow-md transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
              <span className="material-symbols-outlined text-[24px]">task_alt</span>
            </div>
            <span className="font-display font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary tracking-tight">
              TaskFlow
            </span>
          </Link>
          <ul className="hidden md:flex items-center gap-2 h-[72px]">
            <li className="h-full flex items-center relative group">
              <Link className={linkClass("/dashboard")} to="/dashboard">
                Dashboard
              </Link>
              {location.pathname === "/dashboard" && (
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full"></div>
              )}
              {location.pathname !== "/dashboard" && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[3px] bg-primary/40 rounded-t-full group-hover:w-full transition-all duration-300"></div>
              )}
            </li>
            <li className="h-full flex items-center relative group">
              <Link className={linkClass("/projects")} to="/projects">
                Projects
              </Link>
              {location.pathname === "/projects" && (
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full"></div>
              )}
              {location.pathname !== "/projects" && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[3px] bg-primary/40 rounded-t-full group-hover:w-full transition-all duration-300"></div>
              )}
            </li>
          </ul>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-4 bg-white/50 px-4 py-1.5 rounded-full border border-white/80 shadow-sm">
            <div className="flex flex-col items-end justify-center min-w-[80px]">
              <span className="text-xs font-bold text-on-surface-variant mb-0.5">Level {user?.level || 1}</span>
              <div className="w-full bg-outline-variant/30 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${(user?.xp || 0) % 100}%` }}
                ></div>
              </div>
            </div>
            <div className="w-px h-8 bg-white/80"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <span className="text-primary font-bold text-sm">
                  {user?.fullName?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <span className="text-sm font-semibold text-on-surface truncate max-w-[100px]">
                {user?.fullName}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-error-container/40 text-on-surface-variant hover:text-error border border-white/80 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            aria-label="Logout"
            title="Logout"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

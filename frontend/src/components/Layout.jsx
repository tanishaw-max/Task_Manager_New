import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const role = user?.role?.toLowerCase();

  return (
    <div className="min-h-screen flex bg-[#f5f5f5] text-[#1f2933] max-md:flex-col">
      <aside className="w-70 p-5 bg-white border-r border-[#e5e7eb] flex flex-col gap-6
                        max-md:w-full max-md:flex-row max-md:items-center max-md:justify-between max-md:flex-wrap max-md:gap-4">
        {/* Brand */}
        <div className="flex flex-col gap-3">
          <div className="relative inline-flex items-center gap-[0.65rem] w-fit px-[0.85rem] py-[0.55rem] rounded-full whitespace-nowrap
                          after:content-[''] after:absolute after:inset-[-6px_-8px] after:rounded-full after:bg-[rgba(37,99,235,0.06)]
                          after:border after:border-[rgba(148,163,184,0.4)] after:-z-10">
            {/* Brand Icon (fixed with mask) */}
            <span
              aria-hidden="true"
              className="w-9 h-9 rounded-xl bg-[#2563eb] shadow-[0_6px_16px_rgba(37,99,235,0.3)] inline-block"
              style={{
                WebkitMaskImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M7 7a3 3 0 1 1 0 6a3 3 0 0 1 0-6Zm10 10a3 3 0 1 1 0 6a3 3 0 0 1 0-6ZM17 3a3 3 0 1 1 0 6a3 3 0 0 1 0-6ZM8.8 12.2l6.4 3.6l1-1.7l-6.4-3.6l-1 1.7Zm6.4-4L8.8 11.8l1 1.7l6.4-3.6l-1-1.7Z'/%3E%3C/svg%3E\")",
                maskImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M7 7a3 3 0 1 1 0 6a3 3 0 0 1 0-6Zm10 10a3 3 0 1 1 0 6a3 3 0 0 1 0-6ZM17 3a3 3 0 1 1 0 6a3 3 0 0 1 0-6ZM8.8 12.2l6.4 3.6l1-1.7l-6.4-3.6l-1 1.7Zm6.4-4L8.8 11.8l1 1.7l6.4-3.6l-1-1.7Z'/%3E%3C/svg%3E\")",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
                WebkitMaskSize: "70%",
                maskSize: "70%",
              }}
            />
            <span className="text-[1.2rem] font-black tracking-[-0.02em] text-[#2563eb] leading-[1.2]">
              Task Manager
            </span>
          </div>

          {/* User Info */}
          <div className="flex flex-col gap-[0.2rem] text-[0.9rem]">
            <span className="font-semibold">{user?.username}</span>
            <span
              className={`inline-flex items-center w-fit px-[0.6rem] py-[0.2rem] rounded-full text-[0.75rem] uppercase tracking-[0.05em]
                ${
                  role === "super-admin"
                    ? "bg-[#fee2e2] text-[#b91c1c]"
                    : role === "manager"
                    ? "bg-[#dbeafe] text-[#2563eb]"
                    : "bg-[#e5e7eb] text-[#1f2933]"
                }
              `}
            >
              {user?.role}
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-2 max-md:flex-row max-md:flex-wrap max-md:gap-x-2 max-md:gap-y-2">
          {[
            { to: "/", label: "Dashboard" },
            { to: "/tasks", label: "Tasks" },
            { to: "/projects", label: "Projects" },
            ...(role === "super-admin" || role === "manager"
              ? [{ to: "/users", label: "Users" }]
              : []),
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`no-underline px-[0.8rem] py-[0.6rem] rounded-[0.6rem] text-[0.95rem] transition-all
                ${
                  location.pathname === item.to
                    ? "bg-[#2563eb] text-white"
                    : "text-[#4b5563] hover:bg-[#eef2ff] hover:translate-x-"
                }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="mt-auto px-[0.8rem] py-[0.6rem] rounded-[0.6rem] border border-[#fecaca] bg-[#fff1f2] text-[#b91c1c]
                     font-medium cursor-pointer transition-all hover:bg-[#fee2e2] hover:border-[#fca5a5] hover:-translate-y-
                     max-md:mt-0"
        >
          Logout
        </button>
      </aside>

      <main className="flex-1 p-6 flex flex-col overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};

export default Layout;

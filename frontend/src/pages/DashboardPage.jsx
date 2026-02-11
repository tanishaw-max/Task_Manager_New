import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/useAuth";
import api from "../services/api";

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 });
  const [recentTasks, setRecentTasks] = useState([]);
  const [dueTasks, setDueTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.getTasks();
        const tasks = res.data || [];
        const counts = tasks.reduce(
          (acc, t) => {
            acc.total += 1;
            acc[t.status?.replace("-", "")] = (acc[t.status?.replace("-", "")] || 0) + 1;
            return acc;
          },
          { total: 0, pending: 0, inprogress: 0, completed: 0 }
        );
        setStats({
          total: counts.total,
          pending: counts.pending,
          inProgress: counts.inprogress,
          completed: counts.completed,
        });

        setRecentTasks(tasks.slice(0, 3));

        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const due = tasks
          .filter((t) => t.dueDate && new Date(t.dueDate) <= today && t.status !== "completed")
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        setDueTasks(due.slice(0, 5));
      } catch (e) {
        console.error("Failed to fetch tasks:", e);
      }
    };
    fetchTasks();
  }, []);

  const handleCardClick = (status) => navigate(`/tasks?filter=${status}`);

  return (
    <Layout>
      {/* HEADER */}
      <div className="flex justify-between items-start mb-8 p-6 rounded-2xl text-white shadow-[0_8px_32px_rgba(102,126,234,0.3)] bg-gradient-to-br from-[#667eea] to-[#764ba2] max-md:flex-col max-md:gap-[1rem] max-md:text-center">
        <div>
          <h1 className="m-0 text-[2rem] font-bold [text-shadow:0_2px_4px_rgba(0,0,0,0.1)] max-md:text-[1.5rem]">
            Welcome back, {user?.username}! 👋
          </h1>
          <p className="mt-2 text-[1rem] opacity-90">
            You are logged in as{" "}
            <span
              className={`inline-flex items-center px-3 py-1rounded-full text-[0.8rem] font-semibold uppercase tracking-[0.05em] backdrop-blur border
                ${
                  user?.role === "super-admin"
                    ? "bg-[rgba(239,68,68,0.2)] border-[rgba(239,68,68,0.3)]"
                    : user?.role === "manager"
                    ? "bg-[rgba(59,130,246,0.2)] border-[rgba(59,130,246,0.3)]"
                    : "bg-[rgba(34,197,94,0.2)] border-[rgba(34,197,94,0.3)]"
                }
              `}
            >
              {user?.role}
            </span>
          </p>
        </div>

        {/* QUICK STATS */}
        <div className="flex flex-col items-end gap-2 max-md:items-center max-md:flex-row max-md:flex-wrap max-md:justify-center">
          <span className="px-4 py-2 rounded-full bg-[rgba(255,255,255,0.15)] backdrop-blur border border-[rgba(255,255,255,0.2)] text-[0.85rem] font-medium">
            📊 {stats.total} Total Tasks
          </span>
          <span className="px-4 py-2 rounded-full bg-[rgba(251,191,36,0.2)] backdrop-blur border border-[rgba(251,191,36,0.3)] text-[0.85rem] font-medium">
            ⏳ {stats.pending} Pending
          </span>
        </div>
      </div>

      {/* STATS GRID */}
      <section className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-[1.5rem] mb-[2rem] max-lg:grid-cols-2 max-md:grid-cols-1">
        {[
          ["Total Tasks", stats.total, "📋", "from-[#6366f1] to-[#8b5cf6]", "all", "from-[#eef2ff] to-[#e0e7ff]"],
          ["Pending", stats.pending, "⏳", "from-[#f59e0b] to-[#eab308]", "pending", "from-[#fffbeb] to-[#fef3c7]"],
          ["In Progress", stats.inProgress, "🔄", "from-[#06b6d4] to-[#0ea5e9]", "in-progress", "from-[#ecfeff] to-[#cffafe]"],
          ["Completed", stats.completed, "✅", "from-[#10b981] to-[#059669]", "completed", "from-[#ecfdf5] to-[#d1fae5]"],
        ].map(([label, value, icon, barGradient, filter, iconGradient]) => (
          <div
            key={label}
            onClick={() => handleCardClick(filter)}
            className="group relative cursor-pointer p-[1.5rem] rounded-[1rem] bg-white border border-[#e5e7eb] flex items-center gap-[1rem]
                       transition-all duration-300 shadow-[0_4px_6px_rgba(0,0,0,0.05)]
                       hover:-translate-y-[4px] hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] overflow-hidden"
          >
            <span
              className={`absolute top-0 left-0 right-0 h-[4px] origin-left scale-x-0 transition-transform duration-300 bg-gradient-to-r ${barGradient} group-hover:scale-x-100`}
            />
            <div className={`text-[2.5rem] w-[60px] h-[60px] flex items-center justify-center rounded-[1rem] bg-gradient-to-br ${iconGradient}`}>
              {icon}
            </div>
            <div className="flex-1">
              <h3 className="m-0 text-[0.9rem] uppercase tracking-[0.05em] text-[#64748b] font-medium">{label}</h3>
              <span className="block mt-[0.25rem] text-[2.25rem] font-bold text-[#1e293b]">{value}</span>
            </div>
          </div>
        ))}
      </section>

      {/* CONTENT GRID */}
      <div className="grid grid-cols-[2fr_1fr] gap-[2rem] max-lg:grid-cols-1">
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-[2rem]">
          {/* PROGRESS */}
          <section className="p-[1.5rem] rounded-[1rem] bg-white border border-[#e5e7eb] shadow-[0_4px_6px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-[1.5rem] pb-[1rem] border-b-[2px] border-[#f1f5f9]">
              <h2 className="m-0 text-[1.25rem] font-semibold text-[#1e293b]">📊 Progress Overview</h2>
            </div>
            <div className="flex items-center gap-[2rem] max-lg:flex-col max-lg:text-center max-lg:gap-[1.5rem]">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - (stats.total ? stats.completed / stats.total : 0))}`}
                  transform="rotate(-90 60 60)"
                  style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
                <text x="60" y="65" textAnchor="middle" className="fill-[#1e293b] text-[1.5rem] font-bold">
                  {stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}%
                </text>
              </svg>
              <div className="flex flex-col gap-[1rem]">
                <div className="flex items-center gap-[0.75rem] text-[0.9rem] text-[#64748b]">
                  <span className="w-[12px] h-[12px] rounded-full bg-[#22c55e]" /> Completed: {stats.completed}
                </div>
                <div className="flex items-center gap-[0.75rem] text-[0.9rem] text-[#64748b]">
                  <span className="w-[12px] h-[12px] rounded-full bg-[#06b6d4]" /> In Progress: {stats.inProgress}
                </div>
                <div className="flex items-center gap-[0.75rem] text-[0.9rem] text-[#64748b]">
                  <span className="w-[12px] h-[12px] rounded-full bg-[#f59e0b]" /> Pending: {stats.pending}
                </div>
              </div>
            </div>
          </section>

          {/* RECENT TASKS */}
          <section className="p-[1.5rem] rounded-[1rem] bg-white border border-[#e5e7eb] shadow-[0_4px_6px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.1)] transition-all">
            <div className="flex justify-between items-center mb-[1.5rem] pb-[1rem] border-b-[2px] border-[#f1f5f9]">
              <h2 className="m-0 text-[1.25rem] font-semibold text-[#1e293b]">📝 Recent Tasks</h2>
              <span onClick={() => navigate("/tasks")} className="text-[#3b82f6] text-[0.9rem] font-medium cursor-pointer hover:text-[#2563eb] transition-colors">
                View All →
              </span>
            </div>
            <div className="flex flex-col gap-[1rem]">
              {recentTasks.length === 0 ? (
                <div className="text-center py-[3rem] px-[1rem] text-[#94a3b8]">
                  <span className="block text-[3rem] mb-[1rem] opacity-50">📝</span>
                  <p>No tasks yet. Create your first task!</p>
                </div>
              ) : (
                recentTasks.map((task) => (
                  <div
                    key={task._id}
                    className="flex justify-between items-start p-[1rem] rounded-[0.75rem] bg-[#f8fafc] border border-[#e2e8f0] hover:bg-[#f1f5f9] hover:border-[#cbd5e1] hover:translate-x-[4px] transition-all"
                  >
                    <div>
                      <h4 className="m-0 mb-[0.25rem] text-[1rem] font-semibold text-[#1e293b]">{task.taskTitle}</h4>
                      <p className="m-0 mb-[0.5rem] text-[0.85rem] text-[#64748b]">{task.description}</p>
                      <span className="text-[0.8rem] text-[#94a3b8]">👤 {task.userId?.username}</span>
                    </div>
                    <span className="px-[1rem] py-[0.5rem] rounded-full text-[0.8rem] font-semibold border bg-yellow-400/10 border-yellow-400/20 text-yellow-500">
                      {task.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-[2rem]">
          {/* DUE TASKS */}
          <section className="p-[1.5rem] rounded-[1rem] bg-white border border-[#e5e7eb] shadow-[0_4px_6px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-[1.5rem] pb-[1rem] border-b-[2px] border-[#f1f5f9]">
              <h2 className="m-0 text-[1.25rem] font-semibold text-[#1e293b]">⚠️ Due Tasks</h2>
            </div>
            <div className="flex flex-col gap-[1rem] max-h-[400px] overflow-y-auto">
              {dueTasks.length === 0 ? (
                <div className="text-center py-[3rem] px-[1rem] text-[#94a3b8]">
                  <span className="block text-[3rem] mb-[1rem] opacity-50">✅</span>
                  <p>No overdue tasks!</p>
                </div>
              ) : (
                dueTasks.map((task) => {
                  const dueDate = new Date(task.dueDate);
                  const isOverdue = dueDate < new Date();
                  const daysDiff = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));

                  return (
                    <div
                      key={task._id}
                      className={`flex justify-between items-start p-[1rem] rounded-[0.75rem] border transition-all hover:translate-x-[4px]
                        ${
                          isOverdue
                            ? "bg-[rgba(239,68,68,0.05)] border-[rgba(239,68,68,0.2)]"
                            : "bg-[#f8fafc] border-[#e2e8f0] hover:bg-[#f1f5f9] hover:border-[#cbd5e1]"
                        }`}
                    >
                      <div>
                        <h4 className="m-0 mb-[0.25rem] text-[1rem] font-semibold text-[#1e293b]">{task.taskTitle}</h4>
                        <p className="m-0 mb-[0.5rem] text-[0.85rem] text-[#64748b]">{task.description}</p>
                        <span className="text-[0.8rem] text-[#94a3b8]">👤 {task.userId?.username}</span>
                        <div className="mt-[0.5rem]">
                          <span
                            className={`px-[0.75rem] py-[0.25rem] rounded-full text-[0.75rem] font-semibold border
                              ${
                                isOverdue
                                  ? "bg-[rgba(239,68,68,0.1)] text-[#dc2626] border-[rgba(239,68,68,0.2)]"
                                  : daysDiff <= 1
                                  ? "bg-[rgba(251,191,36,0.1)] text-[#f59e0b] border-[rgba(251,191,36,0.2)]"
                                  : "bg-[rgba(6,182,212,0.1)] text-[#0891b2] border-[rgba(6,182,212,0.2)]"
                              }`}
                          >
                            {isOverdue ? "🚨 Overdue" : daysDiff === 0 ? "📅 Due Today" : `📅 ${daysDiff} days left`}
                          </span>
                        </div>
                      </div>
                      <span className="px-[1rem] py-[0.5rem] rounded-full text-[0.8rem] font-semibold border bg-cyan-400/10 border-cyan-400/20 text-cyan-600">
                        {task.status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* PERMISSIONS */}
          <section className="p-[1.5rem] rounded-[1rem] bg-white border border-[#e5e7eb] shadow-[0_4px_6px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.1)] transition-all">
            <div className="flex justify-between items-center mb-[1.5rem] pb-[1rem] border-b-[2px] border-[#f1f5f9]">
              <h2 className="m-0 text-[1.25rem] font-semibold text-[#1e293b]">🔐 Your Permissions</h2>
            </div>

            <div className="flex flex-col gap-[1.5rem]">
              {user?.role === "super-admin" && (
                <div className="flex items-start gap-[1rem] p-[1.25rem] rounded-[0.75rem] bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] border border-[#e2e8f0]">
                  <div className="w-[50px] h-[50px] rounded-[0.75rem] flex items-center justify-center text-[1.5rem] bg-gradient-to-br from-[#fef2f2] to-[#fee2e2] border-[2px] border-[#fecaca]">
                    👑
                  </div>
                  <div>
                    <h4 className="m-0 mb-[0.75rem] text-[1.1rem] font-semibold text-[#1e293b]">Super Admin Access</h4>
                    <ul className="list-none p-0 m-0">
                      <li className="mb-[0.5rem] text-[#64748b]">✅ Manage all users and tasks</li>
                      <li className="mb-[0.5rem] text-[#64748b]">✅ Create managers and users</li>
                      <li className="mb-[0.5rem] text-[#64748b]">✅ Full system control</li>
                    </ul>
                  </div>
                </div>
              )}

              {user?.role === "manager" && (
                <div className="flex items-start gap-[1rem] p-[1.25rem] rounded-[0.75rem] bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] border border-[#e2e8f0]">
                  <div className="w-[50px] h-[50px] rounded-[0.75rem] flex items-center justify-center text-[1.5rem] bg-gradient-to-br from-[#eff6ff] to-[#dbeafe] border-[2px] border-[#bfdbfe]">
                    👨💼
                  </div>
                  <div>
                    <h4 className="m-0 mb-[0.75rem] text-[1.1rem] font-semibold text-[#1e293b]">Manager Access</h4>
                    <ul className="list-none p-0 m-0">
                      <li className="mb-[0.5rem] text-[#64748b]">✅ Manage your own tasks</li>
                      <li className="mb-[0.5rem] text-[#64748b]">✅ Manage employee tasks</li>
                      <li className="mb-[0.5rem] text-[#64748b]">❌ Cannot access other managers' data</li>
                    </ul>
                  </div>
                </div>
              )}

              {user?.role === "user" && (
                <div className="flex items-start gap-[1rem] p-[1.25rem] rounded-[0.75rem] bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] border border-[#e2e8f0]">
                  <div className="w-[50px] h-[50px] rounded-[0.75rem] flex items-center justify-center text-[1.5rem] bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] border-[2px] border-[#bbf7d0]">
                    👤
                  </div>
                  <div>
                    <h4 className="m-0 mb-[0.75rem] text-[1.1rem] font-semibold text-[#1e293b]">User Access</h4>
                    <ul className="list-none p-0 m-0">
                      <li className="mb-[0.5rem] text-[#64748b]">✅ Create and manage your tasks</li>
                      <li className="mb-[0.5rem] text-[#64748b]">✅ Update task status</li>
                      <li className="mb-[0.5rem] text-[#64748b]">❌ Cannot access others' tasks</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;

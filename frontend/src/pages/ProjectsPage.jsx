import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import { useAuth } from "../context/useAuth";

const ProjectsPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", members: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);

  const canManageProjects = user?.role === "super-admin" || user?.role === "manager";

  useEffect(() => {
    loadProjects();
    loadUsers();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await api.getProjects();
      setProjects(res.data || []);
    } catch {
      setError("Failed to load projects");
    }
  };

  const loadUsers = async () => {
    try {
      const res = await api.getUsers();
      setUsers(res.data || []);
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.createProject(form);
      setForm({ name: "", description: "", members: [] });
      await loadProjects();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  const handleMemberToggle = (userId) => {
    setForm((prev) => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter((id) => id !== userId)
        : [...prev.members, userId],
    }));
  };

  return (
    <Layout>
      {/* HEADER */}
      <div className="flex justify-between items-start mb-[2rem] p-[1.5rem] rounded-[1rem] text-white shadow-[0_8px_32px_rgba(102,126,234,0.3)] bg-gradient-to-br from-[#667eea] to-[#764ba2]">
        <div>
          <h1 className="m-0 text-[2rem] font-bold [text-shadow:0_2px_4px_rgba(0,0,0,0.1)]">
            Project Management 💼
          </h1>
          <p className="mt-[0.5rem] text-[1rem] opacity-90">
            Organize tasks and team members by projects
          </p>
        </div>

        <div className="flex flex-col items-end gap-[0.5rem]">
          <span className="px-[1rem] py-[0.5rem] rounded-full bg-[rgba(255,255,255,0.15)] backdrop-blur border border-[rgba(255,255,255,0.2)] text-[0.85rem] font-medium">
            📊 {projects.length} Total Projects
          </span>
          <span className="px-[1rem] py-[0.5rem] rounded-full bg-[rgba(34,197,94,0.2)] backdrop-blur border border-[rgba(34,197,94,0.3)] text-[0.85rem] font-medium">
            👥 {projects.reduce((acc, p) => acc + (p.members?.length || 0), 0)} Team Members
          </span>
        </div>
      </div>

      {/* LAYOUT */}
      <div className="grid grid-cols-[1fr_2fr] gap-[2rem] max-[768px]:grid-cols-1">
        {/* FORM */}
        {canManageProjects && (
          <section className="p-[1.5rem] rounded-[1rem] bg-white border border-[#e5e7eb] shadow-[0_4px_8px_rgba(0,0,0,0.1)]">
            <h2 className="mb-[1.5rem] text-[#111827]">Create Project</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-[1rem]">
                <label className="block mb-[0.5rem] font-medium text-[#374151]">
                  Project Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full p-[0.75rem] border border-[#d1d5db] rounded-[0.5rem] text-[0.9rem]
                             focus:outline-none focus:border-[#3b82f6]
                             focus:shadow-[0_0_0_2px_rgba(59,130,246,0.2)]"
                />
              </div>

              <div className="mb-[1rem]">
                <label className="block mb-[0.5rem] font-medium text-[#374151]">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-[0.75rem] border border-[#d1d5db] rounded-[0.5rem] text-[0.9rem]
                             focus:outline-none focus:border-[#3b82f6]
                             focus:shadow-[0_0_0_2px_rgba(59,130,246,0.2)]"
                />
              </div>

              <div className="mb-[1rem]">
                <label className="block mb-[0.5rem] font-medium text-[#374151]">
                  Team Members
                </label>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[0.5rem] max-h-[200px] overflow-y-auto p-[0.5rem] border border-[#e5e7eb] rounded-[0.5rem]">
                  {users.map((u) => (
                    <label
                      key={u._id}
                      className="flex items-center gap-[0.5rem] p-[0.5rem] rounded-[0.25rem] cursor-pointer transition-colors hover:bg-[#f3f4f6]"
                    >
                      <input
                        type="checkbox"
                        checked={form.members.includes(u._id)}
                        onChange={() => handleMemberToggle(u._id)}
                      />
                      <span>
                        {u.username} ({u.role})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {error && (
                <div className="mb-[1rem] p-[0.75rem] bg-[rgba(239,68,68,0.1)] text-[#dc2626] rounded-[0.5rem] text-[0.9rem]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full p-[0.75rem] rounded-[0.5rem] bg-gradient-to-br from-[#3b82f6] to-[#2563eb]
                           text-white font-medium transition-all hover:-translate-y-[1px]
                           hover:shadow-[0_4px_12px_rgba(59,130,246,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Project"}
              </button>
            </form>
          </section>
        )}

        {/* PROJECTS */}
        <section className="p-[1.5rem] rounded-[1rem] bg-white border border-[#e5e7eb] shadow-[0_4px_8px_rgba(0,0,0,0.1)]">
          <h2 className="mb-[1.5rem] text-[#111827]">Projects</h2>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-[1.5rem] max-[768px]:grid-cols-1">
            {projects.map((project) => {
              const isOpen = selectedProject?._id === project._id;

              return (
                <div key={project._id} className="w-full">
                  {/* CARD */}
                  <div
                    onClick={() => setSelectedProject(isOpen ? null : project)}
                    className="p-[1.5rem] rounded-[1rem] bg-white border border-[#e5e7eb] cursor-pointer transition-all
                               hover:-translate-y-[2px] hover:shadow-[0_8px_16px_rgba(0,0,0,0.1)] hover:border-[#3b82f6]"
                  >
                    <h3 className="mb-[0.5rem] text-[#111827] text-[1.25rem]">
                      {project.name}
                    </h3>
                    <p className="mb-[1rem] text-[#6b7280] text-[0.9rem]">
                      {project.description}
                    </p>

                    <div className="flex gap-[1rem] mb-[1rem] text-[#6b7280] text-[0.85rem]">
                      <span>👥 {project.members?.length || 0} members</span>
                      <span>📋 {project.tasks?.length || 0} tasks</span>
                    </div>

                    <div className="flex items-center gap-[0.25rem]">
                      {project.members?.slice(0, 3).map((m) => (
                        <span
                          key={m._id}
                          className="w-[32px] h-[32px] rounded-full bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6]
                                     text-white flex items-center justify-center text-[0.8rem] font-semibold"
                        >
                          {m.username[0].toUpperCase()}
                        </span>
                      ))}
                      {project.members?.length > 3 && (
                        <span className="ml-[0.5rem] text-[#6b7280] text-[0.8rem]">
                          +{project.members.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* INLINE DETAILS */}
                  {isOpen && (
                    <div className="mt-[1rem] p-[1.5rem] rounded-[1rem] bg-white border border-[#e5e7eb] shadow-[0_4px_8px_rgba(0,0,0,0.1)]">
                      <p className="mb-[1rem]">{project.description}</p>

                      <div className="grid grid-cols-2 gap-[2rem] max-[768px]:grid-cols-1">
                        {/* MEMBERS */}
                        <div>
                          <h3 className="mb-[1rem] text-[#111827] text-[1.1rem]">
                            Team Members ({project.members?.length || 0})
                          </h3>

                          <div className="flex flex-col gap-[0.75rem]">
                            {project.members?.map((m) => (
                              <div
                                key={m._id}
                                className="flex items-center gap-[0.75rem] p-[0.75rem] bg-[#f8fafc] rounded-[0.5rem]"
                              >
                                <span className="w-[32px] h-[32px] rounded-full bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6]
                                                 text-white flex items-center justify-center text-[0.8rem] font-semibold">
                                  {m.username[0].toUpperCase()}
                                </span>
                                <div>
                                  <div className="font-medium text-[#111827]">
                                    {m.username}
                                  </div>
                                  <div className="text-[0.8rem] text-[#6b7280] capitalize">
                                    {m.role}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* TASKS */}
                        <div>
                          <h3 className="mb-[1rem] text-[#111827] text-[1.1rem]">
                            Tasks ({project.tasks?.length || 0})
                          </h3>

                          <div className="flex flex-col gap-[0.75rem]">
                            {project.tasks?.map((task) => (
                              <div
                                key={task._id}
                                className="flex justify-between items-center p-[0.75rem] bg-[#f8fafc] rounded-[0.5rem]"
                              >
                                <div>
                                  <div className="font-medium text-[#111827]">
                                    {task.taskTitle}
                                  </div>
                                  <div className="text-[0.8rem] text-[#6b7280]">
                                    👤 {task.userId?.username}
                                  </div>
                                </div>

                                <span
                                  className={`px-[0.75rem] py-[0.25rem] rounded-full text-[0.75rem] font-medium
                                    ${
                                      task.status === "pending"
                                        ? "bg-[rgba(251,191,36,0.1)] text-[#f59e0b]"
                                        : task.status === "in-progress"
                                        ? "bg-[rgba(6,182,212,0.1)] text-[#0891b2]"
                                        : "bg-[rgba(16,185,129,0.1)] text-[#059669]"
                                    }`}
                                >
                                  {task.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ProjectsPage;

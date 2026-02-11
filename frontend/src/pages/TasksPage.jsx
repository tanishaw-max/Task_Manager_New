import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";
import { useAuth } from "../context/useAuth";

const emptyForm = { taskTitle: "", description: "", userId: "", dueDate: "", projectId: "" };

const TasksPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const role = user?.role?.toLowerCase();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const pendingCount = useMemo(() => tasks.filter((t) => t.status === "pending").length, [tasks]);
  const inProgressCount = useMemo(() => tasks.filter((t) => t.status === "in-progress").length, [tasks]);
  const completedCount = useMemo(() => tasks.filter((t) => t.status === "completed").length, [tasks]);

  const canAssignToOthers = role === "super-admin" || role === "manager";

  const loadTasks = async () => {
    try {
      const res = await api.getTasks();
      setTasks(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tasks");
    }
  };

  const filterTasks = (status) => {
    if (status === "all") setFilteredTasks(tasks);
    else setFilteredTasks(tasks.filter((task) => task.status === status));
    setActiveFilter(status);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const filterParam = urlParams.get("filter");
    if (filterParam) setActiveFilter(filterParam);
  }, [location]);

  useEffect(() => {
    filterTasks(activeFilter);
  }, [tasks, activeFilter]);

  const loadUsers = async () => {
    if (!canAssignToOthers) return;
    try {
      const res = await api.getUsers();
      setUsers(res.data || []);
    } catch {
      setError("Failed to load users");
    }
  };

  const loadProjects = async () => {
    try {
      const res = await api.getProjects();
      setProjects(res.data || []);
    } catch { 
      setError("Failed to load projects");
    }
  };

  useEffect(() => {
    loadTasks();
    loadUsers();
    loadProjects();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "projectId") setForm((p) => ({ ...p, [name]: value, userId: "" }));
    else setForm((p) => ({ ...p, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = { taskTitle: form.taskTitle, description: form.description };
      if (form.dueDate) payload.dueDate = form.dueDate;
      if (form.projectId) payload.projectId = form.projectId;
      if (canAssignToOthers && form.userId) payload.userId = form.userId;
      await api.createTask(payload);
      setForm(emptyForm);
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const note = `Status changed to ${status}`;
      await api.updateTask(id, { status, note });
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({ taskTitle: "", description: "" });

  const handleEdit = (task) => {
    setEditingTask(task._id);
    setEditForm({ taskTitle: task.taskTitle, description: task.description });
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditForm({ taskTitle: "", description: "" });
  };

  const handleUpdateTask = async (id) => {
    try {
      await api.updateTask(id, editForm);
      setEditingTask(null);
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update task");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.deleteTask(id);
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete task");
    }
  };

  return (
    <Layout>
      {/* HEADER */}
      <div className="flex justify-between items-start mb-[2rem] p-[1.5rem] rounded-[1rem] text-white shadow-[0_8px_32px_rgba(102,126,234,0.3)] bg-gradient-to-br from-[#667eea] to-[#764ba2]">
        <div>
          <h1 className="m-0 text-[2rem] font-bold [text-shadow:0_2px_4px_rgba(0,0,0,0.1)]">Task Management 📋</h1>
          <p className="mt-[0.5rem] text-[1rem] opacity-90">
            {role === "super-admin" && "You can manage all tasks and assign to any user."}
            {role === "manager" && "You can manage your tasks and employees (users) tasks, but not other managers."}
            {role === "user" && "You can manage only your own tasks."}
          </p>
        </div>
        <div className="flex flex-col items-end gap-[0.5rem]">
          <span className="px-[1rem] py-[0.5rem] rounded-full bg-[rgba(255,255,255,0.15)] backdrop-blur border border-[rgba(255,255,255,0.2)] text-[0.85rem] font-medium">
            📊 {tasks.length} Total Tasks
          </span>
          <span className="px-[1rem] py-[0.5rem] rounded-full bg-[rgba(251,191,36,0.2)] backdrop-blur border border-[rgba(251,191,36,0.3)] text-[0.85rem] font-medium">
            ⏳ {pendingCount} Pending
          </span>
        </div>
      </div>

      {/* LAYOUT */}
      <div className="mt-[1.5rem] grid grid-cols-[minmax(0,320px)_minmax(0,1fr)] gap-[1.5rem] max-[900px]:grid-cols-1">
        {/* FORM */}
        <section className="p-[1.5rem] rounded-[1rem] bg-white border border-[#e5e7eb] shadow-[0_4px_8px_rgba(15,23,42,0.08)] hover:shadow-[0_8px_12px_rgba(0,0,0,0.15)] transition-all">
          <h2 className="mb-[1rem] text-[1.05rem] text-[#111827]">Create task</h2>

          <form className="flex flex-col gap-[0.9rem]" onSubmit={handleCreate} autoComplete="off">
            {/* Title */}
            <div className="flex flex-col gap-[0.5rem]">
              <label htmlFor="taskTitle" className="text-[0.85rem] text-[#4b5563]">Title</label>
              <input
                id="taskTitle"
                name="taskTitle"
                value={form.taskTitle}
                onChange={handleChange}
                required
                className="px-[0.85rem] py-[0.65rem] rounded-[0.6rem] border border-[#d1d5db] text-[0.9rem]
                           focus:outline-none focus:border-[#2563eb] focus:shadow-[0_0_0_2px_rgba(37,99,235,0.2)] focus:-translate-y-[1px] transition-all"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-[0.5rem]">
              <label htmlFor="description" className="text-[0.85rem] text-[#4b5563]">Description</label>
              <textarea
                id="description"
                rows={3}
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                className="px-[0.85rem] py-[0.65rem] rounded-[0.6rem] border border-[#d1d5db] text-[0.9rem]
                           focus:outline-none focus:border-[#2563eb] focus:shadow-[0_0_0_2px_rgba(37,99,235,0.2)] focus:-translate-y-[1px] transition-all"
              />
            </div>

            {/* Due Date */}
            <div className="flex flex-col gap-2">
              <label htmlFor="dueDate" className="text-[0.85rem] text-[#4b5563]">Due Date</label>
              <input
                id="dueDate"
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="px-[0.85rem] py-[0.65rem] rounded-[0.6rem] border border-[#d1d5db] text-[0.9rem]
                           focus:outline-none focus:border-[#2563eb] focus:shadow-[0_0_0_2px_rgba(37,99,235,0.2)] focus:-translate-y- transition-all"
              />
            </div>

            {/* Project */}
            <div className="flex flex-col gap-2">
              <label htmlFor="projectId" className="text-[0.85rem] text-[#4b5563]">Project</label>
              <select
                id="projectId"
                name="projectId"
                value={form.projectId}
                onChange={handleChange}
                className="px-[0.85rem] py-[0.65rem] rounded-[0.6rem] border border-[#d1d5db] text-[0.9rem] bg-white"
              >
                <option value="">Select project (optional)</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Assign */}
            {canAssignToOthers && (
              <div className="flex flex-col gap-2">
                <label htmlFor="userId" className="text-[0.85rem] text-[#4b5563]">Assign to</label>
                <select
                  id="userId"
                  name="userId"
                  value={form.userId}
                  onChange={handleChange}
                  className="px-[0.85rem] py-[0.65rem] rounded-[0.6rem] border border-[#d1d5db] text-[0.9rem] bg-white"
                >
                  <option value="">Select user (optional)</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.username}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-[rgba(220,38,38,0.1)] border border-[rgba(220,38,38,0.3)] text-[#fecaca] text-[0.85rem]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-[0.7rem] rounded-[0.6rem] bg-linear-to-br from-[#3b82f6] to-[#2563eb]
                         text-white text-[0.9rem] font-medium transition-all hover:-translate-y-
                         hover:shadow-[0_4px_12px_rgba(59,130,246,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create task"}
            </button>
          </form>
        </section>

        {/* TASK LIST */}
        <section className="p-6 rounded-2xl bg-white border border-[#e5e7eb] shadow-[0_4px_8px_rgba(15,23,42,0.08)] hover:shadow-[0_8px_12px_rgba(0,0,0,0.15)] transition-all">
          <h2 className="mb-4 text-[1.05rem] text-[#111827]">Task list</h2>

          {/* FILTERS */}
          <div className="flex flex-wrap gap-2 mb-4">
            {["all", "pending", "in-progress", "completed"].map((f) => (
              <button
                key={f}
                onClick={() => filterTasks(f)}
                className={`px-4 py-2 rounded-[0.6rem] border text-[0.85rem] transition-all
                  ${
                    activeFilter === f
                      ? "bg-linear-to-br from-[#3b82f6] to-[#2563eb] text-white border-[#2563eb] shadow-[0_2px_8px_rgba(59,130,246,0.3)]"
                      : "bg-white text-[#6b7280] border-[#d1d5db] hover:border-[#2563eb] hover:text-[#2563eb] hover:-translate-y-"
                  }`}
              >
                {f === "all" && `All (${tasks.length})`}
                {f === "pending" && `⏳ Pending (${pendingCount})`}
                {f === "in-progress" && `🔄 In Progress (${inProgressCount})`}
                {f === "completed" && `✅ Completed (${completedCount})`}
              </button>
            ))}
          </div>

          {/* TASKS */}
          <div className="mt-2 flex flex-col gap-[0.8rem] max-h-[480px] overflow-y-auto">
            {filteredTasks.length === 0 && (
              <p className="text-[#9ca3af] text-[0.9rem] text-center p-[2rem]">
                No {activeFilter === "all" ? "" : activeFilter} tasks yet.
              </p>
            )}

            {filteredTasks.map((t) => (
              <article
                key={t._id}
                className="p-[1.25rem] rounded-[0.9rem] bg-white border border-[#e5e7eb]
                           transition-all hover:border-[#2563eb] hover:-translate-y-[2px]
                           hover:shadow-[0_4px_12px_rgba(37,99,235,0.2)]"
              >
                {/* Header */}
                <div className="flex justify-between items-start gap-[0.5rem]">
                  <div>
                    <h3 className="m-0 text-[1rem] text-[#111827]">{t.taskTitle}</h3>
                    <p className="mt-[0.2rem] text-[0.8rem] text-[#6b7280]">
                      Assigned to: {t.userId?.username} ({t.userId?.email})
                      {t.dueDate && <> • Due: {new Date(t.dueDate).toLocaleDateString()}</>}
                      {t.projectId?.name && <> • Project: {t.projectId.name}</>}
                    </p>
                    <p className="mt-[0.2rem] text-[0.8rem] text-[#9ca3af]">
                      Created: {new Date(t.createdAt).toLocaleString()}
                      {t.updatedAt !== t.createdAt && <> • Updated: {new Date(t.updatedAt).toLocaleString()}</>}
                    </p>
                  </div>

                  <span
                    className={`px-[0.75rem] py-[0.35rem] rounded-full text-[0.75rem] font-medium capitalize whitespace-nowrap border
                      ${
                        t.status === "pending"
                          ? "bg-gradient-to-br from-[rgba(234,179,8,0.2)] to-[rgba(234,179,8,0.1)] text-[#facc15] border-[rgba(234,179,8,0.3)]"
                          : t.status === "in-progress"
                          ? "bg-gradient-to-br from-[rgba(56,189,248,0.2)] to-[rgba(56,189,248,0.1)] text-[#38bdf8] border-[rgba(56,189,248,0.3)]"
                          : "bg-gradient-to-br from-[rgba(22,163,74,0.2)] to-[rgba(22,163,74,0.1)] text-[#22c55e] border-[rgba(22,163,74,0.3)]"
                      }`}
                  >
                    {t.status}
                  </span>
                </div>

                <p className="mt-[0.5rem] mb-[0.8rem] text-[0.9rem] text-[#4b5563]">{t.description}</p>

                {/* History */}
                {t.statusHistory?.length > 0 && (
                  <div className="mt-[1rem] p-[0.75rem] bg-[#f9fafb] rounded-[0.5rem] text-[0.85rem] border-l-[3px] border-[#2563eb]">
                    <strong className="block mb-[0.5rem] text-[#d1d5db]">Status History:</strong>
                    <ul className="mt-[0.5rem] pl-[1.25rem] list-none">
                      {t.statusHistory
                        .slice()
                        .reverse()
                        .map((h, i) => (
                          <li key={i} className="mb-[0.5rem] text-[#9ca3af] pl-[0.5rem]">
                            <span className="text-[#60a5fa] font-medium">{h.status}</span> by{" "}
                            {h.changedBy?.username || "System"} on{" "}
                            {new Date(h.changedAt).toLocaleString()}
                            {h.note && (
                              <span className="block ml-[1rem] mt-[0.25rem] italic text-[#6b7280]">
                                {h.note}
                              </span>
                            )}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-[0.6rem] mt-[0.8rem]">
                  <select
                    value={t.status}
                    onChange={(e) => handleStatusChange(t._id, e.target.value)}
                    className="px-[0.75rem] py-[0.5rem] rounded-[0.6rem] border border-[#d1d5db] text-[0.85rem] bg-white
                               hover:border-[#2563eb] transition-all cursor-pointer"
                  >
                    <option value="pending">⏳ Pending</option>
                    <option value="in-progress">🔄 In Progress</option>
                    <option value="completed">✅ Completed</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleEdit(t)}
                    className="px-[0.75rem] py-[0.5rem] rounded-[0.6rem] border border-[rgba(37,99,235,0.4)] bg-[#eff6ff]
                               text-[#1d4ed8] text-[0.8rem] transition-all hover:bg-[rgba(59,130,246,0.3)] hover:-translate-y-[1px]"
                  >
                    ✏️ Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(t._id)}
                    className="px-[0.75rem] py-[0.5rem] rounded-[0.6rem] border border-[rgba(248,113,113,0.5)] bg-[#fef2f2]
                               text-[#b91c1c] text-[0.8rem] transition-all hover:bg-[rgba(220,38,38,0.3)] hover:-translate-y-[1px]"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default TasksPage;

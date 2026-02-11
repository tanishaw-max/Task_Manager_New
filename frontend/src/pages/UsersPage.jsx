import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import { useAuth } from "../context/useAuth";

const UsersPage = () => {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingBaseUser, setEditingBaseUser] = useState(null);

  const initialFormState = {
    username: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    roleTitle: "user",
    isActive: true,
  };

  const [form, setForm] = useState(initialFormState);
  const isSuperAdmin = role === "super-admin";

  const loadUsers = async () => {
    try {
      const res = await api.getUsers();
      setUsers(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const resetForm = () => {
    setForm(initialFormState);
    setShowForm(false);
    setEditingUserId(null);
    setEditingBaseUser(null);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.createUser(form);
      setSuccess("User created successfully!");
      resetForm();
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (u) => {
    setEditingUserId(u._id);
    setEditingBaseUser(u);
    setForm({
      username: u.username || "",
      email: u.email || "",
      password: "",
      phone: u.phone || "",
      address: u.address || "",
      roleTitle: u.roleId?.roleTitle || "user",
      isActive: u.isActive,
    });
    setShowForm(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const updateData = {};
      ["username", "phone", "address"].forEach((f) => {
        if (form[f]?.trim() && form[f] !== editingBaseUser[f]) {
          updateData[f] = form[f].trim();
        }
      });
      if (form.password?.trim()) updateData.password = form.password.trim();
      updateData.roleTitle = form.roleTitle;
      if (form.isActive !== editingBaseUser.isActive)
        updateData.isActive = form.isActive;

      await api.updateUser(editingUserId, updateData);
      setSuccess("User updated successfully!");
      resetForm();
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.deleteUser(id);
      setSuccess("User deleted successfully!");
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-start gap-4 mb-8 p-6 bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)] rounded-2xl text-white shadow-[0_8px_32px_rgba(102,126,234,0.3)] max-[1024px]:flex-col max-[1024px]:text-center">
        <div>
          <h1 className="m-0 text-[2rem] font-bold [text-shadow:0_2px_4px_rgba(0,0,0,0.1)] max-[768px]:text-[1.5rem]">
            Users
          </h1>
          <p className="mt-2 opacity-90">
            {role === "super-admin" &&
              "Manage all users: create, update, and delete accounts."}
            {role === "manager" &&
              "View your team members (employees with user role)."}
            {role === "user" && "View user information."}
          </p>
        </div>
      </div>

      {isSuperAdmin && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setShowForm(true)}
            className="w-full px-8 py-4 rounded-xl bg-[linear-gradient(135deg,#3b82f6,#2563eb)] text-white font-semibold transition-all hover:-translate-y-[2px] hover:shadow-[0_8px_20px_rgba(59,130,246,0.4)] flex  gap-2"
          >
            ➕ Add User
          </button>
        </div>
      )}

      {(showForm || editingUserId) && isSuperAdmin && (
        <section className="relative overflow-hidden mt-6 p-6 rounded-2xl bg-white border border-[#e5e7eb] shadow-[0_4px_8px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-[2px] hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] before:absolute before:top-0 before:left-0 before:right-0 before:h-[4px] before:bg-[linear-gradient(90deg,#3b82f6,#8b5cf6)] before:scale-x-0 hover:before:scale-x-100 before:origin-left before:transition-transform">
          <h2 className="mb-6 text-[#1e293b] text-xl font-semibold flex items-center gap-2">
            👤 {editingUserId ? "Edit User" : "Create User"}
          </h2>

          <form onSubmit={editingUserId ? handleUpdate : handleCreate}>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5 mb-6">
              {["username", "email", "password", "phone", "address"].map((field) => (
                <div key={field} className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-[#374151] capitalize">
                    {field}
                  </label>
                  <input
                    name={field}
                    value={form[field]}
                    onChange={handleChange}
                    className="px-4 py-3 rounded-xl border-2 border-[#e5e7eb] transition-all hover:border-[#d1d5db] focus:border-[#3b82f6] focus:ring-[3px] focus:ring-[rgba(59,130,246,0.1)] focus:-translate-y-[1px]"
                  />
                </div>
              ))}
            </div>

            {error && (
              <div className="p-4 mb-6 rounded-xl bg-[linear-gradient(135deg,#fef2f2,#fee2e2)] border-2 border-[#fecaca] text-[#dc2626] font-medium flex items-center gap-2">
                ⚠️ {error}
              </div>
            )}
            {success && (
              <div className="p-4 mb-6 rounded-xl bg-[linear-gradient(135deg,#f0fdf4,#dcfce7)] border-2 border-[#bbf7d0] text-[#16a34a] font-medium flex items-center gap-2">
                ✅ {success}
              </div>
            )}

            <div className="flex gap-4 justify-end max-[768px]:flex-col">
              <button
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-[linear-gradient(135deg,#3b82f6,#2563eb)] text-white font-semibold transition-all hover:-translate-y-[2px] hover:shadow-[0_8px_20px_rgba(59,130,246,0.4)]"
              >
                {loading ? "Saving..." : editingUserId ? "Update User" : "Create User"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 rounded-xl border-2 border-[#e5e7eb] text-gray-500 transition-all hover:bg-[#f9fafb] hover:border-[#d1d5db] hover:-translate-y-[1px]"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="relative overflow-hidden mt-6 p-6 rounded-2xl bg-white border border-[#e5e7eb] shadow-[0_4px_8px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-[2px] hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] before:absolute before:top-0 before:left-0 before:right-0 before:h-[4px] before:bg-[linear-gradient(90deg,#3b82f6,#8b5cf6)] before:scale-x-0 hover:before:scale-x-100 before:origin-left before:transition-transform">
        <div className="grid grid-cols-[2fr_3fr_1.5fr_1fr_2fr] gap-5 p-4 rounded-xl bg-[linear-gradient(135deg,#f8fafc,#f1f5f9)] border-2 border-[#e2e8f0] uppercase tracking-wider font-bold text-sm text-[#374151] mb-4">
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Status</span>
          {isSuperAdmin && <span>Actions</span>}
        </div>

        <div className="flex flex-col gap-3">
          {users.map((u) => (
            <div
              key={u._id}
              className="grid grid-cols-[2fr_3fr_1.5fr_1fr_2fr] gap-5 p-4 rounded-xl bg-white border-2 border-[#f1f5f9] transition-all hover:bg-[linear-gradient(135deg,#eff6ff,#dbeafe)] hover:border-[#bfdbfe] hover:translate-x-[4px] hover:shadow-[0_4px_12px_rgba(59,130,246,0.15)]"
            >
              <span>{u.username}</span>
              <span>{u.email}</span>
              <span>{u.roleId?.roleTitle}</span>
              <span className={u.isActive ? "text-[#059669] font-semibold" : "text-[#dc2626] font-semibold"}>
                {u.isActive ? "✓ Active" : "✗ Inactive"}
              </span>
              {isSuperAdmin && (
                <span className="flex gap-3">
                  <button
                    onClick={() => handleEdit(u)}
                    className="px-4 py-2 rounded-lg border-2 border-[#bfdbfe] bg-[linear-gradient(135deg,#eff6ff,#dbeafe)] text-[#2563eb] text-xs font-semibold transition-all hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(u._id)}
                    className="px-4 py-2 rounded-lg border-2 border-[#fecaca] bg-[linear-gradient(135deg,#fef2f2,#fee2e2)] text-[#dc2626] text-xs font-semibold transition-all hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(220,38,38,0.3)]"
                  >
                    🗑️ Delete
                  </button>
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default UsersPage;

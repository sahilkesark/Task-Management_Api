import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  User,
  LogOut,
  Plus,
  Search,
  Bell,
  Menu,
  X,
  Clock3,
  CircleCheck,
  CircleDot,
  AlertCircle,
  Trash2,
} from "lucide-react";
import api from "./api";
import "./App.css";

const STATUS_CYCLE = ["pending", "in progress", "completed"];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function initials(name) {
  if (!name) return "TF";
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function statusClass(status) {
  const value = (status || "").toLowerCase().replace("_", " ");
  if (value === "completed" || value === "done") return "done";
  if (value === "in progress") return "progress";
  return "pending";
}

function nextStatus(status) {
  const current = (status || "pending").toLowerCase();
  const index = STATUS_CYCLE.indexOf(current);
  return STATUS_CYCLE[(index + 1) % STATUS_CYCLE.length];
}

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [page, setPage] = useState("dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");

  const loginSuccess = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    if (!token) return;

    const loadUser = async () => {
      try {
        const response = await api.get("/me");
        setUser(response.data);
      } catch {
        logout();
      }
    };

    loadUser();
  }, [token]);

  if (!token) {
    return <AuthPage onLogin={loginSuccess} />;
  }

  return (
    <div className="app">
      <Sidebar
        page={page}
        setPage={setPage}
        logout={logout}
        mobileMenu={mobileMenu}
        setMobileMenu={setMobileMenu}
        user={user}
      />

      <main className="main-content">
        <header className="topbar">
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenu(true)}
          >
            <Menu size={22} />
          </button>

          <div className="search-box">
            <Search size={18} />
            <input
              placeholder="Search projects and tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="topbar-right">
            <button className="icon-btn" type="button" aria-label="Notifications">
              <Bell size={19} />
            </button>
            <div className="top-avatar">{initials(user?.name)}</div>
          </div>
        </header>

        <div className="page-container">
          {page === "dashboard" && (
            <Dashboard setPage={setPage} user={user} search={search} />
          )}
          {page === "projects" && <Projects search={search} />}
          {page === "tasks" && <Tasks search={search} />}
          {page === "profile" && <Profile user={user} />}
        </div>
      </main>
    </div>
  );
}

function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");

  return mode === "login" ? (
    <Login onLogin={onLogin} switchMode={() => setMode("register")} />
  ) : (
    <Register switchMode={() => setMode("login")} />
  );
}

function Login({ onLogin, switchMode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      onLogin(response.data.access_token);
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card">
        <div className="brand auth-brand">
          <div className="brand-icon">T</div>
          <span>TaskFlow</span>
        </div>
        <h1>Welcome back</h1>
        <p className="auth-subtitle">Sign in to continue to your workspace.</p>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={submit}>
          <label>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="primary-btn full-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="switch-text">
          Don't have an account?{" "}
          <button type="button" onClick={switchMode}>
            Create one
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}

function Register({ switchMode }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.post("/auth/register", { name, email, password });
      setSuccess("Account created. Taking you to sign in...");
      setTimeout(switchMode, 1200);
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card">
        <div className="brand auth-brand">
          <div className="brand-icon">T</div>
          <span>TaskFlow</span>
        </div>
        <h1>Create account</h1>
        <p className="auth-subtitle">Start managing your projects today.</p>
        {error && <div className="error-box">{error}</div>}
        {success && <div className="success-box">{success}</div>}
        <form onSubmit={submit}>
          <label>Full Name</label>
          <input
            placeholder="Sahil Kesarkar"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <label>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label>Password</label>
          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <button className="primary-btn full-btn" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
        <p className="switch-text">
          Already have an account?{" "}
          <button type="button" onClick={switchMode}>
            Sign in
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}

function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <div className="auth-left">
        <div>
          <div className="brand auth-logo">
            <div className="brand-icon">T</div>
            <span>TaskFlow</span>
          </div>
          <h2>
            Quiet focus.
            <br />
            <span>Clear progress.</span>
          </h2>
          <p>
            Plan projects, move tasks, and keep your team aligned in one
            calm workspace.
          </p>
          <ul className="auth-points">
            <li>Projects you actually own</li>
            <li>Tasks with real status updates</li>
            <li>A dashboard that reflects live work</li>
          </ul>
        </div>
      </div>
      <div className="auth-right">{children}</div>
    </div>
  );
}

function Sidebar({ page, setPage, logout, mobileMenu, setMobileMenu, user }) {
  const navigate = (target) => {
    setPage(target);
    setMobileMenu(false);
  };

  return (
    <>
      {mobileMenu && (
        <div className="sidebar-overlay" onClick={() => setMobileMenu(false)} />
      )}
      <aside className={`sidebar ${mobileMenu ? "open" : ""}`}>
        <div className="sidebar-top">
          <div className="brand">
            <div className="brand-icon">T</div>
            <span>TaskFlow</span>
          </div>
          <button
            className="close-sidebar"
            onClick={() => setMobileMenu(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="workspace">
          <div className="workspace-avatar">{initials(user?.name)}</div>
          <div>
            <strong>{user?.name || "My Workspace"}</strong>
            <small>{user?.email || "Personal"}</small>
          </div>
        </div>

        <p className="menu-label">MAIN MENU</p>
        <nav>
          <NavItem
            icon={<LayoutDashboard size={19} />}
            text="Dashboard"
            active={page === "dashboard"}
            onClick={() => navigate("dashboard")}
          />
          <NavItem
            icon={<FolderKanban size={19} />}
            text="Projects"
            active={page === "projects"}
            onClick={() => navigate("projects")}
          />
          <NavItem
            icon={<CheckSquare size={19} />}
            text="Tasks"
            active={page === "tasks"}
            onClick={() => navigate("tasks")}
          />
          <NavItem
            icon={<User size={19} />}
            text="Profile"
            active={page === "profile"}
            onClick={() => navigate("profile")}
          />
        </nav>

        <div className="sidebar-bottom">
          <button className="logout-btn" onClick={logout}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

function NavItem({ icon, text, active, onClick }) {
  return (
    <button className={`nav-item ${active ? "active" : ""}`} onClick={onClick}>
      {icon}
      <span>{text}</span>
    </button>
  );
}

function useWorkspace() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [projectsResponse, tasksResponse] = await Promise.all([
          api.get("/projects/"),
          api.get("/tasks/"),
        ]);
        setProjects(projectsResponse.data);
        setTasks(tasksResponse.data);
      } catch (error) {
        console.log("Could not load workspace:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { projects, setProjects, tasks, setTasks, loading };
}

function Dashboard({ setPage, user, search }) {
  const { projects, tasks, loading } = useWorkspace();

  const completed = tasks.filter(
    (task) => statusClass(task.status) === "done"
  ).length;
  const inProgress = tasks.filter(
    (task) => statusClass(task.status) === "progress"
  ).length;
  const rate = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  const query = search.trim().toLowerCase();
  const recentProjects = projects
    .filter((project) =>
      `${project.name} ${project.description || ""}`
        .toLowerCase()
        .includes(query)
    )
    .slice(0, 4);
  const recentTasks = tasks
    .filter((task) => task.title.toLowerCase().includes(query))
    .slice(0, 5);

  return (
    <>
      <div className="page-header">
        <div>
          <p className="eyebrow">OVERVIEW</p>
          <h1>
            {greeting()}, {user?.name?.split(" ")[0] || "there"}
          </h1>
          <p>Here's a live snapshot of your workspace.</p>
        </div>
        <button className="primary-btn" onClick={() => setPage("projects")}>
          <Plus size={18} />
          New Project
        </button>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={<FolderKanban size={21} />}
          title="Total Projects"
          value={loading ? "—" : String(projects.length)}
          change="Active in your workspace"
        />
        <StatCard
          icon={<CheckSquare size={21} />}
          title="Total Tasks"
          value={loading ? "—" : String(tasks.length)}
          change="Across all projects"
        />
        <StatCard
          icon={<CircleCheck size={21} />}
          title="Completed"
          value={loading ? "—" : String(completed)}
          change={`${rate}% completion`}
        />
        <StatCard
          icon={<Clock3 size={21} />}
          title="In Progress"
          value={loading ? "—" : String(inProgress)}
          change="Keep the momentum"
        />
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Recent Projects</h3>
              <p>Pulled from your API</p>
            </div>
            <button className="text-btn" onClick={() => setPage("projects")}>
              View all
            </button>
          </div>
          {recentProjects.length === 0 ? (
            <p className="quiet">No projects yet. Create one to get started.</p>
          ) : (
            recentProjects.map((project) => {
              const projectTasks = tasks.filter(
                (task) => task.project_id === project.id
              );
              const done = projectTasks.filter(
                (task) => statusClass(task.status) === "done"
              ).length;
              const progress = projectTasks.length
                ? Math.round((done / projectTasks.length) * 100)
                : 0;

              return (
                <ProjectPreview
                  key={project.id}
                  name={project.name}
                  description={
                    project.description || "No description provided."
                  }
                  progress={progress}
                  tasks={`${projectTasks.length} tasks`}
                />
              );
            })
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>My Tasks</h3>
              <p>Your current workload</p>
            </div>
            <button className="text-btn" onClick={() => setPage("tasks")}>
              View all
            </button>
          </div>
          {recentTasks.length === 0 ? (
            <p className="quiet">No tasks yet. Add work from the Tasks page.</p>
          ) : (
            recentTasks.map((task) => (
              <TaskPreview
                key={task.id}
                title={task.title}
                project={
                  projects.find((item) => item.id === task.project_id)?.name ||
                  `Project #${task.project_id}`
                }
                status={task.status}
                type={statusClass(task.status)}
              />
            ))
          )}
        </section>
      </div>
    </>
  );
}

function StatCard({ icon, title, value, change }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <span>{title}</span>
        <strong>{value}</strong>
        <small>{change}</small>
      </div>
    </div>
  );
}

function ProjectPreview({ name, description, progress, tasks }) {
  return (
    <div className="project-preview">
      <div className="project-icon">
        <FolderKanban size={20} />
      </div>
      <div className="project-info">
        <strong>{name}</strong>
        <p>{description}</p>
        <div className="progress-row">
          <div className="progress-bar">
            <div style={{ width: `${progress}%` }} />
          </div>
          <span>{progress}%</span>
        </div>
      </div>
      <small>{tasks}</small>
    </div>
  );
}

function TaskPreview({ title, project, status, type }) {
  return (
    <div className="task-preview">
      <div className={`task-status-dot ${type}`}>
        {type === "done" ? (
          <CircleCheck size={17} />
        ) : type === "progress" ? (
          <CircleDot size={17} />
        ) : (
          <AlertCircle size={17} />
        )}
      </div>
      <div>
        <strong>{title}</strong>
        <p>{project}</p>
      </div>
      <span className={`status-badge ${type}`}>{status}</span>
    </div>
  );
}

function Projects({ search }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get("/projects/");
        setProjects(response.data);
      } catch (err) {
        console.log("Could not load projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const createProject = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("/projects/", { name, description });
      setProjects((prev) => [response.data, ...prev]);
      setName("");
      setDescription("");
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not create project");
    }
  };

  const query = search.trim().toLowerCase();
  const visible = projects.filter((project) =>
    `${project.name} ${project.description || ""}`.toLowerCase().includes(query)
  );

  return (
    <>
      <div className="page-header">
        <div>
          <p className="eyebrow">WORKSPACE</p>
          <h1>Projects</h1>
          <p>Manage and track all your projects.</p>
        </div>
        <button
          className="primary-btn"
          onClick={() => setShowForm((open) => !open)}
        >
          <Plus size={18} />
          New Project
        </button>
      </div>

      {showForm && (
        <form className="create-form panel" onSubmit={createProject}>
          {error && <div className="error-box">{error}</div>}
          <label>Project name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Website redesign"
            required
          />
          <label>Description</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this project about?"
          />
          <div className="form-actions">
            <button className="primary-btn" type="submit">
              Create project
            </button>
            <button
              className="ghost-btn"
              type="button"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="loading">Loading projects...</div>
      ) : visible.length === 0 ? (
        <div className="empty-state">
          <FolderKanban size={40} />
          <h3>No projects yet</h3>
          <p>Create your first project to get started.</p>
        </div>
      ) : (
        <div className="projects-grid">
          {visible.map((project) => (
            <div className="project-card" key={project.id}>
              <div className="project-card-top">
                <div className="project-icon">
                  <FolderKanban size={21} />
                </div>
                <span className="project-dot" />
              </div>
              <h3>{project.name}</h3>
              <p>{project.description || "No description provided."}</p>
              <div className="project-card-footer">
                <span>Project #{project.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function Tasks({ search }) {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [projectId, setProjectId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [tasksResponse, projectsResponse] = await Promise.all([
          api.get("/tasks/"),
          api.get("/projects/"),
        ]);
        setTasks(tasksResponse.data);
        setProjects(projectsResponse.data);
        if (projectsResponse.data[0]) {
          setProjectId(String(projectsResponse.data[0].id));
        }
      } catch (err) {
        console.log("Could not load tasks:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const projectName = (id) => {
    const project = projects.find((item) => item.id === id);
    return project?.name || `Project #${id}`;
  };

  const createTask = async (e) => {
    e.preventDefault();
    setError("");

    if (!projectId) {
      setError("Create a project before adding tasks.");
      return;
    }

    try {
      const response = await api.post("/tasks/", {
        title,
        priority,
        project_id: Number(projectId),
      });
      setTasks((prev) => [response.data, ...prev]);
      setTitle("");
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not create task");
    }
  };

  const cycleStatus = async (task) => {
    const status = nextStatus(task.status);

    try {
      const response = await api.patch(`/tasks/${task.id}/status`, { status });
      setTasks((prev) =>
        prev.map((item) => (item.id === task.id ? response.data : item))
      );
    } catch (err) {
      console.log("Could not update status:", err);
    }
  };

  const removeTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (err) {
      console.log("Could not delete task:", err);
    }
  };

  const query = search.trim().toLowerCase();
  const visible = tasks.filter((task) => {
    const haystack = `${task.title} ${projectName(task.project_id)} ${task.status} ${task.priority}`;
    return haystack.toLowerCase().includes(query);
  });

  return (
    <>
      <div className="page-header">
        <div>
          <p className="eyebrow">WORKSPACE</p>
          <h1>Tasks</h1>
          <p>Click a status badge to move work forward.</p>
        </div>
        <button
          className="primary-btn"
          onClick={() => setShowForm((open) => !open)}
        >
          <Plus size={18} />
          New Task
        </button>
      </div>

      {showForm && (
        <form className="create-form panel" onSubmit={createTask}>
          {error && <div className="error-box">{error}</div>}
          <label>Task title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Build authentication"
            required
          />
          <label>Project</label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            required
          >
            {projects.length === 0 && <option value="">No projects yet</option>}
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <label>Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <div className="form-actions">
            <button className="primary-btn" type="submit">
              Create task
            </button>
            <button
              className="ghost-btn"
              type="button"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="loading">Loading tasks...</div>
      ) : visible.length === 0 ? (
        <div className="empty-state">
          <CheckSquare size={40} />
          <h3>No tasks yet</h3>
          <p>Create a task to start tracking your work.</p>
        </div>
      ) : (
        <div className="task-table panel">
          <div className="task-table-header">
            <span>Task</span>
            <span>Project</span>
            <span>Priority</span>
            <span>Status</span>
            <span />
          </div>
          {visible.map((task) => (
            <div className="task-table-row" key={task.id}>
              <strong>{task.title}</strong>
              <span>{projectName(task.project_id)}</span>
              <span className={`priority ${task.priority.toLowerCase()}`}>
                {task.priority}
              </span>
              <button
                type="button"
                className={`status-badge clickable ${statusClass(task.status)}`}
                onClick={() => cycleStatus(task)}
              >
                {task.status}
              </button>
              <button
                type="button"
                className="icon-btn danger"
                onClick={() => removeTask(task.id)}
                aria-label="Delete task"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function Profile({ user }) {
  return (
    <>
      <div className="page-header">
        <div>
          <p className="eyebrow">ACCOUNT</p>
          <h1>Profile</h1>
          <p>Manage your account information.</p>
        </div>
      </div>
      <div className="profile-card panel">
        <div className="large-avatar">{initials(user?.name)}</div>
        <div className="profile-info">
          <h2>{user?.name || "Loading..."}</h2>
          <p>{user?.email || ""}</p>
          <span className="role-badge">{user?.role || "member"}</span>
        </div>
      </div>
    </>
  );
}

export default App;

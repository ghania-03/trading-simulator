import { useContext } from "react";
import { useNavigate } from "react-router-dom";

import AuthContext from "../context/AuthContext";

function LogoutButton() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  function handleLogout() {
    logout();

    navigate("/login", {
      replace: true,
    });
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      {/* User info */}
      <div className="hidden text-right sm:block">
        <p className="max-w-40 truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
          {user.name}
        </p>

        <p className="max-w-40 truncate text-xs text-slate-400 dark:text-slate-500">
          {user.email}
        </p>
      </div>

      {/* Avatar */}
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white dark:bg-white dark:text-slate-900"
        title={user.name}
      >
        {user.name
          ?.slice(0, 2)
          .toUpperCase()}
      </div>

      {/* Logout */}
      <button
        type="button"
        onClick={handleLogout}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-4 focus:ring-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-red-900/60 dark:hover:bg-red-950/30 dark:hover:text-red-400 dark:focus:ring-slate-800"
      >
        <span className="hidden sm:inline">
          Logout
        </span>

        <span
          className="sm:hidden"
          aria-hidden="true"
        >
          ↪
        </span>

        <span className="sr-only">
          Logout
        </span>
      </button>
    </div>
  );
}

export default LogoutButton;
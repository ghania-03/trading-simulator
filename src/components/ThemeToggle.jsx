import { useTheme } from "../context/ThemeContext";

function ThemeToggle() {
  const {
    isDark,
    toggleTheme,
  } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        isDark
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
      title={
        isDark
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
      className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      <span
        aria-hidden="true"
        className="text-base"
      >
        {isDark ? "☀" : "☾"}
      </span>

      <span className="hidden sm:inline">
        {isDark ? "Light" : "Dark"}
      </span>
    </button>
  );
}

export default ThemeToggle;
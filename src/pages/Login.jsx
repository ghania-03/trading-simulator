import {
  useContext,
  useEffect,
  useState,
} from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import AuthContext from "../context/AuthContext";
import useAuth from "../hooks/useAuth";

import ThemeToggle from "../components/ThemeToggle";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    login,
    isAuthenticated,
    isInitialized,
  } = useContext(AuthContext);

  const {
    mutate,
    isPending,
    error,
    reset,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const from =
    location.state?.from?.pathname
      ? `${location.state.from.pathname}${location.state.from.search || ""}${location.state.from.hash || ""}`
      : "/app/market";

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      navigate(from, {
        replace: true,
      });
    }
  }, [
    isInitialized,
    isAuthenticated,
    navigate,
    from,
  ]);

  function handleSubmit(event) {
    event.preventDefault();

    reset();

    mutate(
      {
        email: email.trim(),
        password,
      },
      {
        onSuccess: (user) => {
          login(user);

          navigate(from, {
            replace: true,
          });
        },
      },
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-md">
        {/* Theme Toggle */}
        <div className="mb-6 flex justify-end">
          <ThemeToggle />
        </div>

        {/* Brand / Intro */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg dark:bg-white dark:text-slate-900">
            <span className="text-lg font-bold">
              TS
            </span>
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
            Welcome back
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Sign in to continue to your trading
            dashboard.
          </p>
        </div>

        {/* Login Card */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                required
                autoComplete="email"
                disabled={isPending}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-500 dark:focus:ring-slate-800"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                disabled={isPending}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-500 dark:focus:ring-slate-800"
              />
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-950/60 dark:bg-red-950/20 dark:text-red-400"
              >
                <p className="font-semibold">
                  Login failed
                </p>
                <p className="mt-1">
                  {error.message}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 dark:focus:ring-slate-700"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-slate-900/30 dark:border-t-slate-900" />
                  Logging in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </section>

        {/* Demo Account */}
        <section className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-sm font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              i
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Demo Account
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Use these credentials to explore
                the simulator.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-2 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 dark:bg-slate-950">
              <span className="text-slate-500 dark:text-slate-400">
                Email
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                ghania@example.com
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 dark:bg-slate-950">
              <span className="text-slate-500 dark:text-slate-400">
                Password
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                password123
              </span>
            </div>
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
          Trading Simulator
        </p>
      </div>
    </main>
  );
}

export default Login;
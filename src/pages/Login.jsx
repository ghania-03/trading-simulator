import {
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import AuthContext from "../context/AuthContext";
import useAuth from "../hooks/useAuth";

function Login() {
  const navigate = useNavigate();

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

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  useEffect(() => {
    if (
      isInitialized &&
      isAuthenticated
    ) {
      navigate(
        "/app/market",
        { replace: true },
      );
    }
  }, [
    isInitialized,
    isAuthenticated,
    navigate,
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

          navigate(
            "/app/market",
            { replace: true },
          );
        },
      },
    );
  }

  return (
    <main>
      <h1>Login</h1>

      <form
        onSubmit={handleSubmit}
      >
        <div>
          <label htmlFor="email">
            Email
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(
                event.target.value,
              )
            }
            placeholder="Enter your email"
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="password">
            Password
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value,
              )
            }
            placeholder="Enter your password"
            required
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
        >
          {isPending
            ? "Logging in..."
            : "Login"}
        </button>

        {error && (
          <p
            role="alert"
          >
            {error.message}
          </p>
        )}
      </form>

      <section>
        <h2>Demo Account</h2>

        <p>
          Email: ghania@example.com
        </p>

        <p>
          Password: password123
        </p>
      </section>
    </main>
  );
}

export default Login;
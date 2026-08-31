import { useContext } from "react";
import { useNavigate } from "react-router-dom";

import AuthContext from "../context/AuthContext";

function LogoutButton() {
  const {
    user,
    logout,
  } = useContext(AuthContext);

  const navigate = useNavigate();

  function handleLogout() {
    logout();

    navigate(
      "/login",
      { replace: true },
    );
  }

  return (
    <div>
      {user && (
        <p>
          Logged in as{" "}
          {user.email}
        </p>
      )}

      <button
        type="button"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
}

export default LogoutButton;
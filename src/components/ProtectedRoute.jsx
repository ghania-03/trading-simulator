import { Navigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";

function ProtectedRoute({
  children,
}) {
  const {
    isAuthenticated,
    isInitialized,
  } = useContext(AuthContext);

  if (!isInitialized) {
    return <p>Checking session...</p>;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../services/authService";

function useAuth() {
  return useMutation({
    mutationFn: loginUser,
  });
}

export default useAuth;
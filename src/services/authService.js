const API_URL = "http://localhost:3001";

export async function loginUser({
  email,
  password,
}) {
  const response = await fetch(
    `${API_URL}/users?email=${encodeURIComponent(
      email,
    )}`,
  );

  if (!response.ok) {
    throw new Error(
      "Failed to connect to authentication server",
    );
  }

  const users = await response.json();

  const user = users.find(
    (item) =>
      item.email.toLowerCase() ===
        email.toLowerCase() &&
      item.password === password,
  );

  if (!user) {
    throw new Error(
      "Invalid email or password",
    );
  }

  /*
    Do not store the password in the client session.
  */
  const authenticatedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  return authenticatedUser;
}
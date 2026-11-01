export const saveAuth = (user, token) => {
  localStorage.setItem("info", JSON.stringify(user));
  localStorage.setItem("token", token);
};

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("info")) || null;
  } catch {
    return null;
  }
}

export const getToken = () => localStorage.getItem("token");

// After an update-profile call, refresh the cached user without touching the token.
export const updateStoredUser = (user) => {
  localStorage.setItem("info", JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem("info");
  localStorage.removeItem("token")
};

export const isLoggedIn = () => !!getToken();

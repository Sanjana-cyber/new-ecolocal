import { useEffect } from "react";

const GoogleSuccess = () => {

  useEffect(() => {

    const params = new URLSearchParams(window.location.search);

    const token = params.get("token");
    const role = params.get("role");
    const name = params.get("name");

    // Check if token exists
    if (!token) {
      window.location.href = "/login";
      return;
    }

    // Save token and role
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    if (name) localStorage.setItem("name", name);

    // Redirect user
    if (role === "admin") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/welcome";
    }

  }, []);

  return <h2>Logging you in...</h2>;
};

export default GoogleSuccess;

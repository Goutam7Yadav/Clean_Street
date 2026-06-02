import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    navigate("/", { replace: true });
  }, [navigate]);

  return (
    <div className="dashboard user-theme">
      <h1>Logging out...</h1>
      <p>You are being redirected to the landing page.</p>
    </div>
  );
}

export default Logout;

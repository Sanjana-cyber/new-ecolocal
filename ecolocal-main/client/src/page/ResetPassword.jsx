import { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const ResetPassword = () => {

  const [password, setPassword] = useState("");

  const { token } = useParams();   // get token from URL
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      await axios.post(
        `http://localhost:5000/api/users/reset-password/${token}`,
        { password }
      );

      alert("Password reset successful");

      navigate("/login");   // redirect to login

    } catch (error) {
      alert(error.response.data.message);
    }
  };

  return (
    <div>

      <h2>Reset Password</h2>

      <form onSubmit={handleSubmit}>

        <input
          type="password"
          placeholder="Enter new password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">
          Reset Password
        </button>

      </form>

    </div>
  );
};

export default ResetPassword;

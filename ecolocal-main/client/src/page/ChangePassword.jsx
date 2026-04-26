import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const ChangePassword = () => {

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
    const navigate = useNavigate();   // ✅ add this

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    await axios.put(
      "http://localhost:5000/api/users/me/password",
      { currentPassword, newPassword },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Password updated successfully");
      

    navigate("/home"); 
  };

  return (
    <div>
      <h2>Change Password</h2>

      <form onSubmit={handleSubmit}>

        <input
          type="password"
          placeholder="Current Password"
          onChange={(e) => setCurrentPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="New Password"
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <button type="submit">Update Password</button>

      </form>
 
    </div>
  );
};

export default ChangePassword;






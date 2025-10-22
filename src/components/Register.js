import { useState } from "react";
import axios from "axios";
import "./Register.css"

function RegisterForm({ setUsername }) {
  const [username, setUname] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/authroutes/register", {
        username,
        email,
        mobile,
        password,
      });

      alert(res.data.message);
      if (res.data.token && res.data.user) {
        const currentUser = { ...res.data.user, token: res.data.token };
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        setUsername(currentUser.username);
      }

      setUname("");
      setEmail("");
      setMobile("");
      setPassword("");
    } catch (err) {
      if (err.response) {
        alert(err.response.data.message);
      } else {
        alert("Something went wrong");
      }
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <h2>Create Account</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUname(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="tel"
          placeholder="Mobile (10 digits)"
          value={mobile}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '').slice(0,10);
            setMobile(v);
          }}
          inputMode="numeric"
          pattern="[0-9]{10}"
          title="Enter a 10-digit mobile number"
          required
          autoComplete="tel"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default RegisterForm;

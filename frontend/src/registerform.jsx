import "bulma/css/bulma.min.css";
import "./reg_login.css";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8088";

export default function RegisterForm() {
  async function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = fd.get("email");
    const password = fd.get("password");
    const confirm = fd.get("confirm");

    if (password !== confirm) {
      alert("Passwords don't match ❌");
      return;
    }

    try {
      const res = await axios.post(`${API}/users/register`, {
        email,
        password,
      });
      alert("Account created ✅");
      console.log(res.data);
    } catch (err) {
  const field = err.response?.data?.field;
  const message = err.response?.data?.message;
  if (field && message) {
    alert(`${field}: ${message}`);
  } else {
    alert("Request failed ❌");
  }
}
  }
  return (
    <div className="page-container has-background-light">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2 className="title is-4 has-text-centered">
          Welcome to the Match-me-children app!
        </h2>
        <br />
        <h2 className="subtitle is-5">Create your account:</h2>
        <label>
          Email
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
            className="input"
          />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            placeholder="At least 6 characters, one letter"
            required
            autoComplete="new-password"
            minLength={6}
            className="input"
          />
        </label>

        <label>
          Confirm password
          <input
            type="password"
            name="confirm"
            placeholder="Repeat your password"
            required
            autoComplete="new-password"
            minLength={6}
            className="input"
          />
        </label>

        <button type="submit" className="button is-primary is-fullwidth">
          Create account
        </button>
      </form>
    </div>
  );
}

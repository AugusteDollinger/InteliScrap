import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.scss";

const API_BASE_URL = "/api/v1";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        setError("Registration failed. The email may already be in use.");
        return;
      }

      navigate("/login");
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register">
      <div className="register__card">
        <h1 className="register__title">Create an account</h1>
        <p className="register__subtitle">Join InteliScrap today</p>

        <form className="register__form" onSubmit={handleSubmit}>
          <div className="register__field">
            <label className="register__label">Username</label>
            <input
              className="register__input"
              type="text"
              placeholder="johndoe"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              required
            />
          </div>

          <div className="register__field">
            <label className="register__label">Email</label>
            <input
              className="register__input"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div className="register__field">
            <label className="register__label">Password</label>
            <input
              className="register__input"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>

          {error && <p className="register__error">{error}</p>}

          <button className="register__submit" type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="register__footer">
          Already have an account?{" "}
          <Link to="/login" className="register__link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;

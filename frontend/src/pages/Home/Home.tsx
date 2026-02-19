import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import "./Home.scss";

const API_BASE_URL = "/api/v1";

type HomepageData = {
  message: string;
  username: string;
  role: string;
};

function Home() {
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [homepageData, setHomepageData] = useState<HomepageData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setHomepageData(null);
      return;
    }
    fetch(`${API_BASE_URL}/homepage`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed to load homepage");
        }
        const data = (await res.json()) as HomepageData;
        setHomepageData(data);
      })
      .catch(() => {
        setHomepageData(null);
      });
  }, [token]);

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registerData),
    });
    if (!res.ok) {
      setError("Registration failed");
      return;
    }
    setRegisterData({ username: "", email: "", password: "" });
  };

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });
    if (!res.ok) {
      setError("Login failed");
      return;
    }
    const data = await res.json();
    localStorage.setItem("token", data.access_token);
    setToken(data.access_token);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <div className="home">
      <p className="home__title">InteliScrap</p>
      <div className="home__content">
        <div className="home__column">
          <h2>Register</h2>
          <form onSubmit={handleRegister} className="home__form">
            <input
              type="text"
              placeholder="Username"
              value={registerData.username}
              onChange={(e) =>
                setRegisterData({ ...registerData, username: e.target.value })
              }
            />
            <input
              type="email"
              placeholder="Email"
              value={registerData.email}
              onChange={(e) =>
                setRegisterData({ ...registerData, email: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Password"
              value={registerData.password}
              onChange={(e) =>
                setRegisterData({ ...registerData, password: e.target.value })
              }
            />
            <button type="submit">Create account</button>
          </form>
        </div>
        <div className="home__column">
          <h2>Login</h2>
          <form onSubmit={handleLogin} className="home__form">
            <input
              type="email"
              placeholder="Email"
              value={loginData.email}
              onChange={(e) =>
                setLoginData({ ...loginData, email: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
            />
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
      {error && <p className="home__error">{error}</p>}
      <div className="home__status">
        {token ? (
          <>
            <button onClick={handleLogout}>Logout</button>
            {homepageData && (
              <div className="home__welcome">
                <p>{homepageData.message}</p>
                <p>
                  Logged in as {homepageData.username} ({homepageData.role})
                </p>
              </div>
            )}
          </>
        ) : (
          <p>Not logged in</p>
        )}
      </div>
    </div>
  );
}

export default Home;

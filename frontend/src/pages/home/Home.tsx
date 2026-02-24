import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Home.scss";

const API_BASE_URL = "/api/v1";

type HomepageData = {
  message: string;
  username: string;
  role: string;
};

function Home() {
  const { token } = useAuth();
  const [homepageData, setHomepageData] = useState<HomepageData | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!token) {
      setHomepageData(null);
      return;
    }
    fetch(`${API_BASE_URL}/homepage`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const data = (await res.json()) as HomepageData;
        setHomepageData(data);
      })
      .catch(() => setHomepageData(null));
  }, [token]);

  return (
    <div className="home">
      <div className="home__hero">
        <h1 className="home__heading">
          Intelligent Web <span className="home__accent">Scraping</span>
        </h1>
        <p className="home__description">
          Extract, transform and analyse web data with precision and speed.
        </p>

        {token && homepageData ? (
          <div className="home__welcome">
            <p className="home__welcome-message">{homepageData.message}</p>
            <p className="home__welcome-meta">
              Signed in as <strong>{homepageData.username}</strong>{" "}
              <span className="home__badge">{homepageData.role}</span>
            </p>
            <div className="home__query">
              <input className="home__query-input" type="text" placeholder="Enter your query..." value={query} onChange={(e) => setQuery(e.target.value)} />
                <Link to={`/scrape?query=${query.split(" ").join("+")}`} className="home__query-btn">Start Scraping</Link>
            </div>
          </div>
        ) : (
          <div className="home__actions">
            <Link to="/login" className="home__btn home__btn--outline">
              Sign in
            </Link>
            <Link to="/register" className="home__btn home__btn--primary">
              Get started
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;

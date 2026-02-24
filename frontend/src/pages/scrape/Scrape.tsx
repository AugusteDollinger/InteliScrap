import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Scrape.scss";

const API_BASE_URL = "/api/v1";

type ScrapeItem = {
  title: string;
  price: string;
  currency: string;
  link: string;
  image: string;
};

type ScrapeResponse = {
  query: string;
  count: number;
  items: ScrapeItem[];
};

function Scrape() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const rawQuery = useMemo(() => searchParams.get("query") ?? "", [searchParams]);
  const query = rawQuery.trim();

  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [results, setResults] = useState<ScrapeResponse | null>(null);

  useEffect(() => {
    if (!query) {
      setResults(null);
      setStatus("idle");
      return;
    }

    const controller = new AbortController();
    setStatus("loading");
    setErrorMessage("");

    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    fetch(`${API_BASE_URL}/scrape/amazon?q=${encodeURIComponent(query)}`, {
      headers,
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          const message = await res.text();
          throw new Error(message || "Unable to scrape results");
        }
        return (await res.json()) as ScrapeResponse;
      })
      .then((data) => {
        setResults(data);
        setStatus("idle");
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          return;
        }
        setStatus("error");
        setErrorMessage(err.message || "Something went wrong");
      });

    return () => controller.abort();
  }, [query, token]);

  return (
    <div className="scrape">
      <div className="scrape__header">
        <div>
          <p className="scrape__eyebrow">Amazon Scrape</p>
          <h1 className="scrape__title">{query ? query : "Start a search"}</h1>
          <p className="scrape__subtitle">
            {query
              ? "Live product matches from Amazon.fr"
              : "Return to the homepage and submit a query to begin."}
          </p>
        </div>
        <Link to="/" className="scrape__back">
          New query
        </Link>
      </div>

      {status === "loading" && (
        <div className="scrape__state scrape__state--loading">
          <span className="scrape__spinner" aria-hidden="true" />
          <span>Scanning the marketplace</span>
          <span className="scrape__dots" aria-hidden="true">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </div>
      )}

      {status === "error" && (
        <div className="scrape__state scrape__state--error">{errorMessage}</div>
      )}

      {query && status !== "loading" && results && (
        <div className="scrape__results">
          <div className="scrape__meta">
            <span>{results.count} results</span>
            <span className="scrape__meta-query">Query: {results.query}</span>
          </div>
          {results.items.length ? (
            <div className="scrape__grid">
              {results.items.map((item, index) => (
                <div className="scrape__card" key={`${item.title}-${index}`}>
                  {item.image && (
                    <div className="scrape__card-image">
                      <img src={item.image} alt={item.title} />
                    </div>
                  )}
                  <div className="scrape__card-body">
                    <h3 className="scrape__card-title">{item.title}</h3>
                    <p className="scrape__card-price">
                      {item.price ? item.price : "Price unavailable"}
                    </p>
                    <a className="scrape__card-link" href={item.link} target="_blank" rel="noreferrer">
                      View on Amazon
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="scrape__state">No results found for this query.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default Scrape;

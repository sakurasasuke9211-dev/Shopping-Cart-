import { Link, useNavigate } from "react-router-dom";
import { useAppState } from "../state/appState";
import "./OpeningPage.css";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1551632811-561732d1e5c2?auto=format&fit=crop&w=1800&q=80";

export function OpeningPage() {
  const navigate = useNavigate();
  const { setAuthMode } = useAppState();

  function continueAsGuest() {
    setAuthMode("guest");
    navigate("/questionnaire");
  }

  return (
    <section className="opening" style={{ backgroundImage: `url(${HERO_IMAGE})` }}>
      <div className="opening__scrim" />
      <div className="opening__content">
        <h1 className="opening__brand">Sports Mart</h1>
        <p className="opening__tagline">
          Simple recommendations for active living after 45.
        </p>

        <button type="button" className="btn btn--primary opening__cta" onClick={continueAsGuest}>
          Continue as Guest
        </button>

        <div className="opening__auth-links">
          <Link to="/login" className="opening__auth-link">
            Log in
          </Link>
          <span className="opening__divider" aria-hidden="true" />
          <Link to="/signup" className="opening__auth-link">
            Sign up
          </Link>
        </div>
      </div>
    </section>
  );
}

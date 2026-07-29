import { FormEvent, useState, type ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useAppState } from "../../state/appState";

function IconUser() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5 19c1.5-3.5 4-5 7-5s5.5 1.5 7 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconCart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 5h2l2.2 10.2a1.5 1.5 0 0 0 1.5 1.2h7.6a1.5 1.5 0 0 0 1.5-1.2L21 8H8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="20" r="1.3" fill="currentColor" />
      <circle cx="18" cy="20" r="1.3" fill="currentColor" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16.5 16.5 20 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function AppHeader({ showSearch = true }: { showSearch?: boolean }) {
  const { cartCount } = useAppState();
  const { user, signOut, loading } = useAuth();
  const [query, setQuery] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const navigate = useNavigate();

  function onSearch(event: FormEvent) {
    event.preventDefault();
    navigate(`/browse?q=${encodeURIComponent(query.trim())}`);
  }

  async function onSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      navigate("/");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <header className="app-header">
      <div className="app-header__row">
        <Link to="/" className="app-header__brand">
          Sports Mart
        </Link>

        {showSearch ? (
          <form className="app-header__search" onSubmit={onSearch} role="search">
            <IconSearch />
            <label className="sr-only" htmlFor="global-search">
              Search for sports gear
            </label>
            <input
              id="global-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for sports gear..."
            />
            <button type="submit" className="app-header__search-btn">
              Search
            </button>
          </form>
        ) : null}

        <div className="app-header__utils">
          {!loading && user ? (
            <>
              <Link className="app-header__util" to="/account">
                <IconUser />
                {user.email ?? "Account"}
              </Link>
              <button
                type="button"
                className="app-header__util"
                onClick={() => void onSignOut()}
                disabled={signingOut}
              >
                {signingOut ? "Signing out…" : "Log out"}
              </button>
            </>
          ) : (
            <Link className="app-header__util" to="/login">
              <IconUser />
              Sign In
            </Link>
          )}
          <Link className="app-header__util app-header__util--cart" to="/cart">
            <IconCart />
            Cart ({cartCount})
          </Link>
        </div>
      </div>
      <nav className="app-header__nav" aria-label="Main">
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/recommendations">Recommendations</NavLink>
        <NavLink to="/browse" end>
          All Sports
        </NavLink>
        <NavLink to="/browse/Equipment">Equipment</NavLink>
        <NavLink to="/browse/Clothing">Clothing</NavLink>
        <NavLink to="/browse/Footwear">Footwear</NavLink>
        <NavLink to="/browse/Accessories">Accessories</NavLink>
        <NavLink to="/browse/Support">Support and recovery</NavLink>
        <NavLink to="/browse/Fitness technology">Fitness technology</NavLink>
        <NavLink to="/cart">Cart ({cartCount})</NavLink>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div>
          <div className="site-footer__brand">Sports Mart</div>
          <p style={{ margin: 0 }}>
            © {new Date().getFullYear()} Sports Mart. All rights reserved.
          </p>
        </div>
        <div className="site-footer__links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#accessibility">Accessibility Statement</a>
          <a href="#contact">Contact Us</a>
        </div>
      </div>
    </footer>
  );
}

export function PrimaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button type="button" className={`btn btn--primary ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}

import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useAppState } from "../state/appState";
import "./LoginPage.css";

function AuthSetupNotice() {
  return (
    <p className="field-error" role="alert">
      Sign-in is not configured yet. Add VITE_SUPABASE_URL and
      VITE_SUPABASE_ANON_KEY, then restart the web app.
    </p>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthMode } = useAppState();
  const { configured, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname ?? "/browse";

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!configured) {
      setError("Supabase is not configured.");
      return;
    }
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signIn({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not sign in. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__top">
        <Link to="/" className="login-page__back">
          ← Back
        </Link>
        <div className="login-page__brand">Sports Mart</div>
      </div>

      <form className="login-card" onSubmit={(e) => void onSubmit(e)} noValidate>
        <h1>Log in</h1>
        {!configured ? <AuthSetupNotice /> : null}

        <div className="field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {error ? (
          <p className="field-error" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="btn btn--primary btn--block"
          disabled={busy || !configured}
        >
          {busy ? "Signing in…" : "Log in"}
        </button>

        <p className="login-footer">
          <Link to="/forgot-password">Forgot password?</Link>
          <br />
          No account? <Link to="/signup">Create your Sports Mart account</Link>
          <br />
          Or{" "}
          <Link to="/questionnaire" onClick={() => setAuthMode("guest")}>
            Continue as Guest
          </Link>
        </p>
      </form>
    </div>
  );
}

export function SignUpPage() {
  const navigate = useNavigate();
  const { setAuthMode } = useAppState();
  const { configured, signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!configured) {
      setError("Supabase is not configured.");
      return;
    }
    if (!fullName.trim() || !email.trim() || password.length < 6) {
      setError("Enter your name, email, and a password of at least 6 characters.");
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const { needsEmailConfirmation } = await signUp({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
      });
      if (needsEmailConfirmation) {
        setNotice(
          "Account created. Please check your email to verify your address, then log in.",
        );
      } else {
        navigate("/questionnaire", { replace: true });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not create your account. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__top">
        <Link to="/" className="login-page__back">
          ← Back
        </Link>
        <div className="login-page__brand">Sports Mart</div>
      </div>

      <form className="login-card" onSubmit={(e) => void onSubmit(e)} noValidate>
        <h1>Create account</h1>
        {!configured ? <AuthSetupNotice /> : null}

        <div className="field">
          <label htmlFor="signup-name">Full name</label>
          <input
            id="signup-name"
            name="name"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="signup-email">Email</label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error ? (
          <p className="field-error" role="alert">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className="status-ok" role="status">
            {notice}
          </p>
        ) : null}

        <button
          type="submit"
          className="btn btn--primary btn--block"
          disabled={busy || !configured}
        >
          {busy ? "Creating account…" : "Create account"}
        </button>
        <p className="login-footer">
          Already have an account? <Link to="/login">Log in</Link>
          <br />
          Prefer not to register?{" "}
          <Link to="/questionnaire" onClick={() => setAuthMode("guest")}>
            Continue as Guest
          </Link>
        </p>
      </form>
    </div>
  );
}

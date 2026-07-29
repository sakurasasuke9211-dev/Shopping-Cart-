import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "./LoginPage.css";

export function ForgotPasswordPage() {
  const { configured, resetPasswordForEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!configured) {
      setError("Supabase is not configured.");
      return;
    }
    if (!email.trim()) {
      setError("Enter the email for your account.");
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await resetPasswordForEmail(email.trim());
      setNotice(
        "If an account exists for that email, you will receive a reset link shortly.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not send the reset email. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__top">
        <Link to="/login" className="login-page__back">
          ← Back to log in
        </Link>
        <div className="login-page__brand">Sports Mart</div>
      </div>
      <form className="login-card" onSubmit={(e) => void onSubmit(e)} noValidate>
        <h1>Forgot password</h1>
        <p>We will email you a link to choose a new password.</p>
        <div className="field">
          <label htmlFor="forgot-email">Email</label>
          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          {busy ? "Sending…" : "Send reset link"}
        </button>
      </form>
    </div>
  );
}

export function ResetPasswordPage() {
  const { configured, updatePassword, user } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!configured) {
      setError("Supabase is not configured.");
      return;
    }
    if (password.length < 6) {
      setError("Use a password of at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await updatePassword(password);
      setNotice("Your password was updated. You can continue shopping.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not update password. Open the link from your email again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__top">
        <Link to="/login" className="login-page__back">
          ← Back to log in
        </Link>
        <div className="login-page__brand">Sports Mart</div>
      </div>
      <form className="login-card" onSubmit={(e) => void onSubmit(e)} noValidate>
        <h1>Choose a new password</h1>
        {!user ? (
          <p>
            Open the reset link from your email first so we can verify it is
            you.
          </p>
        ) : null}
        <div className="field">
          <label htmlFor="reset-password">New password</label>
          <input
            id="reset-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="reset-confirm">Confirm password</label>
          <input
            id="reset-confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        {error ? (
          <p className="field-error" role="alert">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className="status-ok" role="status">
            {notice} <Link to="/browse">Browse products</Link>
          </p>
        ) : null}
        <button
          type="submit"
          className="btn btn--primary btn--block"
          disabled={busy || !configured}
        >
          {busy ? "Saving…" : "Update password"}
        </button>
      </form>
    </div>
  );
}

export function AuthCallbackPage() {
  const { loading, user, configured } = useAuth();

  if (!configured) {
    return (
      <main className="app-main--contained" role="alert">
        <h1>Sign-in is not configured</h1>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="app-main--contained">
        <p>Confirming your email…</p>
      </main>
    );
  }

  return (
    <main className="app-main--contained">
      <h1>{user ? "Email confirmed" : "Almost done"}</h1>
      <p>
        {user
          ? "Your account is ready. You can continue shopping."
          : "If you just verified your email, you can log in now."}
      </p>
      <div className="button-row">
        <Link className="btn btn--primary" to={user ? "/browse" : "/login"}>
          {user ? "Continue shopping" : "Log in"}
        </Link>
      </div>
    </main>
  );
}

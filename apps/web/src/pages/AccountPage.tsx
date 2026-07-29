import { Link } from "react-router-dom";
import { AppHeader, SiteFooter } from "../components/layout/AppHeader";
import { useAuth } from "../auth/AuthContext";

export function AccountPage() {
  const { user, signOut } = useAuth();

  return (
    <div className="recs-page">
      <AppHeader />
      <main className="app-main--contained">
        <h1>Your account</h1>
        <p>
          Signed in as <strong>{user?.email}</strong>
        </p>
        <p>
          Name:{" "}
          <strong>
            {(user?.user_metadata?.full_name as string | undefined) || "Not set"}
          </strong>
        </p>
        <div className="button-row">
          <Link className="btn btn--secondary" to="/browse">
            Browse products
          </Link>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => void signOut()}
          >
            Log out
          </button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

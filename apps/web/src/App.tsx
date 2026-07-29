import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { OpeningPage } from "./pages/OpeningPage";
import { LoginPage, SignUpPage } from "./pages/LoginPage";
import {
  AuthCallbackPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from "./pages/AuthPages";
import { AccountPage } from "./pages/AccountPage";
import { QuestionnairePage } from "./pages/QuestionnairePage";
import { RecommendationsPage } from "./pages/RecommendationsPage";
import { BrowsePage } from "./pages/BrowsePage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { PaymentPage } from "./pages/PaymentPage";
import { OrderConfirmationPage } from "./pages/OrderConfirmationPage";

const AUTH_SHELL_PATHS = new Set([
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/auth/callback",
]);

export function App() {
  const location = useLocation();
  const isOpening = location.pathname === "/";
  const isAuth = AUTH_SHELL_PATHS.has(location.pathname);

  return (
    <div className={`app-shell ${isOpening || isAuth ? "app-shell--bare" : ""}`}>
      <Routes>
        <Route path="/" element={<OpeningPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />
        <Route path="/questionnaire" element={<QuestionnairePage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/browse/:category" element={<BrowsePage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/orders/:orderId" element={<OrderConfirmationPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

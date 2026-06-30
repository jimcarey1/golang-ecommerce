import { useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import AuthModal from "./components/AuthModal.tsx";
import CheckoutView from "./components/CheckoutView.tsx";
import CommunicationView from "./components/CommunicationView.tsx";
import CategoriesPage from "./pages/CategoriesPage.tsx";
import DashboardView from "./components/DashboardView.tsx";
import EligibilityWarningBanner from "./components/EligibilityWarningBanner.tsx";
import Footer from "./components/Footer.tsx";
import MarketplaceView from "./components/MarketplaceView.tsx";
import Navbar from "./components/Navbar.tsx";
import ProductPage from "./pages/ProductPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import SellPage from "./pages/SellPage.tsx";
import { useAuth } from "./hooks/useAuth.ts";
import { useCatalog } from "./hooks/useCatalog.ts";
import type { Item } from "./types.ts";
import { useAuthContext } from "./context/AuthContext.tsx";

const TAB_PATHS: Record<string, string> = {
  marketplace: "/",
  profile: "/profile",
  sell: "/sell",
  categories: "/categories",
  dashboard: "/dashboard",
  inbox: "/inbox",
};

export default function App() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [checkoutItem, setCheckoutItem] = useState<Item | null>(null);
  const [selectedOrderIdForChat, setSelectedOrderIdForChat] = useState<string | null>(null);
  const [eligibilityWarning, setEligibilityWarning] = useState<string | null>(null);

  const { listings, loadingCatalog, fetchCatalog } = useCatalog();

  const { authModal, openAuthModal } = useAuth(fetchCatalog);

  const { user, logout } = useAuthContext()


  function handleLogout() {
    logout();
    setCheckoutItem(null);
    navigate("/");
  }

  function triggerBuyCheckout(item: Item) {
    if (!user) {
      authModal.setIsSignUpMode(false);
      authModal.setShowAuthModal(true);
      return;
    }

    //Temporary Solution.
    const hasAddress = true
    const hasBilling = true

    if (!hasAddress || !hasBilling) {
      setEligibilityWarning(
        "You must configure a valid shipping address and Razorpay credit/UPI credentials on your Profile before commencing this purchase.",
      );
      return;
    }

    setCheckoutItem(item);
    navigate("/checkout");
  }

  function handleSelectChatForOrder(orderId: string) {
    setSelectedOrderIdForChat(orderId);
    navigate("/inbox");
  }

  function handleSwitchTab(tab: string) {
    setCheckoutItem(null);
    navigate(TAB_PATHS[tab] ?? "/");
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] font-sans antialiased text-gray-800 flex flex-col">
      <Navbar
        onLogout={handleLogout}
        onOpenAuth={openAuthModal}
        onNavigate={() => setCheckoutItem(null)}
      />

      <main className="flex-grow mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {eligibilityWarning && (
          <EligibilityWarningBanner
            message={eligibilityWarning}
            onGoToProfile={() => {
              setEligibilityWarning(null);
              navigate("/profile");
            }}
            onDismiss={() => setEligibilityWarning(null)}
          />
        )}

        <Routes>
          <Route
            path="/"
            element={(
              <MarketplaceView
                listings={listings}
                loadingCatalog={loadingCatalog}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                onBuyNow={triggerBuyCheckout}
              />
            )}
          />

          <Route path="/marketplace" element={<Navigate to="/" replace />} />

          <Route
            path="/products/:productId"
            element={<ProductPage onBuyNow={triggerBuyCheckout} />}
          />

          <Route
            path="/profile"
            element={(
              <ProfilePage
                onSwitchTab={handleSwitchTab}
                onSelectChatForOrder={handleSelectChatForOrder}
              />
            )}
          />

          <Route
            path="/sell"
            element={(
              <SellPage
                onSwitchTab={handleSwitchTab}
              />
            )}
          />

          <Route path="/categories" element={<CategoriesPage />} />

          <Route
            path="/dashboard"
            element={(
              <DashboardView
                currentUser={user}
                onSwitchTab={handleSwitchTab}
                onSelectChatForOrder={handleSelectChatForOrder}
              />
            )}
          />

          <Route
            path="/inbox"
            element={(
              <CommunicationView
                selectedOrderId={selectedOrderIdForChat}
                onClearSelectedOrder={() => setSelectedOrderIdForChat(null)}
              />
            )}
          />

          <Route
            path="/checkout"
            element={
              checkoutItem ? (
                <CheckoutView
                  item={checkoutItem}
                  onCancel={() => {
                    setCheckoutItem(null);
                    navigate("/");
                  }}
                  onCompletePurchase={() => {
                    setCheckoutItem(null);
                    navigate("/profile");
                  }}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      {authModal.showAuthModal && (
        <AuthModal
          isSignUpMode={authModal.isSignUpMode}
          setIsSignUpMode={authModal.setIsSignUpMode}
          onSubmitAction={authModal.handleAuthAction}
          onClose={() => authModal.setShowAuthModal(false)}
        />
      )}
    </div>
  );
}

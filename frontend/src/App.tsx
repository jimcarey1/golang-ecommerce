import { useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import AuthModal from "./components/AuthModal.tsx";
import CheckoutView from "./components/CheckoutView.tsx";
import CommunicationView from "./components/CommunicationView.tsx";
import DashboardView from "./components/DashboardView.tsx";
import EligibilityWarningBanner from "./components/EligibilityWarningBanner.tsx";
import Footer from "./components/Footer.tsx";
import MarketplaceView from "./components/MarketplaceView.tsx";
import Navbar from "./components/Navbar.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import SellPage from "./pages/SellPage.tsx";
import { useAuth } from "./hooks/useAuth.ts";
import { useCatalog } from "./hooks/useCatalog.ts";
import { useNotifications } from "./hooks/useNotifications.ts";
import type { Item } from "./types.ts";

const TAB_PATHS: Record<string, string> = {
  marketplace: "/",
  profile: "/profile",
  sell: "/sell",
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

  const {
    listings,
    loadingCatalog,
    fetchCatalog,
    createListing,
  } = useCatalog();

  const {
    currentUser,
    authModal,
    openAuthModal,
    syncUserProfile,
    logout,
  } = useAuth(fetchCatalog);

  const { unreadCount } = useNotifications(currentUser);


  async function handleCreateListing(itemDetails: {
    title: string;
    description: string;
    price: number;
    category: string;
    imageUrl?: string;
  }) {
    await createListing(itemDetails, currentUser, () => {
      if (currentUser) {
        syncUserProfile(currentUser.id);
      }
    });
  }

  function handleLogout() {
    logout();
    setCheckoutItem(null);
    navigate("/");
  }

  function triggerBuyCheckout(item: Item) {
    if (!currentUser) {
      authModal.setIsSignUpMode(false);
      authModal.setShowAuthModal(true);
      return;
    }

    const hasAddress = currentUser.address && currentUser.address.trim().length > 5;
    const hasBilling =
      currentUser.paymentDetails &&
      ((currentUser.paymentDetails.upiId && currentUser.paymentDetails.upiId.trim().length > 4) ||
        (currentUser.paymentDetails.cardNumber && currentUser.paymentDetails.cardNumber.trim().length >= 10));

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
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={openAuthModal}
        unreadNotifications={unreadCount}
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
                currentUser={currentUser}
                onBuyNow={triggerBuyCheckout}
              />
            )}
          />

          <Route path="/marketplace" element={<Navigate to="/" replace />} />

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
                onListItem={handleCreateListing}
              />
            )}
          />

          <Route
            path="/dashboard"
            element={(
              <DashboardView
                currentUser={currentUser}
                onSwitchTab={handleSwitchTab}
                onSelectChatForOrder={handleSelectChatForOrder}
              />
            )}
          />

          <Route
            path="/inbox"
            element={(
              <CommunicationView
                currentUser={currentUser}
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
                  currentUser={currentUser}
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

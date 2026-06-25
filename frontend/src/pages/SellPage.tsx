import { useAuthContext } from "../context/AuthContext";
import AuthRequiredView from "../components/sell/AuthRequiredView";
import SellerEligibilityGuard from "../components/sell/SellerEligibilityGuard";
import SellPageContent from "../components/sell/SellPageContent";
import { useSellerAddresses } from "../hooks/useSellerAddress";

interface SellViewProps {
  onSwitchTab: (tab: string) => void;
}

export default function SellPage({ onSwitchTab }: SellViewProps) {
  const { user } = useAuthContext();
  const { addresses } = useSellerAddresses(user);

  if (!user) {
    return <AuthRequiredView onSwitchTab={onSwitchTab} />;
  }

  const isEligibleToSell = addresses.length > 0;

  if (!isEligibleToSell) {
    return <SellerEligibilityGuard onSwitchTab={onSwitchTab} />;
  }

  return (
    <SellPageContent
      onSwitchTab={onSwitchTab}
    />
  );
}

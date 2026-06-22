import { useAuthContext } from "../context/AuthContext";
import AuthenticatedProfileView from "../components/profile/AuthenticatedProfileView";
import OfflineProfileView from "../components/profile/OfflineProfileView";

interface ProfileViewProps {
  onSwitchTab: (tab: string) => void;
  onSelectChatForOrder: (orderId: string) => void;
}

export default function ProfilePage({
  onSwitchTab,
  onSelectChatForOrder,
}: ProfileViewProps) {
  const { user } = useAuthContext();

  if (!user) {
    return <OfflineProfileView />;
  }

  return (
    <AuthenticatedProfileView
      currentUser={user}
      onSwitchTab={onSwitchTab}
      onSelectChatForOrder={onSelectChatForOrder}
    />
  );
}
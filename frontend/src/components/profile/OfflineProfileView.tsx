import { User } from "lucide-react";

export default function OfflineProfileView() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <User className="h-16 w-16 text-gray-300 mb-4" />
      <h3 className="text-xl font-bold text-gray-800">
        Your Session is Offline
      </h3>
      <p className="text-gray-500 mt-2 max-w-sm">
        Please register or log in using traditional email/password credentials
        to view your profile settings.
      </p>
    </div>
  );
}
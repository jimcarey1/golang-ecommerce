import { useCallback, useEffect, useState } from "react";
import type { Notification, User } from "../types.ts";

export function useNotifications(currentUser: User | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const syncNotifications = useCallback(async () => {
    if (!currentUser) return;

    try {
      const res = await fetch("/api/notifications", {
        headers: { "Authorization": `Bearer ${currentUser.id}` },
      });
      if (res.ok) {
        const notifsList: Notification[] = await res.json();
        setNotifications(notifsList);
        setUnreadCount(notifsList.filter((n) => !n.read).length);
      }
    } catch {
      console.log("No notification loop synchronization.");
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      syncNotifications();
      const interval = setInterval(syncNotifications, 15000);
      return () => clearInterval(interval);
    }

    setNotifications([]);
    setUnreadCount(0);
  }, [currentUser, syncNotifications]);

  return {
    notifications,
    unreadCount,
    syncNotifications,
  };
}

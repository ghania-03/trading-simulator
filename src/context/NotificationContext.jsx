import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

const NotificationContext = createContext(null);

let notificationId = 0;

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((current) =>
      current.filter(
        (notification) => notification.id !== id,
      ),
    );
  }, []);

  const addNotification = useCallback(
    ({
      type = "info",
      message,
      duration = 4000,
    }) => {
      const id = ++notificationId;

      setNotifications((current) => [
        ...current,
        {
          id,
          type,
          message,
        },
      ]);

      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }

      return id;
    },
    [removeNotification],
  );

  const success = useCallback(
    (message) =>
      addNotification({
        type: "success",
        message,
      }),
    [addNotification],
  );

  const error = useCallback(
    (message) =>
      addNotification({
        type: "error",
        message,
      }),
    [addNotification],
  );

  const info = useCallback(
    (message) =>
      addNotification({
        type: "info",
        message,
      }),
    [addNotification],
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        success,
        error,
        info,
        removeNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider",
    );
  }

  return context;
}

export default NotificationContext;
import { useNotifications } from "../context/NotificationContext";

function NotificationContainer() {
  const {
    notifications,
    removeNotification,
  } = useNotifications();

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        width: "320px",
        maxWidth: "calc(100vw - 40px)",
      }}
    >
      {notifications.map((notification) => (
        <div
          key={notification.id}
          role="alert"
          style={{
            padding: "14px 16px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            backgroundColor: "#fff",
            boxShadow:
              "0 4px 12px rgba(0, 0, 0, 0.15)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <div>
            <strong>
              {notification.type === "success"
                ? "Success"
                : notification.type === "error"
                  ? "Error"
                  : "Info"}
            </strong>

            <p
              style={{
                margin: "4px 0 0",
              }}
            >
              {notification.message}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              removeNotification(
                notification.id,
              )
            }
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default NotificationContainer;
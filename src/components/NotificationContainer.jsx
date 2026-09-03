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
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            backgroundColor: "#fff",
            color: "#0f172a",
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
                color: "#334155",
              }}
            >
              {notification.message}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              removeNotification(notification.id)
            }
            aria-label="Close notification"
            style={{
              border: "none",
              background: "transparent",
              color: "#475569",
              fontSize: "20px",
              lineHeight: 1,
              cursor: "pointer",
              padding: "0",
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default NotificationContainer;
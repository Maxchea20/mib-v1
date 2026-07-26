const modules = [
  "Dashboard",
  "Clients",
  "Buyer CRM",
  "Listings",
  "Sales",
  "Settings",
];

export default function ModuleList() {
  return (
    <div
      style={{
        marginTop: "25px",
        marginBottom: "25px",
      }}
    >
      {modules.map((module) => (
        <div
          key={module}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "14px 0",
            borderBottom: "1px solid #eee",
            fontSize: "18px",
          }}
        >
          <span>{module}</span>
          <span style={{ color: "#888" }}>Coming Soon</span>
        </div>
      ))}
    </div>
  );
}
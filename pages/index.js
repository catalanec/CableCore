export default function Home() {
  return (
    <div style={{ 
      fontFamily: "Arial", 
      padding: "40px", 
      background: "#0f172a", 
      color: "white",
      minHeight: "100vh"
    }}>
      <h1 style={{ fontSize: "40px", marginBottom: "20px" }}>
        CableCore
      </h1>
      <p style={{ fontSize: "20px" }}>
        SaaS for Network Installation Estimation
      </p>
      <p style={{ marginTop: "30px", opacity: 0.7 }}>
        System initializing...
      </p>
    </div>
  );
}

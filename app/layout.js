export const metadata = {
  title: "CableCore",
  description: "Cable installation calculator"
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "#0b2537",
          fontFamily: "system-ui, Arial",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            padding: "40px 20px"
          }}
        >
          {children}
        </div>
      </body>
    </html>
  )
}

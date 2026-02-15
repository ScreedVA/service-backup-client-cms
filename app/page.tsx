import { CSSProperties } from "react";

export default function Home() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Backup Placeholder Page</h1>
      <p style={styles.subtitle}>
        This page exists **only for backup and internal reference purposes**. It is not intended for public navigation
        or user-facing content.
      </p>

      <div style={styles.cardContainer}>
        <div style={styles.card}>
          <h2>Server-Side Backup</h2>
          <p>
            All content displayed here is static and rendered on the server. This page is meant to verify the deployment
            and backup of site structure.
          </p>
        </div>

        <div style={styles.card}>
          <h2>No User Navigation</h2>
          <p>
            There are no links, menus, or interactive navigation elements. Users should not use this page as part of the
            live site.
          </p>
        </div>

        <div style={styles.card}>
          <h2>Internal Reference Only</h2>
          <p>
            You can edit <code>pages/index.js</code> to update this placeholder if needed, but it exists purely for
            maintenance and backup verification.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles: {
  container: CSSProperties;
  title: CSSProperties;
  subtitle: CSSProperties;
  cardContainer: CSSProperties;
  card: CSSProperties;
} = {
  container: {
    fontFamily: "system-ui, sans-serif",
    textAlign: "center", // ✅ literal string works
    padding: "4rem 2rem",
    backgroundColor: "#f0f4f8",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  title: {
    fontSize: "3rem",
    marginBottom: "1rem",
    color: "#111827",
  },
  subtitle: {
    fontSize: "1.25rem",
    marginBottom: "3rem",
    color: "#374151",
  },
  cardContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "2rem",
    flexWrap: "wrap",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "2rem",
    width: "250px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
    textAlign: "left", // ✅ literal string works
  },
};

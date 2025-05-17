import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Helmet } from "react-helmet";

// Add React Helmet for SEO
createRoot(document.getElementById("root")!).render(
  <>
    <Helmet>
      <title>Learning Tracker - Your Educational Journey</title>
      <meta name="description" content="Track your progress on educational courses, watch video lessons, and enhance your skills with our learning platform." />
      <meta property="og:title" content="Learning Tracker - Your Educational Journey" />
      <meta property="og:description" content="Track your progress on educational courses, watch video lessons, and enhance your skills with our learning platform." />
      <meta property="og:type" content="website" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    </Helmet>
    <App />
  </>
);

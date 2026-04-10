"use client";

import { useEffect, useRef } from "react";

export default function DocsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/swagger-ui-dist@5/swagger-ui.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js";
    script.onload = () => {
      // @ts-expect-error SwaggerUIBundle loaded from CDN
      window.SwaggerUIBundle({
        url: "/api/docs",
        dom_id: "#swagger-ui",
        presets: [
          // @ts-expect-error SwaggerUIBundle loaded from CDN
          window.SwaggerUIBundle.presets.apis,
          // @ts-expect-error SwaggerUIStandalonePreset loaded from CDN
          window.SwaggerUIBundle.SwaggerUIStandalonePreset,
        ],
        layout: "BaseLayout",
        deepLinking: true,
      });
    };
    document.body.appendChild(script);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div ref={containerRef} id="swagger-ui" />
    </div>
  );
}

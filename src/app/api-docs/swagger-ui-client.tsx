"use client"

import { useEffect } from "react"
import "swagger-ui-dist/swagger-ui.css"

const CONTAINER_ID = "swagger-ui-container"

export function SwaggerUIClient() {
  useEffect(() => {
    let cancelled = false

    import("swagger-ui-dist").then(({ SwaggerUIBundle }) => {
      if (cancelled) return
      SwaggerUIBundle({
        url: "/api/v1/openapi.json",
        dom_id: `#${CONTAINER_ID}`,
        presets: [SwaggerUIBundle.presets.apis],
        layout: "BaseLayout",
        deepLinking: true,
      })
    })

    return () => {
      cancelled = true
    }
  }, [])

  return <div id={CONTAINER_ID} />
}

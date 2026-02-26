/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY: string
  readonly VITE_API_URL: string
  readonly VITE_GOOGLE_MAPS_REGION?: string
  readonly VITE_GOOGLE_MAPS_LANGUAGE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  interface Window {
    google: any
    initMap: () => void
    selectProvider: (providerId: string) => void
  }
}

// Google Maps Types
declare namespace google {
  namespace maps {
    namespace places {
      class Autocomplete {
        constructor(input: HTMLInputElement, options?: any)
        addListener(eventName: string, handler: () => void): void
        getPlace(): any
      }
    }
    class Geocoder {
      constructor()
      geocode(request: any, callback: (results: any[], status: string) => void): void
    }
  }
}
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEFAULT_API_KEY?: string
  readonly VITE_DEFAULT_API_URL?: string
  readonly VITE_DEFAULT_API_TYPE?: string
  readonly VITE_DEFAULT_MODEL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

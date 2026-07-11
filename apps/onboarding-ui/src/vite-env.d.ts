/// <reference types="vite/client" />

declare module '@content/*.md?raw' {
  const content: string
  export default content
}

declare module '@content/*.json' {
  const value: Record<string, unknown>
  export default value
}

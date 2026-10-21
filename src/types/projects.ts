export type Project = {
  href: string
  title: string
  description: string
  tags: string[]
  tools: string[]
  githubUrl: string
  /** Chart-only preview image for project cards (public path) */
  thumbnail: string
  thumbnailAlt: string
}

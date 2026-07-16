interface LearnMoreLinkProps {
  href: string
  children?: string
}

/** Consistent, low-emphasis documentation link for a single step. */
export function LearnMoreLink({ href, children = 'Learn more' }: LearnMoreLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex text-sm text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-accent-hover)]"
    >
      {children} →
    </a>
  )
}

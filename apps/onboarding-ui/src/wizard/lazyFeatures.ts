import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

function lazyDefault(
  loader: () => Promise<{ default: ComponentType }>,
): LazyExoticComponent<ComponentType> {
  return lazy(async () => {
    const mod = await loader()
    if (!mod?.default) {
      throw new Error('Lazy step module missing default export')
    }
    return { default: mod.default }
  })
}

/** Lazy route imports for workstream C features. */
export const QuizStep = lazyDefault(() => import('@/features/quiz/QuizStep'))
export const IssuesStep = lazyDefault(() => import('@/features/issues/IssuesStep'))
export const PromptStep = lazyDefault(() => import('@/features/prompt/PromptStep'))
/** C may rename ChecklistStep to PrHelpStep; keep ChecklistStep import until then. */
export const PrHelpStep = lazyDefault(() => import('@/features/checklist/ChecklistStep'))

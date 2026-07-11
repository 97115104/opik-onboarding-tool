import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

/** Lazy route imports for workstream C features. */
export const QuizStep: LazyExoticComponent<ComponentType> = lazy(
  () => import('@/features/quiz/QuizStep'),
)
export const IssuesStep: LazyExoticComponent<ComponentType> = lazy(
  () => import('@/features/issues/IssuesStep'),
)
export const PromptStep: LazyExoticComponent<ComponentType> = lazy(
  () => import('@/features/prompt/PromptStep'),
)
/** C may rename ChecklistStep to PrHelpStep; keep ChecklistStep import until then. */
export const PrHelpStep: LazyExoticComponent<ComponentType> = lazy(
  () => import('@/features/checklist/ChecklistStep'),
)

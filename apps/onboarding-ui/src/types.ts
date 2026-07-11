export interface KnowledgeGraphLink {
  label: string
  url: string
}

export interface KnowledgeGraphNode {
  id: string
  label: string
  summary: string
  details: string
  links: KnowledgeGraphLink[]
}

export interface KnowledgeGraphEdge {
  source: string
  target: string
  label: string
}

export interface KnowledgeGraph {
  title: string
  description: string
  rootId: string
  nodes: KnowledgeGraphNode[]
  edges: KnowledgeGraphEdge[]
}

export type ServiceStatus = 'checking' | 'healthy' | 'unhealthy'

export interface ServiceHealth {
  id: string
  name: string
  url: string
  status: ServiceStatus
  detail?: string
}

export interface WizardStepConfig {
  id: string
  label: string
  testId: string
  owner: 'B' | 'C'
}

export type CommandCategory = 'recent' | 'projects' | 'clients' | 'galleries' | 'actions' | 'pages'

export interface CommandResult {
  id: string
  category: CommandCategory
  label: string
  description?: string
  iconName: string
  href?: string
  actionKey?: string
}

export interface CommandBarContextValue {
  open: boolean
  openCommandBar: () => void
  closeCommandBar: () => void
  toggleCommandBar: () => void
}

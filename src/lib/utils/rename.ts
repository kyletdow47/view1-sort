// ---------------------------------------------------------------------------
// Batch rename engine
// Expands template tokens into display names for media items.
// ---------------------------------------------------------------------------

export type CaseOption = 'Original' | 'Upper' | 'Lower'

export interface RenameOptions {
  template: string
  startNumber: number
  padding: number
  caseOption: CaseOption
  includeExtension: boolean
}

export interface RenameInput {
  id: string
  filename: string
  ai_category: string | null
  created_at: string
}

export interface RenamePreview {
  id: string
  before: string
  after: string
  category: string
}

/**
 * Sanitise a string for use inside a filename: keep alphanumerics, replace
 * everything else with a single hyphen, strip leading/trailing hyphens.
 */
function sanitize(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Expand template tokens for a single file.
 *
 * Supported tokens:
 *   {project}      — project name (sanitised)
 *   {category}     — ai_category (sanitised), falls back to "Uncategorized"
 *   {n}            — sequential number, zero-padded to `padding` digits
 *   {date}         — file's created_at date as YYYY-MM-DD
 *   {original}     — original filename without extension
 *   {photographer} — optional photographer name (sanitised)
 */
export function expandTemplate(
  template: string,
  ctx: {
    project: string
    category: string
    n: number
    padding: number
    date: string
    original: string
    photographer: string
  },
): string {
  const nStr = String(ctx.n).padStart(ctx.padding, '0')

  return template
    .replace(/{project}/gi, sanitize(ctx.project))
    .replace(/{category}/gi, sanitize(ctx.category))
    .replace(/{n}/g, nStr)
    .replace(/{date}/gi, ctx.date)
    .replace(/{original}/gi, ctx.original.replace(/\.[^/.]+$/, ''))
    .replace(/{photographer}/gi, sanitize(ctx.photographer))
}

/**
 * Compute the full set of renamed display names for a list of media items.
 * Returns preview objects pairing the old filename with the proposed new name.
 */
export function computeRenames(
  media: RenameInput[],
  projectName: string,
  options: RenameOptions,
  photographerName = '',
): RenamePreview[] {
  const { template, startNumber, padding, caseOption, includeExtension } = options

  return media.map((item, idx) => {
    const ext = item.filename.includes('.')
      ? item.filename.split('.').pop() ?? 'jpg'
      : 'jpg'
    const category = item.ai_category ?? 'Uncategorized'
    const date = item.created_at.slice(0, 10)

    let name = expandTemplate(template, {
      project: projectName,
      category,
      n: startNumber + idx,
      padding,
      date,
      original: item.filename,
      photographer: photographerName,
    })

    if (caseOption === 'Upper') name = name.toUpperCase()
    else if (caseOption === 'Lower') name = name.toLowerCase()

    if (includeExtension) name = `${name}.${ext}`

    return { id: item.id, before: item.filename, after: name, category }
  })
}

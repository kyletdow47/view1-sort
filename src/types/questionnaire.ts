// Questionnaire types for View1 Sort
// TODO(db-migration): needs questionnaires, questionnaire_fields, questionnaire_responses tables

export type FieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'multi_select'
  | 'date'
  | 'file_upload'
  | 'rating';

export interface FieldOption {
  id: string;
  label: string;
}

export interface ConditionalRule {
  /** GID of the field this field depends on */
  dependsOnFieldId: string;
  /** The value that the dependent field must equal to show this field */
  showWhenValue: string;
}

export interface QuestionnaireField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  /** For select / multi_select field types */
  options: FieldOption[];
  /** Conditional logic — only show this field if condition is met */
  conditionalRule: ConditionalRule | null;
  /** Position order in the form (managed by dnd-kit) */
  order: number;
}

export interface QuestionnaireTemplate {
  id: string;
  name: string;
  description: string;
  category: 'wedding' | 'portrait' | 'commercial' | 'event' | 'custom';
  fieldCount: number;
  usedCount: number;
}

export interface Questionnaire {
  id: string;
  name: string;
  description: string;
  fields: QuestionnaireField[];
  /** ISO date string */
  createdAt: string;
  updatedAt: string;
  /** Number of client responses received */
  responseCount: number;
  /** Whether the questionnaire has been sent to at least one client */
  sent: boolean;
}

export interface QuestionnaireResponse {
  id: string;
  questionnaireId: string;
  clientName: string;
  clientEmail: string;
  submittedAt: string;
  /** Map of field ID → response value */
  answers: Record<string, string | string[]>;
}

export type FieldTypeConfig = {
  type: FieldType;
  label: string;
  description: string;
  icon: string;
  defaultPlaceholder: string;
};

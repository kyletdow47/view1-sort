'use client';

import React, { useState, useCallback, useId } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowLeft,
  Send,
  Eye,
  Save,
  GripVertical,
  Trash2,
  Plus,
  Type,
  AlignLeft,
  ChevronDown,
  CheckSquare,
  Calendar,
  Upload,
  Star,
  X,
  ChevronRight,
  Settings,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import type {
  QuestionnaireField,
  FieldType,
  FieldOption,
  ConditionalRule,
  FieldTypeConfig,
} from '@/types/questionnaire';

// ─── Field type definitions ────────────────────────────────────────────────────

const FIELD_TYPES: FieldTypeConfig[] = [
  {
    type: 'text',
    label: 'Short Answer',
    description: 'Single-line text input',
    icon: 'type',
    defaultPlaceholder: 'Your answer...',
  },
  {
    type: 'textarea',
    label: 'Long Answer',
    description: 'Multi-line text area',
    icon: 'align-left',
    defaultPlaceholder: 'Tell us more...',
  },
  {
    type: 'select',
    label: 'Single Choice',
    description: 'Dropdown with one answer',
    icon: 'chevron-down',
    defaultPlaceholder: 'Select an option',
  },
  {
    type: 'multi_select',
    label: 'Multiple Choice',
    description: 'Checkboxes, many answers',
    icon: 'check-square',
    defaultPlaceholder: '',
  },
  {
    type: 'date',
    label: 'Date',
    description: 'Date picker',
    icon: 'calendar',
    defaultPlaceholder: 'YYYY-MM-DD',
  },
  {
    type: 'file_upload',
    label: 'File Upload',
    description: 'Let clients upload files',
    icon: 'upload',
    defaultPlaceholder: 'Click to upload',
  },
  {
    type: 'rating',
    label: 'Rating',
    description: '1–5 star rating',
    icon: 'star',
    defaultPlaceholder: '',
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function makeField(type: FieldType, order: number): QuestionnaireField {
  const cfg = FIELD_TYPES.find((f) => f.type === type)!;
  const needsOptions = type === 'select' || type === 'multi_select';
  return {
    id: makeId(),
    type,
    label: cfg.label,
    placeholder: cfg.defaultPlaceholder,
    helpText: '',
    required: false,
    options: needsOptions
      ? [
          { id: makeId(), label: 'Option 1' },
          { id: makeId(), label: 'Option 2' },
        ]
      : [],
    conditionalRule: null,
    order,
  };
}

function FieldTypeIcon({ type }: { type: FieldType }) {
  const iconClass = 'h-4 w-4 text-white/60 flex-shrink-0';
  switch (type) {
    case 'text':
      return <Type className={iconClass} />;
    case 'textarea':
      return <AlignLeft className={iconClass} />;
    case 'select':
      return <ChevronDown className={iconClass} />;
    case 'multi_select':
      return <CheckSquare className={iconClass} />;
    case 'date':
      return <Calendar className={iconClass} />;
    case 'file_upload':
      return <Upload className={iconClass} />;
    case 'rating':
      return <Star className={iconClass} />;
    default:
      return <Type className={iconClass} />;
  }
}

// ─── SortableFieldCard ─────────────────────────────────────────────────────────

interface SortableFieldCardProps {
  field: QuestionnaireField;
  allFields: QuestionnaireField[];
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onUpdate: (id: string, updates: Partial<QuestionnaireField>) => void;
  onDelete: (id: string) => void;
  overlay?: boolean;
}

function SortableFieldCard({
  field,
  allFields,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onDelete,
  overlay = false,
}: SortableFieldCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: field.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const cardContent = (
    <div
      className={`rounded-xl border transition-all ${
        overlay
          ? 'bg-white/10 border-white/20 shadow-2xl rotate-1 scale-105'
          : 'bg-white/5 border-white/10 hover:border-white/20'
      }`}
    >
      {/* Card header */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Drag handle */}
        <div
          {...(overlay ? {} : { ...attributes, ...listeners })}
          className="cursor-grab active:cursor-grabbing touch-none text-white/30 hover:text-white/60 transition-colors"
        >
          <GripVertical className="h-4 w-4" />
        </div>

        {/* Field type icon */}
        <FieldTypeIcon type={field.type} />

        {/* Label */}
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={field.label}
            onChange={(e) => onUpdate(field.id, { label: e.target.value })}
            className="w-full bg-transparent text-white text-sm font-medium placeholder-white/30 outline-none"
            placeholder="Field label"
          />
        </div>

        {/* Required badge */}
        <button
          type="button"
          onClick={() => onUpdate(field.id, { required: !field.required })}
          className={`text-xs px-2 py-0.5 rounded-full border transition-all flex-shrink-0 ${
            field.required
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
          }`}
        >
          {field.required ? 'Required' : 'Optional'}
        </button>

        {/* Expand toggle */}
        <button
          type="button"
          onClick={() => onToggleExpand(field.id)}
          className="text-white/40 hover:text-white/70 transition-colors flex-shrink-0"
        >
          <ChevronRight
            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          />
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={() => onDelete(field.id)}
          className="text-white/30 hover:text-red-400 transition-colors flex-shrink-0"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Expanded settings */}
      {isExpanded && !overlay && (
        <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-3">
          {/* Placeholder / help text */}
          <div className="grid grid-cols-2 gap-3">
            {(field.type === 'text' || field.type === 'textarea') && (
              <div>
                <label className="text-xs text-white/50 mb-1 block">Placeholder</label>
                <input
                  type="text"
                  value={field.placeholder ?? ''}
                  onChange={(e) => onUpdate(field.id, { placeholder: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors"
                  placeholder="Placeholder text..."
                />
              </div>
            )}
            <div>
              <label className="text-xs text-white/50 mb-1 block">Help text</label>
              <input
                type="text"
                value={field.helpText ?? ''}
                onChange={(e) => onUpdate(field.id, { helpText: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors"
                placeholder="Hint for clients..."
              />
            </div>
          </div>

          {/* Options for select / multi_select */}
          {(field.type === 'select' || field.type === 'multi_select') && (
            <div>
              <label className="text-xs text-white/50 mb-2 block">Options</label>
              <div className="space-y-2">
                {field.options.map((opt, idx) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <span className="text-white/30 text-xs w-5 text-right">{idx + 1}.</span>
                    <input
                      type="text"
                      value={opt.label}
                      onChange={(e) => {
                        const newOptions = field.options.map((o) =>
                          o.id === opt.id ? { ...o, label: e.target.value } : o,
                        );
                        onUpdate(field.id, { options: newOptions });
                      }}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors"
                      placeholder={`Option ${idx + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newOptions = field.options.filter((o) => o.id !== opt.id);
                        onUpdate(field.id, { options: newOptions });
                      }}
                      className="text-white/30 hover:text-red-400 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const newOption: FieldOption = { id: makeId(), label: '' };
                    onUpdate(field.id, { options: [...field.options, newOption] });
                  }}
                  className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add option
                </button>
              </div>
            </div>
          )}

          {/* Conditional logic */}
          <ConditionalLogicPanel
            field={field}
            allFields={allFields}
            onUpdate={onUpdate}
          />
        </div>
      )}
    </div>
  );

  if (overlay) return cardContent;

  return (
    <div ref={setNodeRef} style={style}>
      {cardContent}
    </div>
  );
}

// ─── ConditionalLogicPanel ─────────────────────────────────────────────────────

function ConditionalLogicPanel({
  field,
  allFields,
  onUpdate,
}: {
  field: QuestionnaireField;
  allFields: QuestionnaireField[];
  onUpdate: (id: string, updates: Partial<QuestionnaireField>) => void;
}) {
  const eligibleFields = allFields.filter(
    (f) => f.id !== field.id && (f.type === 'select' || f.type === 'text'),
  );

  const rule = field.conditionalRule;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs text-white/50">Conditional logic</label>
        <button
          type="button"
          onClick={() => {
            if (rule) {
              onUpdate(field.id, { conditionalRule: null });
            } else if (eligibleFields.length > 0) {
              const dep = eligibleFields[0];
              const newRule: ConditionalRule = {
                dependsOnFieldId: dep.id,
                showWhenValue: dep.type === 'select' && dep.options.length > 0 ? dep.options[0].label : '',
              };
              onUpdate(field.id, { conditionalRule: newRule });
            }
          }}
          className={`text-xs px-2 py-0.5 rounded-full border transition-all ${
            rule
              ? 'bg-blue-500/20 border-blue-500/40 text-blue-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-300'
              : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:text-white/70'
          }`}
        >
          {rule ? 'Remove condition' : 'Add condition'}
        </button>
      </div>

      {rule && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 space-y-2">
          <p className="text-xs text-blue-300/70">Show this field only when:</p>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={rule.dependsOnFieldId}
              onChange={(e) => {
                const dep = allFields.find((f) => f.id === e.target.value);
                const newRule: ConditionalRule = {
                  dependsOnFieldId: e.target.value,
                  showWhenValue: dep?.type === 'select' && dep.options.length > 0
                    ? dep.options[0].label
                    : '',
                };
                onUpdate(field.id, { conditionalRule: newRule });
              }}
              className="flex-1 min-w-0 bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-white/40"
            >
              {eligibleFields.map((f) => (
                <option key={f.id} value={f.id} className="bg-zinc-900">
                  {f.label}
                </option>
              ))}
            </select>
            <span className="text-xs text-white/40">equals</span>
            <input
              type="text"
              value={rule.showWhenValue}
              onChange={(e) => {
                onUpdate(field.id, {
                  conditionalRule: { ...rule, showWhenValue: e.target.value },
                });
              }}
              className="flex-1 min-w-0 bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-xs text-white placeholder-white/30 outline-none focus:border-white/40"
              placeholder="value..."
            />
          </div>
        </div>
      )}

      {!rule && eligibleFields.length === 0 && (
        <p className="text-xs text-white/30 italic">
          Add select or text fields above to enable conditional logic.
        </p>
      )}
    </div>
  );
}

// ─── PreviewModal ──────────────────────────────────────────────────────────────

function PreviewModal({
  formName,
  fields,
  onClose,
}: {
  formName: string;
  fields: QuestionnaireField[];
  onClose: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  function isFieldVisible(field: QuestionnaireField): boolean {
    if (!field.conditionalRule) return true;
    const depAnswer = answers[field.conditionalRule.dependsOnFieldId];
    if (!depAnswer) return false;
    const val = Array.isArray(depAnswer) ? depAnswer.join(',') : depAnswer;
    return val === field.conditionalRule.showWhenValue;
  }

  function setAnswer(id: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #030305cc 0%, #080810cc 40%, #060609cc 100%)',
          border: '1.5px solid transparent',
          backgroundClip: 'padding-box',
          boxShadow: '0 0 0 1.5px rgba(245,158,11,0.3), 0 25px 50px rgba(0,0,0,0.7)',
        }}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Eye className="h-4 w-4 text-white/60" />
            <span className="text-sm text-white/70 font-medium">Preview</span>
            <span className="text-white/30 text-sm">—</span>
            <span className="text-white text-sm font-semibold">{formName || 'Untitled'}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form fields */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {fields.length === 0 && (
            <p className="text-center text-white/40 text-sm py-8">
              No fields added yet. Add fields from the palette.
            </p>
          )}

          {fields
            .sort((a, b) => a.order - b.order)
            .filter(isFieldVisible)
            .map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-white mb-1.5">
                  {field.label || 'Untitled field'}
                  {field.required && <span className="text-amber-400 ml-1">*</span>}
                </label>
                {field.helpText && (
                  <p className="text-xs text-white/50 mb-2">{field.helpText}</p>
                )}
                <PreviewFieldInput
                  field={field}
                  value={answers[field.id]}
                  onChange={(v) => setAnswer(field.id, v)}
                />
              </div>
            ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            Close preview
          </button>
          <button
            type="button"
            className="px-5 py-2 text-sm font-semibold text-white rounded-xl opacity-60 cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #F59E0B, #EC4899, #A855F7)',
            }}
            disabled
            title="Preview only — submit disabled"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewFieldInput({
  field,
  value,
  onChange,
}: {
  field: QuestionnaireField;
  value: string | string[] | undefined;
  onChange: (v: string | string[]) => void;
}) {
  const inputClass =
    'w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-white/40 transition-colors';

  switch (field.type) {
    case 'text':
      return (
        <input
          type="text"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={inputClass}
        />
      );
    case 'textarea':
      return (
        <textarea
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className={`${inputClass} resize-none`}
        />
      );
    case 'select':
      return (
        <select
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} appearance-none`}
        >
          <option value="" className="bg-zinc-900">
            {field.placeholder || 'Select...'}
          </option>
          {field.options.map((opt) => (
            <option key={opt.id} value={opt.label} className="bg-zinc-900">
              {opt.label}
            </option>
          ))}
        </select>
      );
    case 'multi_select': {
      const selected = (value as string[]) ?? [];
      return (
        <div className="space-y-2">
          {field.options.map((opt) => (
            <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={selected.includes(opt.label)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onChange([...selected, opt.label]);
                  } else {
                    onChange(selected.filter((s) => s !== opt.label));
                  }
                }}
                className="h-4 w-4 rounded border-white/30 bg-white/10 accent-amber-400"
              />
              <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      );
    }
    case 'date':
      return (
        <input
          type="date"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} [color-scheme:dark]`}
        />
      );
    case 'file_upload':
      return (
        <div className="border-2 border-dashed border-white/15 rounded-xl px-6 py-8 text-center hover:border-white/30 transition-colors cursor-pointer">
          <Upload className="h-6 w-6 text-white/30 mx-auto mb-2" />
          <p className="text-sm text-white/50">{field.placeholder || 'Click to upload'}</p>
          <p className="text-xs text-white/30 mt-1">PNG, JPG, PDF up to 10 MB</p>
        </div>
      );
    case 'rating': {
      const rating = parseInt((value as string) ?? '0');
      return (
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(String(n))}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`h-7 w-7 ${
                  n <= rating ? 'text-amber-400 fill-amber-400' : 'text-white/25'
                } transition-colors`}
              />
            </button>
          ))}
        </div>
      );
    }
    default:
      return null;
  }
}

// ─── FieldPalette ──────────────────────────────────────────────────────────────

function FieldPalette({ onAddField }: { onAddField: (type: FieldType) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-white/40 font-medium uppercase tracking-wider mb-1">
        Field types
      </p>
      {FIELD_TYPES.map((cfg) => (
        <button
          key={cfg.type}
          type="button"
          onClick={() => onAddField(cfg.type)}
          className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-left group"
        >
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
            <FieldTypeIcon type={cfg.type} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
              {cfg.label}
            </p>
            <p className="text-xs text-white/40 truncate">{cfg.description}</p>
          </div>
          <Plus className="h-3.5 w-3.5 text-white/20 group-hover:text-white/60 transition-colors ml-auto flex-shrink-0" />
        </button>
      ))}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

interface QuestionnaireBuilderViewProps {
  questionnaireId?: string;
  initialName?: string;
}

const INITIAL_FIELDS: QuestionnaireField[] = [
  makeField('text', 0),
  makeField('select', 1),
];

export function QuestionnaireBuilderView({
  questionnaireId,
  initialName = 'Wedding Planning Questionnaire',
}: QuestionnaireBuilderViewProps) {
  const dndId = useId();

  // ── State ────────────────────────────────────────────────────────────────────
  const [formName, setFormName] = useState(initialName);
  const [formDescription, setFormDescription] = useState(
    'Help us get to know you and plan the perfect session.',
  );
  const [fields, setFields] = useState<QuestionnaireField[]>(INITIAL_FIELDS);
  const [expandedFieldIds, setExpandedFieldIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isSendingToClient, setIsSendingToClient] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [savedTemplate, setSavedTemplate] = useState(false);

  // ── Sensors ──────────────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // ── Drag handlers ────────────────────────────────────────────────────────────
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (over && active.id !== over.id) {
      setFields((prev) => {
        const oldIndex = prev.findIndex((f) => f.id === active.id);
        const newIndex = prev.findIndex((f) => f.id === over.id);
        const reordered = arrayMove(prev, oldIndex, newIndex);
        return reordered.map((f, idx) => ({ ...f, order: idx }));
      });
    }
  }, []);

  // ── Field mutations ──────────────────────────────────────────────────────────
  const addField = useCallback((type: FieldType) => {
    setFields((prev) => {
      const newField = makeField(type, prev.length);
      return [...prev, newField];
    });
  }, []);

  const updateField = useCallback(
    (id: string, updates: Partial<QuestionnaireField>) => {
      setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
    },
    [],
  );

  const deleteField = useCallback((id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id).map((f, idx) => ({ ...f, order: idx })));
    setExpandedFieldIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpandedFieldIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // ── Actions ──────────────────────────────────────────────────────────────────
  const handleSendToClient = useCallback(async () => {
    setIsSendingToClient(true);
    // TODO(resend): POST /api/questionnaires/send { questionnaireId, formName, fields }
    await new Promise((r) => setTimeout(r, 1400));
    setIsSendingToClient(false);
    setSendSuccess(true);
    setTimeout(() => setSendSuccess(false), 3000);
  }, []);

  const handleSaveAsTemplate = useCallback(async () => {
    setIsSavingTemplate(true);
    // TODO(db): POST /api/questionnaires/templates { formName, formDescription, fields }
    await new Promise((r) => setTimeout(r, 900));
    setIsSavingTemplate(false);
    setSavedTemplate(true);
    setTimeout(() => setSavedTemplate(false), 2500);
  }, []);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const activeField = activeId ? fields.find((f) => f.id === activeId) ?? null : null;
  const sortedIds = [...fields].sort((a, b) => a.order - b.order).map((f) => f.id);

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Background */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: "url('/background 5.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Dark overlay */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(160deg, rgba(3,3,5,0.85) 0%, rgba(8,8,16,0.9) 30%, rgba(6,6,9,0.9) 60%, rgba(3,3,5,0.85) 100%)',
        }}
      />
      {/* Mesh gradient accent */}
      <div
        className="absolute inset-0 -z-10 opacity-20"
        style={{
          background:
            'radial-gradient(ellipse at 20% 50%, rgba(245,158,11,0.3) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.3) 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, rgba(168,85,247,0.3) 0%, transparent 50%)',
        }}
      />

      {/* Nav bar — matches Pencil frame fbwaN */}
      <nav
        className="relative flex items-center justify-between px-10 h-14 flex-shrink-0"
        style={{
          background: 'rgba(255,255,255,0.03)',
          borderBottom: '1.5px solid',
          borderImage:
            'linear-gradient(90deg, rgba(245,158,11,0.3) 0%, rgba(59,130,246,0.25) 50%, rgba(168,85,247,0.3) 100%) 1',
        }}
      >
        {/* Left: back + title */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/contracts"
            className="text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-[18px] w-[18px]" />
          </Link>
          <input
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            className="bg-transparent text-white text-[15px] font-semibold outline-none placeholder-white/40 max-w-xs"
            placeholder="Questionnaire name"
          />
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-3">
          {/* Save as template */}
          <button
            type="button"
            onClick={handleSaveAsTemplate}
            disabled={isSavingTemplate}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white/70 hover:text-white hover:border-white/30 transition-all disabled:opacity-60"
          >
            {isSavingTemplate ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : savedTemplate ? (
              <Save className="h-3.5 w-3.5 text-green-400" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>{savedTemplate ? 'Saved!' : 'Save template'}</span>
          </button>

          {/* Preview */}
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white/70 hover:text-white hover:border-white/30 transition-all"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Preview</span>
          </button>

          {/* Send to Client — matches Pencil node fkpEx */}
          <button
            type="button"
            onClick={handleSendToClient}
            disabled={isSendingToClient || sendSuccess}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-white text-xs font-semibold transition-all disabled:opacity-80"
            style={{
              background: sendSuccess
                ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                : 'linear-gradient(135deg, #F59E0B, #EC4899, #A855F7)',
            }}
          >
            {isSendingToClient ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Send className="h-3 w-3" />
            )}
            <span>{sendSuccess ? 'Sent!' : 'Send to Client'}</span>
          </button>
        </div>
      </nav>

      {/* Subtitle label — matches Pencil node Z3FNp */}
      <p className="px-10 py-2 text-[13px] text-white/40 font-normal">
        Questionnaire Builder — Drag fields to build your form
      </p>

      {/* Main content */}
      <div className="flex flex-1 gap-6 px-6 pb-6 min-h-0">
        {/* Left panel: Field palette */}
        <aside className="w-72 flex-shrink-0 overflow-y-auto">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-sm">
            <FieldPalette onAddField={addField} />

            {/* Form settings */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Settings className="h-3.5 w-3.5 text-white/40" />
                <p className="text-xs text-white/40 font-medium uppercase tracking-wider">
                  Form settings
                </p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Description</label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors resize-none"
                    placeholder="A brief description for clients..."
                  />
                </div>
              </div>
            </div>

            {/* Stats */}
            {fields.length > 0 && (
              <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Fields</span>
                  <span className="text-white font-mono">{fields.length}</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-white/40">Required</span>
                  <span className="text-amber-400 font-mono">
                    {fields.filter((f) => f.required).length}
                  </span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-white/40">With logic</span>
                  <span className="text-blue-400 font-mono">
                    {fields.filter((f) => f.conditionalRule).length}
                  </span>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Right panel: Form canvas */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm min-h-full">
            {/* Form header */}
            <div className="mb-6">
              <h1 className="text-xl font-bold text-white">{formName || 'Untitled'}</h1>
              {formDescription && (
                <p className="text-sm text-white/50 mt-1">{formDescription}</p>
              )}
            </div>

            {/* Field list */}
            <DndContext
              id={dndId}
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {fields.length === 0 && (
                    <div className="rounded-2xl border-2 border-dashed border-white/10 py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-white/30">
                        <Plus className="h-10 w-10 mb-1" />
                        <p className="text-sm font-medium">No fields yet</p>
                        <p className="text-xs max-w-xs">
                          Click a field type from the palette on the left to add it to your form.
                        </p>
                      </div>
                    </div>
                  )}

                  {sortedIds.map((id) => {
                    const field = fields.find((f) => f.id === id)!;
                    return (
                      <SortableFieldCard
                        key={field.id}
                        field={field}
                        allFields={fields}
                        isExpanded={expandedFieldIds.has(field.id)}
                        onToggleExpand={toggleExpand}
                        onUpdate={updateField}
                        onDelete={deleteField}
                      />
                    );
                  })}
                </div>
              </SortableContext>

              {/* Drag overlay */}
              <DragOverlay>
                {activeField && (
                  <SortableFieldCard
                    field={activeField}
                    allFields={fields}
                    isExpanded={false}
                    onToggleExpand={() => {}}
                    onUpdate={() => {}}
                    onDelete={() => {}}
                    overlay
                  />
                )}
              </DragOverlay>
            </DndContext>

            {/* Add field CTA */}
            <div className="mt-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/5" />
              <div className="flex flex-wrap items-center gap-2">
                {FIELD_TYPES.slice(0, 4).map((cfg) => (
                  <button
                    key={cfg.type}
                    type="button"
                    onClick={() => addField(cfg.type)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                  >
                    <FieldTypeIcon type={cfg.type} />
                    <span>{cfg.label}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => addField('text')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-dashed border-white/15 text-xs text-white/40 hover:text-white hover:border-white/30 transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add field
                </button>
              </div>
              <div className="h-px flex-1 bg-white/5" />
            </div>
          </div>
        </main>
      </div>

      {/* Preview modal */}
      {showPreview && (
        <PreviewModal
          formName={formName}
          fields={fields}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}

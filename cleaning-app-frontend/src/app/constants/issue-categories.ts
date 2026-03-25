import type { IssueCategory } from '../models/types';

/** תווית עברית בלבד (לדוחות טקסט, מסך מנהל וכו') */
export const ISSUE_CATEGORY_LABELS: Record<IssueCategory, string> = {
  maintenance: 'תחזוקה',
  cleaning: 'ניקיון',
  supplies: 'ציוד',
  safety: 'בטיחות',
  other: 'אחר',
};

const ISSUE_CATEGORY_EMOJI: Record<IssueCategory, string> = {
  maintenance: '🔧',
  cleaning: '🧹',
  supplies: '📦',
  safety: '⚠',
  other: '📝',
};

const ORDER: IssueCategory[] = ['maintenance', 'cleaning', 'supplies', 'safety', 'other'];

/** אפשרויות לרשימה נפתחת בטופס דיווח */
export const ISSUE_CATEGORY_SELECT_OPTIONS: { value: IssueCategory; label: string }[] = ORDER.map(
  (value) => ({
    value,
    label: `${ISSUE_CATEGORY_EMOJI[value]} ${ISSUE_CATEGORY_LABELS[value]}`,
  })
);

export function issueCategoryHebrew(category: string): string {
  if (Object.prototype.hasOwnProperty.call(ISSUE_CATEGORY_LABELS, category)) {
    return ISSUE_CATEGORY_LABELS[category as IssueCategory];
  }
  return category;
}

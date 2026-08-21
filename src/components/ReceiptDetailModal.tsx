import React, { useState } from 'react';
import {
  X,
  Calendar,
  CreditCard,
  Tag,
  DollarSign,
  Layers,
  ZoomIn,
  ZoomOut,
  Download,
  Edit2,
  Trash2,
  Sparkles,
  Repeat,
  FileText,
} from 'lucide-react';
import { AppTheme, Expense } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface Props {
  expense: Expense | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  theme?: AppTheme;
}

export const ReceiptDetailModal: React.FC<Props> = ({
  expense,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  theme = 'dark',
}) => {
  const [zoom, setZoom] = useState(1);

  if (!isOpen || !expense) return null;

  const downloadReceiptImage = () => {
    if (!expense.receiptImage) return;
    const a = document.createElement('a');
    a.href = expense.receiptImage;
    a.download = `receipt_${expense.merchant.replace(/\s+/g, '_')}_${expense.date}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div
        className="theme-bg-card theme-border border rounded-2xl shadow-2xl theme-text-main w-full max-w-4xl overflow-hidden my-8"
        id="receipt-detail-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b theme-border theme-bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl theme-bg-subtle theme-border border shadow-xs flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CategoryIcon category={expense.category} className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold theme-text-main flex items-center gap-2">
                {expense.merchant}
                {expense.isSubscription && (
                  <span className="px-2 py-0.5 text-[10px] bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20 rounded-full font-medium flex items-center gap-1">
                    <Repeat className="w-3 h-3" /> Sub
                  </span>
                )}
              </h2>
              <p className="text-xs theme-text-secondary">
                {formatDate(expense.date)} {expense.time ? `• ${expense.time}` : ''} •{' '}
                {expense.category}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(expense);
              }}
              className="p-2 theme-text-muted hover:theme-text-main rounded-lg hover:theme-bg-subtle transition-colors"
              title="Edit expense"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                onDelete(expense.id);
                onClose();
              }}
              className="p-2 theme-text-muted hover:text-rose-500 dark:hover:text-rose-400 rounded-lg hover:theme-bg-subtle transition-colors"
              title="Delete expense"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 theme-text-muted hover:theme-text-main rounded-lg hover:theme-bg-subtle transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Split: Left Image, Right Breakdown */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Receipt Preview */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center justify-between text-xs theme-text-secondary font-medium">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                <span>Captured Receipt</span>
              </span>
              {expense.receiptImage && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setZoom((z) => Math.max(0.75, z - 0.25))}
                    className="p-1 theme-text-muted hover:theme-text-main rounded hover:theme-bg-subtle"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
                    className="p-1 theme-text-muted hover:theme-text-main rounded hover:theme-bg-subtle"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={downloadReceiptImage}
                    className="p-1 theme-text-muted hover:theme-text-main rounded hover:theme-bg-subtle ml-1"
                    title="Download Receipt Image"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="relative w-full h-[400px] theme-bg-subtle rounded-xl theme-border border overflow-auto flex items-center justify-center p-3">
              {expense.receiptImage ? (
                <img
                  src={expense.receiptImage}
                  alt={expense.merchant}
                  style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
                  className="max-w-full max-h-full object-contain rounded shadow-md transition-transform duration-150"
                />
              ) : (
                <div className="text-center p-6 theme-text-muted">
                  <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">No receipt image attached to this expense.</p>
                </div>
              )}
            </div>

            {expense.receiptConfidence && (
              <div className="flex items-center justify-between text-xs px-3 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 theme-text-main">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  OCR Verified
                </span>
                <span className="theme-text-secondary">{expense.receiptConfidence}% AI Accuracy</span>
              </div>
            )}
          </div>

          {/* Right: Detailed Summary & Line Items */}
          <div className="md:col-span-6 space-y-4">
            {/* Total Highlight */}
            <div className="p-4 theme-bg-subtle rounded-xl theme-border border flex items-center justify-between">
              <div>
                <span className="text-xs theme-text-muted block font-medium">Total Paid</span>
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatCurrency(expense.amount, expense.currency)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs theme-text-muted block font-medium">Payment</span>
                <span className="text-xs font-semibold theme-text-main theme-bg-card theme-border border px-2.5 py-1 rounded-md inline-block mt-0.5 shadow-xs">
                  {expense.paymentMethod}
                </span>
              </div>
            </div>

            {/* Subtotal, Tax, Tip stats */}
            {(expense.subtotal || expense.tax || expense.tip) && (
              <div className="grid grid-cols-3 gap-2 theme-bg-subtle p-3 rounded-xl theme-border border text-xs">
                <div>
                  <span className="theme-text-muted block text-[11px]">Subtotal</span>
                  <span className="theme-text-main font-mono font-medium">
                    {expense.subtotal ? formatCurrency(expense.subtotal, expense.currency) : '—'}
                  </span>
                </div>
                <div>
                  <span className="theme-text-muted block text-[11px]">Tax</span>
                  <span className="theme-text-main font-mono font-medium">
                    {expense.tax ? formatCurrency(expense.tax, expense.currency) : '—'}
                  </span>
                </div>
                <div>
                  <span className="theme-text-muted block text-[11px]">Tip</span>
                  <span className="theme-text-main font-mono font-medium">
                    {expense.tip ? formatCurrency(expense.tip, expense.currency) : '—'}
                  </span>
                </div>
              </div>
            )}

            {/* Line Items List */}
            <div className="space-y-2">
              <span className="text-xs font-semibold theme-text-secondary flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                <span>Itemized Breakdown ({expense.items?.length || 0} items)</span>
              </span>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {expense.items && expense.items.length > 0 ? (
                  expense.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl theme-bg-subtle theme-border border text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="theme-text-muted font-mono text-[11px]">
                          {item.quantity}x
                        </span>
                        <span className="theme-text-main font-medium">{item.name}</span>
                      </div>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(item.price, expense.currency)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs theme-text-muted italic p-3 text-center theme-bg-subtle rounded-xl theme-border border">
                    No individual line items recorded.
                  </div>
                )}
              </div>
            </div>

            {/* Notes & Tags */}
            {expense.notes && (
              <div className="p-3 theme-bg-subtle rounded-xl theme-border border text-xs">
                <span className="theme-text-muted block text-[11px] font-medium mb-0.5">Notes</span>
                <p className="theme-text-secondary">{expense.notes}</p>
              </div>
            )}

            {expense.tags && expense.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {expense.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 text-[10px] theme-bg-subtle theme-text-secondary theme-border border rounded-md font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

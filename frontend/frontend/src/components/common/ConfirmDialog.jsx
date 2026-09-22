import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText,
  confirmLabel,
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  isLoading = false,
  loading = false,
}) => {
  const handleClose = onCancel || onClose;
  const isDialogLoading = isLoading || loading;
  const resolvedConfirmText = confirmLabel || confirmText || 'Delete';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-2.5">
        <Button variant="secondary" onClick={handleClose} disabled={isDialogLoading}>
          {cancelText}
        </Button>
        <Button
          variant={confirmVariant}
          onClick={onConfirm}
          isLoading={isDialogLoading}
        >
          {resolvedConfirmText}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;

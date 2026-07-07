import React from 'react';
import { Modal } from './Modal';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/** Accessible dialog wrapper — reuses Modal with dialog semantics. */
export const Dialog: React.FC<DialogProps> = (props) => {
  return (
    <div role="dialog" aria-modal="true" aria-labelledby={props.title ? 'dialog-title' : undefined}>
      <Modal {...props} />
    </div>
  );
};

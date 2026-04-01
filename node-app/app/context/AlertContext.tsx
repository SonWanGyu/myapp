'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AlertState {
  isOpen: boolean;
  message: string;
  type: 'alert' | 'confirm';
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface AlertContextType {
  showAlert: (message: string) => void;
  showConfirm: (message: string, onConfirm: () => void, onCancel?: () => void) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    message: '',
    type: 'alert',
  });

  const showAlert = (message: string) => {
    setAlertState({
      isOpen: true,
      message,
      type: 'alert',
    });
  };

  const showConfirm = (message: string, onConfirm: () => void, onCancel?: () => void) => {
    setAlertState({
      isOpen: true,
      message,
      type: 'confirm',
      onConfirm,
      onCancel,
    });
  };

  const closeAlert = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  };

  const handleConfirm = () => {
    if (alertState.onConfirm) alertState.onConfirm();
    closeAlert();
  };

  const handleCancel = () => {
    if (alertState.onCancel) alertState.onCancel();
    closeAlert();
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {alertState.isOpen && (
        <div style={overlayStyle}>
          <div style={modalStyle} className="animate-fade-in">
            <div style={iconStyle}>{alertState.type === 'confirm' ? '❔' : '🔔'}</div>
            <p style={messageStyle}>{alertState.message}</p>
            <div style={buttonContainerStyle}>
              {alertState.type === 'confirm' && (
                <button className="secondary" style={buttonStyle} onClick={handleCancel}>취소</button>
              )}
              <button className="primary" style={buttonStyle} onClick={handleConfirm}>확인</button>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}

// 스크린 중앙 고정, 배경 블러 처리 인라인 스타일
const overlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 9999
};

const modalStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '16px',
  padding: '30px',
  maxWidth: '400px', width: '90%',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  textAlign: 'center'
};

const iconStyle: React.CSSProperties = {
  fontSize: '3rem', marginBottom: '15px'
};

const messageStyle: React.CSSProperties = {
  fontSize: '1.1rem', color: '#334155', marginBottom: '25px', lineHeight: '1.5', wordBreak: 'keep-all'
};

const buttonContainerStyle: React.CSSProperties = {
  display: 'flex', gap: '10px', justifyContent: 'center'
};

const buttonStyle: React.CSSProperties = {
  flex: 1, padding: '12px', borderRadius: '8px', fontSize: '1rem'
};

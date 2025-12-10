'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X } from 'lucide-react';
import Button from './Button';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize scanner
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      /* verbose= */ false
    );
    
    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        onScan(decodedText);
        // Stop scanning after successful scan to prevent multiple triggers
        scanner.clear().catch(err => console.error("Failed to clear scanner", err));
      },
      (errorMessage) => {
        // parse error, ignore it.
        // setScanError(errorMessage); 
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5-qrcode scanner. ", error);
        });
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden relative">
        <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Scan QR Code</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        
        <div className="p-6">
            <div id="reader" className="w-full rounded-xl overflow-hidden"></div>
            {scanError && <p className="text-red-500 text-sm mt-2 text-center">{scanError}</p>}
            <p className="text-center text-slate-500 text-sm mt-4">
                Point your camera at the client&apos;s prescription QR code.
            </p>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;

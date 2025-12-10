'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X } from 'lucide-react';
import Button from './Button';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const [scanError, setScanError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const regionId = "qr-reader-custom";
    let scanner: Html5Qrcode | null = null;
    let isMounted = true;

    const initScanner = async () => {
        try {
            scanner = new Html5Qrcode(regionId);
            scannerRef.current = scanner;

            await scanner.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                },
                (decodedText: string) => {
                     if (isMounted) {
                        onScan(decodedText);
                        // We do NOT stop here automatically to avoid UI race conditions.
                        // The parent can decide to close the modal which unmounts this.
                     }
                },
                (errorMessage: any) => {
                    // ignore
                }
            );
            
            if (isMounted) setIsScanning(true);
        } catch (err) {
            console.error("Failed to start scanner", err);
            if (isMounted) {
                setScanError("Could not access camera. Please ensure permissions are granted.");
                setIsScanning(false);
            }
        }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initScanner, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      
      if (scanner) {
          try {
             // Attempt to clear first
             scanner.clear().catch(async (e) => {
                 // If clear fails because it thinks it's running, try to stop then clear
                 console.warn("Scanner clear failed, attempting to stop...", e);
                 try {
                     await scanner?.stop();
                     await scanner?.clear();
                 } catch (err) {
                     console.error("Failed to force cleanup scanner", err);
                 }
             });
          } catch (e) {
             console.error("Sync error clearing scanner", e);
          }
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-0 overflow-hidden">
      <div className="relative w-full h-full md:max-w-md md:h-auto md:aspect-[9/16] bg-black md:rounded-3xl overflow-hidden flex flex-col">
        
        {/* Header Overlay */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent">
            <div>
                <h3 className="text-white font-bold text-lg">Scan Code</h3>
                <p className="text-white/70 text-xs">Align QR code within frame</p>
            </div>
          <button onClick={onClose} className="p-2 bg-black/20 backdrop-blur-md hover:bg-white/10 rounded-full transition-colors border border-white/10">
            <X size={20} className="text-white" />
          </button>
        </div>
        
        {/* Main Camera View */}
        <div className="flex-1 relative flex items-center justify-center bg-black">
            <div id="qr-reader-custom" className="w-full h-full object-cover"></div>
            
            {/* Visual Guide Overlay */}
            <div className="absolute inset-0 border-2 border-transparent pointer-events-none flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-blue-500/80 rounded-3xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                    {/* Scanner corners */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1 rounded-br-lg"></div>
                    
                    {/* Scanning animation line */}
                    {isScanning && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-scan-y"></div>
                    )}
                </div>
            </div>

            {/* Loading / Error State */}
            {!isScanning && !scanError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-white/80 text-sm font-medium">Starting Camera...</p>
                    </div>
                </div>
            )}
            
            {scanError && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-30 p-6 text-center">
                    <div>
                        <p className="text-red-400 mb-4">{scanError}</p>
                        <Button variant="secondary" onClick={onClose} className="bg-white/10 text-white border-white/20">Close</Button>
                    </div>
                </div>
            )}
        </div>

        {/* Footer Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent flex justify-center pb-12 md:pb-8">
            <p className="text-white/60 text-sm text-center">
                Scan the QR code on your prescription bottle
            </p>
        </div>
      </div>
      
      {/* Force video to fill container */}
      <style jsx global>{`
        #qr-reader-custom video {
            object-fit: cover !important;
            width: 100% !important;
            height: 100% !important;
            border-radius: 0 !important;
        }
      `}</style>
    </div>
  );
};

export default QRScanner;

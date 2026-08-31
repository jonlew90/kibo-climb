import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Flashlight, RefreshCw, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { parseQrPayload, QR_TYPES } from '../utils/qrProtocol';

export default function QrScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
  title = 'Scan Climber QR Code',
  subtitle = 'Point your camera at a friend\'s screen to connect!'
}) {
  const [errorMessage, setErrorMessage] = useState('');
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'
  const [isProcessing, setIsProcessing] = useState(false);
  const scannerRef = useRef(null);
  const scannerContainerId = 'kibo-qr-reader-container';

  useEffect(() => {
    let isMounted = true;

    if (isOpen) {
      setErrorMessage('');
      setIsProcessing(false);

      // Brief delay to allow DOM modal container to render
      const timer = setTimeout(async () => {
        try {
          const scanner = new Html5Qrcode(scannerContainerId);
          scannerRef.current = scanner;

          const config = {
            fps: 10,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1.0
          };

          await scanner.start(
            { facingMode: 'environment' },
            config,
            (decodedText) => {
              if (isProcessing) return;
              setIsProcessing(true);
              soundFx.playVictory();
              
              const parsed = parseQrPayload(decodedText);
              if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(() => {}).finally(() => {
                  if (isMounted) {
                    onScanSuccess(parsed, decodedText);
                  }
                });
              } else {
                if (isMounted) {
                  onScanSuccess(parsed, decodedText);
                }
              }
            },
            (error) => {
              // Periodic frame scan failures are expected when QR is not in frame
            }
          );

          if (isMounted) setHasCameraPermission(true);
        } catch (err) {
          console.warn('QR Scanner Start Error:', err);
          if (isMounted) {
            setHasCameraPermission(false);
            setErrorMessage('Camera access was denied or not available on this device. Please grant camera permission or enter code manually.');
          }
        }
      }, 300);

      return () => {
        isMounted = false;
        clearTimeout(timer);
        if (scannerRef.current) {
          try {
            if (scannerRef.current.isScanning) {
              scannerRef.current.stop().catch(() => {});
            }
            scannerRef.current.clear();
          } catch (e) {}
        }
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    soundFx.playKeyTap();
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(() => {});
        }
        scannerRef.current.clear();
      } catch (e) {}
    }
    onClose();
  };

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-[1250] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl relative animate-scale-in border-4 border-indigo-300 flex flex-col items-center text-center cursor-default overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all cursor-pointer z-10"
          aria-label="Close Scanner"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Header */}
        <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-2 border-2 border-indigo-300 text-indigo-600">
          <Camera className="w-6 h-6 stroke-[2.5]" />
        </div>
        <h2 className="text-xl font-black text-slate-800 leading-tight">{title}</h2>
        <p className="text-xs text-slate-500 font-semibold mt-1 px-3">{subtitle}</p>

        {/* Camera Viewport Container */}
        <div className="w-full my-4 relative rounded-2xl overflow-hidden bg-slate-900 border-2 border-indigo-400 shadow-inner aspect-square flex items-center justify-center">
          <div id={scannerContainerId} className="w-full h-full object-cover" />

          {/* Target Scan Guides (HUD) */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-48 h-48 border-2 border-dashed border-indigo-400/80 rounded-2xl relative">
              <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />
            </div>
          </div>

          {/* Loading / Processing Indicator */}
          {isProcessing && (
            <div className="absolute inset-0 bg-indigo-950/75 flex flex-col items-center justify-center text-white z-20 animate-fade-in">
              <Sparkles className="w-8 h-8 text-amber-400 animate-spin mb-2" />
              <span className="text-sm font-black tracking-wide">Connecting Friend...</span>
            </div>
          )}
        </div>

        {/* Error / Permission Warning */}
        {errorMessage && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 flex items-start gap-2 text-left mb-3">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Privacy Note */}
        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 mt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Safe & Private (Processed on device)</span>
        </div>
      </div>
    </div>
  );
}

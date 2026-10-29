import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Check, PenTool } from 'lucide-react';

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  onClear?: () => void;
  width?: number;
  height?: number;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onSave,
  onClear,
  width = 400,
  height = 160,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high DPI scaling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Clear background to transparent or white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Draw baseline guideline
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(20, height - 35);
    ctx.lineTo(width - 20, height - 35);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.5;
  }, [width, height]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // redraw guide line
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(20, height - 35);
    ctx.lineTo(width - 20, height - 35);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.5;

    setHasDrawn(false);
    if (onClear) onClear();
  };

  return (
    <div className="space-y-2">
      <div className="relative border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-white shadow-inner">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: `${height}px`, touchAction: 'none' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="cursor-crosshair block"
        />
        {!hasDrawn && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-400 gap-2 text-sm font-medium">
            <PenTool className="w-4 h-4 text-slate-400" />
            <span>Sign here with finger or mouse</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {hasDrawn ? 'Signature captured ✓' : 'Signature required for proof of delivery'}
        </span>
        <button
          type="button"
          onClick={clearCanvas}
          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>
    </div>
  );
};

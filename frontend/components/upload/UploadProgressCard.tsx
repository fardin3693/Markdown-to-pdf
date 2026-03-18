'use client';

import { Loader2, UploadCloud, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TransferPhase } from '@/lib/upload';

interface UploadProgressCardProps {
    fileName: string;
    fileSizeLabel?: string;
    progress: number;
    phase: TransferPhase;
    className?: string;
    error?: string;
    onCancel?: () => void;
    canCancel?: boolean;
}

const phaseLabel: Record<TransferPhase, string> = {
    idle: 'Ready',
    uploading: 'Uploading file',
    processing: 'Upload complete, preparing PDF',
    done: 'Ready to work',
    error: 'Upload failed',
    cancelled: 'Upload cancelled',
};

export default function UploadProgressCard({
    fileName,
    fileSizeLabel,
    progress,
    phase,
    className,
    error,
    onCancel,
    canCancel = false,
}: UploadProgressCardProps) {
    const isProcessing = phase === 'uploading' || phase === 'processing';
    const isDone = phase === 'done';
    const isError = phase === 'error';
    const isCancelled = phase === 'cancelled';

    return (
        <div className={cn('rounded-3xl border border-blue-100 bg-white shadow-lg shadow-blue-100/40 p-5', className)}>
            <div className="flex items-start gap-4">
                <div
                    className={cn(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
                        isError || isCancelled ? 'bg-red-50 text-red-500' : isDone ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                    )}
                >
                    {isError || isCancelled ? (
                        <AlertCircle className="h-6 w-6" />
                    ) : isDone ? (
                        <CheckCircle2 className="h-6 w-6" />
                    ) : phase === 'processing' ? (
                        <Cpu className="h-6 w-6" />
                    ) : (
                        <UploadCloud className="h-6 w-6" />
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-black text-slate-900">{fileName}</p>
                            {fileSizeLabel ? <p className="mt-1 text-xs text-slate-500">{fileSizeLabel}</p> : null}
                        </div>
                        <div className="shrink-0 text-right">
                            <p className="text-2xl font-black text-slate-900">{progress}%</p>
                        </div>
                    </div>

                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                        <div
                            className={cn(
                                'h-full rounded-full transition-all duration-300',
                                isError || isCancelled ? 'bg-red-500' : isDone ? 'bg-emerald-500' : 'bg-blue-600'
                            )}
                            style={{ width: `${Math.max(phase === 'processing' || isDone ? 100 : progress, isError || isCancelled ? progress : 0)}%` }}
                        />
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3 text-sm font-medium text-slate-600">
                        <div className="flex items-center gap-2 min-w-0">
                        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin text-blue-600" /> : null}
                        <span className="truncate">{error || phaseLabel[phase]}</span>
                        </div>
                        {canCancel && onCancel && isProcessing ? (
                            <button
                                type="button"
                                onClick={onCancel}
                                className="shrink-0 rounded-full border border-red-200 px-3 py-1 text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
                            >
                                Cancel
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}

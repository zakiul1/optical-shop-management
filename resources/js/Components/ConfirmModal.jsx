import { Icon } from '@/Components/Icons';

export default function ConfirmModal({
    show,
    title = 'Are you sure?',
    message = 'This action cannot be undone.',
    confirmText = 'Delete',
    cancelText = 'Cancel',
    tone = 'red',
    processing = false,
    onConfirm,
    onCancel,
}) {
    if (!show) return null;

    const toneClasses = {
        red: 'bg-red-600 hover:bg-red-700 shadow-red-600/20',
        amber: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20',
        blue: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20',
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={processing ? undefined : onCancel} />
            <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300">
                        <Icon name="alert" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white">{title}</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{message}</p>
                    </div>
                </div>

                <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                    Please confirm before continuing. For purchase and sales records, stock will also be adjusted automatically.
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        disabled={processing}
                        onClick={onCancel}
                        className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        disabled={processing}
                        onClick={onConfirm}
                        className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-60 ${toneClasses[tone] ?? toneClasses.red}`}
                    >
                        {processing ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

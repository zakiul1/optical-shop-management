export function Input({ label, error, className = '', ...props }) {
    return (
        <label className="block">
            {label && <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>}
            <input
                className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 ${className}`}
                {...props}
            />
            {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
        </label>
    );
}

export function Select({ label, error, children, className = '', ...props }) {
    return (
        <label className="block">
            {label && <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>}
            <select
                className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 ${className}`}
                {...props}
            >
                {children}
            </select>
            {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
        </label>
    );
}

export function Textarea({ label, error, className = '', ...props }) {
    return (
        <label className="block">
            {label && <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>}
            <textarea
                className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 ${className}`}
                {...props}
            />
            {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
        </label>
    );
}

import { useEffect, useMemo } from 'react';
import { Icon } from '@/Components/Icons';
import { useI18n } from '@/i18n';

export default function ImageUpload({ label, files, onChange, multiple = false, error, existing = [], removeIds = [], onToggleRemove, accept = 'image/*' }) {
    const { t } = useI18n();
    const selectedFiles = Array.from(files || []);
    const previews = useMemo(() => selectedFiles.map(file => ({ file, url: URL.createObjectURL(file) })), [files]);

    useEffect(() => () => previews.forEach(item => URL.revokeObjectURL(item.url)), [previews]);

    return (
        <div className="space-y-3">
            <div>
                <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{label} <span className="text-xs font-semibold text-slate-400">({t('optional')})</span></div>
                <p className="mt-1 text-xs text-slate-500">JPG, PNG or WEBP. Preview will show before upload.</p>
            </div>
            <label className="group flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-blue-200 bg-blue-50/60 p-6 text-center transition hover:border-blue-400 hover:bg-blue-50 dark:border-blue-900 dark:bg-blue-500/5 dark:hover:bg-blue-500/10">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-blue-600 shadow-sm dark:bg-slate-900"><Icon name="image" /></div>
                <div className="mt-3 text-sm font-black text-slate-800 dark:text-slate-100">{multiple ? t('chooseImages') : t('choosePhoto')}</div>
                <div className="mt-1 text-xs text-slate-500">Click here or drag images into this area</div>
                <input type="file" className="hidden" accept={accept} multiple={multiple} onChange={e => onChange(multiple ? Array.from(e.target.files || []) : (e.target.files?.[0] ?? null))} />
            </label>
            {error && <p className="text-xs font-semibold text-red-600">{error}</p>}

            {(existing.length > 0 || previews.length > 0) && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {existing.map(image => {
                        const marked = removeIds.includes(image.id);
                        return (
                            <div key={image.id} className={`relative overflow-hidden rounded-2xl border bg-slate-50 dark:bg-slate-950 ${marked ? 'border-red-300 opacity-50' : 'border-slate-200 dark:border-slate-800'}`}>
                                <img src={image.url} alt="Existing upload" className="h-28 w-full object-cover" />
                                <button type="button" onClick={() => onToggleRemove?.(image.id)} className={`absolute right-2 top-2 rounded-xl px-2 py-1 text-xs font-black text-white ${marked ? 'bg-slate-700' : 'bg-red-600'}`}>{marked ? 'Undo' : t('remove')}</button>
                            </div>
                        );
                    })}
                    {previews.map((item, index) => (
                        <div key={`${item.file.name}-${index}`} className="overflow-hidden rounded-2xl border border-blue-200 bg-white dark:border-blue-900 dark:bg-slate-950">
                            <img src={item.url} alt="Preview" className="h-28 w-full object-cover" />
                            <div className="truncate p-2 text-xs font-semibold text-slate-500">{item.file.name}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

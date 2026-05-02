export default function AuditMeta({ item, compact = false }) {
    const createdBy = item?.created_by?.name ?? item?.createdBy?.name ?? item?.created_by_name ?? item?.created_by_user?.name ?? item?.created_by?.email ?? item?.createdBy?.email ?? 'System';
    const updatedBy = item?.updated_by?.name ?? item?.updatedBy?.name ?? item?.updated_by_name ?? item?.updated_by_user?.name ?? item?.updated_by?.email ?? item?.updatedBy?.email;
    const createdAt = item?.created_at ? new Date(item.created_at).toLocaleString() : null;
    const updatedAt = item?.updated_at ? new Date(item.updated_at).toLocaleString() : null;

    if (compact) {
        return (
            <div className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                <div>Created by: <span className="font-semibold text-slate-700 dark:text-slate-200">{createdBy}</span></div>
                {updatedBy && <div>Updated by: <span className="font-semibold text-slate-700 dark:text-slate-200">{updatedBy}</span></div>}
            </div>
        );
    }

    return (
        <div className="rounded-2xl bg-slate-50 p-3 text-xs leading-5 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
            <div>Created by: <span className="font-semibold text-slate-700 dark:text-slate-200">{createdBy}</span>{createdAt ? ` · ${createdAt}` : ''}</div>
            {updatedBy && <div>Last updated by: <span className="font-semibold text-slate-700 dark:text-slate-200">{updatedBy}</span>{updatedAt ? ` · ${updatedAt}` : ''}</div>}
        </div>
    );
}

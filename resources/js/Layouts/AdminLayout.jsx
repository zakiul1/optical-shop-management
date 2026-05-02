import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/Components/Icons';
import { useI18n } from '@/i18n';

export default function AdminLayout({ title, children }) {
    const { url, props } = usePage();
    const { locale, t } = useI18n();
    const authUser = props.auth?.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [alertsOpen, setAlertsOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark);
        localStorage.setItem('theme', dark ? 'dark' : 'light');
    }, [dark]);

    useEffect(() => {
        const message = props.flash?.success || props.flash?.error;
        if (!message) return;
        setToast({ message, type: props.flash?.error ? 'error' : 'success' });
        const timer = setTimeout(() => setToast(null), 4500);
        return () => clearTimeout(timer);
    }, [props.flash?.success, props.flash?.error]);

    const systemAlerts = props.systemAlerts ?? {};
    const totalAlerts = (systemAlerts.low_stock_count ?? 0) + (systemAlerts.expiring_medicine_count ?? 0) + (systemAlerts.expired_medicine_count ?? 0);

    const navItems = [
        { href: '/dashboard', label: t('dashboard'), icon: 'dashboard' },
        { href: '/products', label: t('products'), icon: 'box' },
        { href: '/purchases', label: t('purchases'), icon: 'truck' },
        { href: '/stock-adjustments', label: t('stockAdjustments'), icon: 'swap' },
        { href: '/sales', label: t('salesInvoice'), icon: 'receipt' },
        { href: '/reports', label: t('reports'), icon: 'chart' },
        { href: '/suppliers', label: t('suppliers'), icon: 'users' },
        { href: '/categories', label: t('categories'), icon: 'tag' },
    ];

    const adminItems = authUser?.role === 'admin' ? [
        { href: '/users', label: t('usersAccess'), icon: 'shield' },
        { href: '/activity-logs', label: t('activityLogs'), icon: 'file' },
    ] : [];

    const pageSubtitle = useMemo(() => {
        if (url.startsWith('/users')) return locale === 'bn' ? 'অ্যাডমিন, ম্যানেজার ও স্টাফ এক্সেস' : 'Admin users, staff access and account status';
        if (url.startsWith('/activity-logs')) return locale === 'bn' ? 'কে কোন কাজ করেছে তার সম্পূর্ণ অডিট ট্রেইল' : 'Full audit trail showing who created, edited or deleted records';
        if (url.startsWith('/purchases')) return locale === 'bn' ? 'স্টক-ইন ও ক্রয় ম্যানেজমেন্ট' : 'Stock-in purchase management';
        if (url.startsWith('/stock-adjustments')) return locale === 'bn' ? 'ম্যানুয়াল স্টক সংশোধন ও মুভমেন্ট হিস্ট্রি' : 'Manual stock correction and movement history';
        if (url.startsWith('/sales')) return locale === 'bn' ? 'ইনভয়েস ও কাস্টমার বিক্রয় ম্যানেজমেন্ট' : 'Invoice and customer sales management';
        return t('shopSubtitle');
    }, [url, locale]);

    const logout = () => router.post('/logout');
    const switchLanguage = () => router.post('/locale', { locale: locale === 'bn' ? 'en' : 'bn' }, { preserveScroll: true });

    const avatar = (
        authUser?.photo_url
            ? <img src={authUser.photo_url} alt={authUser.name} className="h-full w-full rounded-xl object-cover" />
            : <span>{authUser?.name?.charAt(0) ?? 'U'}</span>
    );

    const sidebar = (
        <aside className="flex h-full w-80 flex-col border-r border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
            <div className="flex h-24 items-center border-b border-slate-200 px-6 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30"><Icon name="eye" /></div>
                    <div className="min-w-0"><div className="truncate text-lg font-black tracking-tight">Madina Optical</div><div className="mt-0.5 line-clamp-2 text-xs leading-4 text-slate-500">{t('shopSubtitle')}</div></div>
                </div>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-4">
                {navItems.map(item => <NavLink key={item.href} item={item} url={url} onClick={() => setSidebarOpen(false)} />)}
                {adminItems.length > 0 && <div className="px-4 pt-5 pb-2 text-xs font-black uppercase tracking-wider text-slate-400">{t('security')}</div>}
                {adminItems.map(item => <NavLink key={item.href} item={item} url={url} onClick={() => setSidebarOpen(false)} />)}
            </nav>
            <div className="border-t border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
                    <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-blue-600 text-sm font-black text-white">{avatar}</div>
                    <div className="min-w-0"><div className="truncate text-sm font-black">{authUser?.name}</div><div className="truncate text-xs text-slate-500">{authUser?.role}</div></div>
                </div>
                
            </div>
        </aside>
    );

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex">{sidebar}</div>
            {sidebarOpen && <div className="fixed inset-0 z-40 lg:hidden"><div className="absolute inset-0 bg-slate-950/40" onClick={() => setSidebarOpen(false)} /><div className="relative h-full">{sidebar}</div></div>}

            <div className="lg:pl-80">
                <header className="sticky top-0 z-30 flex h-24 items-center border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
                    <div className="flex w-full items-center justify-between gap-3 px-4 md:px-8">
                        <div className="flex min-w-0 items-center gap-3">
                            <button className="rounded-xl border border-slate-200 p-2 lg:hidden dark:border-slate-700" onClick={() => setSidebarOpen(true)}><Icon name="menu" /></button>
                            <div className="min-w-0"><h1 className="truncate text-2xl font-black md:text-3xl">{title}</h1><p className="hidden text-sm text-slate-500 md:block">{pageSubtitle}</p></div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            <div className="relative">
                                <button className="relative rounded-xl border border-slate-200 p-2 dark:border-slate-700" onClick={() => setAlertsOpen(!alertsOpen)}><Icon name="bell" />{totalAlerts > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">{totalAlerts}</span>}</button>
                                {alertsOpen && <div className="absolute right-0 z-50 mt-3 w-80 rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-800 dark:bg-slate-900"><div className="mb-2 px-2 text-sm font-black">{t('notifications')}</div><AlertLink href="/products?stock=low" icon="alert" label={t('lowStockProducts')} count={systemAlerts.low_stock_count ?? 0} tone="amber" /><AlertLink href="/reports?report_type=expiry" icon="clock" label={t('expiringMedicines')} count={systemAlerts.expiring_medicine_count ?? 0} tone="orange" /><AlertLink href="/reports?report_type=expiry" icon="alert" label={t('expiredMedicines')} count={systemAlerts.expired_medicine_count ?? 0} tone="red" /></div>}
                            </div>
                            <button title={t('language')} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-black dark:border-slate-700" onClick={switchLanguage}><Icon name="globe" className="h-4 w-4" /> <span>{locale === 'bn' ? 'BN' : 'EN'}</span></button>
                            <button className="rounded-xl border border-slate-200 p-2 dark:border-slate-700" onClick={() => setDark(!dark)}><Icon name={dark ? 'sun' : 'moon'} /></button>
                            <div className="relative">
                                <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700" onClick={() => setUserMenuOpen(!userMenuOpen)}><div className="grid h-6 w-6 place-items-center overflow-hidden rounded-lg bg-blue-600 text-xs text-white">{avatar}</div><span className="hidden text-sm font-bold md:block">{authUser?.name}</span></button>
                                {userMenuOpen && <div className="absolute right-0 z-50 mt-3 w-72 rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-800 dark:bg-slate-900"><div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950"><div className="font-black">{authUser?.name}</div><div className="text-xs text-slate-500">{authUser?.email}</div><div className="mt-2 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{authUser?.role}</div></div><button onClick={logout} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-black text-white"><Icon name="logout" /> {t('logout')}</button></div>}
                            </div>
                        </div>
                    </div>
                </header>
                <main className="p-4 md:p-8">{children}</main>
            </div>

            {toast && <div className={`fixed bottom-5 right-5 z-50 w-[calc(100%-2rem)] max-w-sm rounded-3xl px-5 py-4 text-sm font-semibold text-white shadow-2xl ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}><div className="flex items-start gap-3"><Icon name={toast.type === 'error' ? 'alert' : 'check'} className="mt-0.5 h-5 w-5 shrink-0" /><div className="flex-1"><div className="font-black">{toast.type === 'error' ? t('actionFailed') : t('actionCompleted')}</div><div className="mt-0.5 font-semibold text-white/90">{toast.message}</div></div><button onClick={() => setToast(null)} className="rounded-lg bg-white/15 px-2 py-1 text-xs">{t('close')}</button></div></div>}
        </div>
    );
}

function NavLink({ item, url, onClick }) {
    const active = url === item.href || url.startsWith(`${item.href}/`);
    return <Link href={item.href} onClick={onClick} className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'}`}><Icon name={item.icon} />{item.label}</Link>;
}

function AlertLink({ href, icon, label, count, tone }) {
    const tones = { amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300', orange: 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300', red: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300' };
    return <Link href={href} className={`mb-2 flex items-center justify-between rounded-2xl p-3 ${tones[tone]}`}><span className="flex items-center gap-2 text-sm font-semibold"><Icon name={icon} /> {label}</span><span className="rounded-full bg-white/70 px-2 py-1 text-xs font-black dark:bg-slate-950/60">{count}</span></Link>;
}

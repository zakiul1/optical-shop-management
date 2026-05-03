import { Link, router, usePage } from '@inertiajs/react';
import { Icon } from '@/Components/Icons';
import { useI18n } from '@/i18n';

export default function WebsiteLayout({ settings, children }) {
    const { url } = usePage();
    const { locale } = useI18n();
    const bn = locale === 'bn';
    const switchLanguage = () => router.post('/locale', { locale: bn ? 'en' : 'bn' }, { preserveScroll: true });
    const nav = [
        ['/', bn ? 'হোম' : 'Home'], ['/about', bn ? 'আমাদের সম্পর্কে' : 'About'], ['/services', bn ? 'সেবা' : 'Services'],
        ['/collections', bn ? 'কালেকশন' : 'Collections'], ['/gallery', bn ? 'গ্যালারি' : 'Gallery'], ['/contact', bn ? 'যোগাযোগ' : 'Contact'],
    ];
    return (
        <div className="min-h-screen bg-white text-slate-950">
            <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
                    <Link href="/" className="flex items-center gap-3">
                        {settings?.logo_url ? <img src={settings.logo_url} className="h-12 w-12 rounded-2xl object-cover" /> : <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25"><Icon name="eye" /></div>}
                        <div><div className="text-lg font-black">{settings?.site_name ?? 'Madina Optical'}</div><div className="text-xs font-medium text-slate-500">{bn ? (settings?.tagline_bn ?? 'আধুনিক চক্ষু সেবা ও অপটিক্যাল') : (settings?.tagline ?? 'Modern eye care and optical center')}</div></div>
                    </Link>
                    <nav className="hidden items-center gap-1 lg:flex">
                        {nav.map(([href, label]) => { const active = href === '/' ? url === '/' : url.startsWith(href); return <Link key={href} href={href} className={`rounded-full px-4 py-2 text-sm font-bold ${active ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{label}</Link>; })}
                    </nav>
                    <div className="flex items-center gap-2">
                        <button onClick={switchLanguage} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-black">{bn ? 'BN' : 'EN'}</button>
                        <Link href="/contact" className="hidden rounded-full bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/25 md:block">{bn ? 'অ্যাপয়েন্টমেন্ট' : 'Appointment'}</Link>
                    </div>
                </div>
            </header>
            <main>{children}</main>
            <footer className="bg-slate-950 text-white">
                <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4 md:px-6">
                    <div className="md:col-span-2"><div className="text-2xl font-black">{settings?.site_name ?? 'Madina Optical'}</div><p className="mt-3 max-w-xl text-slate-300">{bn ? (settings?.short_description_bn ?? 'আধুনিক মেশিনে চোখ পরীক্ষা, মানসম্মত চশমা, লেন্স ও চোখের যত্নের বিশ্বস্ত সেবা।') : (settings?.short_description ?? 'Computerized eye checkup, premium eyewear, lenses and trusted eye care support under one roof.')}</p></div>
                    <div><div className="font-black">{bn ? 'যোগাযোগ' : 'Contact'}</div><div className="mt-3 space-y-2 text-sm text-slate-300"><p>{settings?.phone}</p><p>{settings?.email}</p><p>{bn ? settings?.address_bn : settings?.address}</p></div></div>
                    <div><div className="font-black">{bn ? 'সময়' : 'Opening Hours'}</div><p className="mt-3 text-sm text-slate-300">{settings?.opening_hours ?? 'Every day: 9:00 AM - 9:00 PM'}</p></div>
                </div>
            </footer>
        </div>
    );
}

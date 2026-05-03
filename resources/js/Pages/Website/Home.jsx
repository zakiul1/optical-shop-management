import { Link } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import WebsiteLayout from '@/Layouts/WebsiteLayout';
import { Icon } from '@/Components/Icons';
import { useI18n } from '@/i18n';

const tx = (item, key, bn) => bn ? (item?.[`${key}_bn`] || item?.[key]) : item?.[key];

export default function Home({ settings, slides = [], services = [], featuredProducts = [], gallery = [], testimonials = [] }) {
    const { locale } = useI18n();
    const bn = locale === 'bn';
    const activeSlides = slides.length ? slides : [{}];
    const [active, setActive] = useState(0);
    const hero = activeSlides[active] || activeSlides[0] || {};

    useEffect(() => {
        if (activeSlides.length <= 1) return undefined;
        const timer = window.setInterval(() => setActive((current) => (current + 1) % activeSlides.length), 6000);
        return () => window.clearInterval(timer);
    }, [activeSlides.length]);

    const heroStats = useMemo(() => [
        { value: '৳100', label: bn ? 'রেফারেল স্লিপ' : 'Referral slip' },
        { value: '2+', label: bn ? 'যোগাযোগ নাম্বার' : 'Contact numbers' },
        { value: '100%', label: bn ? 'যত্নশীল সেবা' : 'Care support' },
    ], [bn]);

    return <WebsiteLayout settings={settings}>
        <section className="relative overflow-hidden bg-slate-950 text-white">
            <div className="absolute inset-0">
                {hero.image_url ? <img key={hero.id || 'hero'} src={hero.image_url} className="h-full w-full object-cover opacity-80 transition-all duration-700" /> : <div className="h-full w-full bg-gradient-to-br from-blue-700 via-slate-950 to-cyan-700" />}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/78 to-slate-950/20" />
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950 to-transparent" />
            </div>

            <div className="relative mx-auto grid min-h-[720px] max-w-7xl items-center gap-10 px-4 py-20 md:px-6 lg:grid-cols-[1.05fr_.95fr]">
                <div>
                    <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-black text-cyan-100 backdrop-blur">
                        {tx(hero, 'eyebrow', bn) || (bn ? 'মদিনা চক্ষু সেবা এন্ড অপটিক্যাল' : 'Madina Eye Care & Optical')}
                    </span>
                    <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight tracking-tight md:text-6xl lg:text-7xl">
                        {tx(hero, 'title', bn) || (bn ? 'আধুনিক মেশিনে চোখ পরীক্ষা ও প্রিমিয়াম চশমা সেবা' : 'Advanced eye testing and premium optical care')}
                    </h1>
                    <p className="mt-6 max-w-2xl text-lg leading-9 text-slate-200 md:text-xl">
                        {tx(hero, 'subtitle', bn) || (bn ? 'অত্যাধুনিক কম্পিউটার ও রেটিনোস্কোপের মাধ্যমে চোখ পর্যবেক্ষণ, সঠিক পাওয়ারের চশমা, মানসম্মত ফ্রেম, লেন্স এবং প্রয়োজনীয় চোখের চিকিৎসা সহায়তা।' : 'Computerized eye examination, advanced retinoscope-based observation, accurate prescription eyewear, quality frames, lenses and essential eye-care support.')}
                    </p>
                    <div className="mt-9 flex flex-wrap gap-3">
                        <Link href={hero.button_url || '/contact'} className="rounded-full bg-blue-600 px-8 py-4 font-black text-white shadow-2xl shadow-blue-600/35">
                            {tx(hero, 'button_text', bn) || (bn ? 'অ্যাপয়েন্টমেন্ট নিন' : 'Book Appointment')}
                        </Link>
                        <Link href="/collections" className="rounded-full border border-white/20 bg-white/10 px-8 py-4 font-black text-white backdrop-blur hover:bg-white/20">
                            {bn ? 'কালেকশন দেখুন' : 'View Collection'}
                        </Link>
                    </div>

                    {activeSlides.length > 1 && <div className="mt-10 flex items-center gap-3">
                        {activeSlides.map((slide, index) => <button key={slide.id || index} type="button" onClick={() => setActive(index)} className={`h-3 rounded-full transition-all ${index === active ? 'w-10 bg-blue-400' : 'w-3 bg-white/35'}`} aria-label={`Hero slide ${index + 1}`} />)}
                    </div>}
                </div>

                <div className="hidden lg:block">
                    <div className="rounded-[2.5rem] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
                        <div className="grid gap-4">
                            {heroStats.map((item) => <div key={item.label} className="rounded-[1.5rem] bg-white p-5 text-slate-950 shadow-xl">
                                <div className="text-3xl font-black text-blue-600">{item.value}</div>
                                <div className="mt-1 text-sm font-bold text-slate-500">{item.label}</div>
                            </div>)}
                        </div>
                        <div className="mt-5 rounded-[1.5rem] bg-blue-600 p-6 text-white">
                            <div className="text-sm font-black uppercase tracking-widest text-blue-100">{bn ? 'যোগাযোগ' : 'Contact'}</div>
                            <div className="mt-2 text-2xl font-black">{settings?.phone || '01328-009121, 01709-216853'}</div>
                            <p className="mt-2 text-sm leading-6 text-blue-100">{bn ? (settings?.address_bn || 'পচাবহর আল্লাহ ভোলা মার্কেট বাজার, ইসলামপুর, জামালপুর') : (settings?.address || 'Pochabohor Allah Bhola Market Bazar, Islampur, Jamalpur')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
            <div className="mb-8 flex items-end justify-between">
                <div>
                    <p className="font-black text-blue-600">{bn ? 'আমাদের সেবা' : 'Our Services'}</p>
                    <h2 className="mt-2 text-3xl font-black">{bn ? 'চোখের যত্নের জন্য প্রয়োজনীয় সব সেবা' : 'Complete care for your eyes'}</h2>
                </div>
                <Link href="/services" className="hidden rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white md:block">{bn ? 'সব সেবা' : 'All Services'}</Link>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
                {services.slice(0, 6).map((service) => <div key={service.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600"><Icon name={service.icon || 'eye'} /></div>
                    <h3 className="mt-5 text-xl font-black">{tx(service, 'title', bn)}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{tx(service, 'description', bn)}</p>
                </div>)}
            </div>
        </section>

        <section className="bg-slate-50">
            <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
                <h2 className="text-3xl font-black">{bn ? 'ফিচার্ড অপটিক্যাল কালেকশন' : 'Featured optical collection'}</h2>
                <div className="mt-8 grid gap-5 md:grid-cols-4">
                    {featuredProducts.map((product) => <Link href="/collections" key={product.id} className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200">
                        <div className="h-48 bg-slate-100">{product.images?.[0]?.url ? <img src={product.images[0].url} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-blue-600"><Icon name="box" className="h-12 w-12" /></div>}</div>
                        <div className="p-5"><div className="text-lg font-black">{product.name}</div><p className="mt-2 text-sm text-slate-500">৳ {Number(product.sale_price).toFixed(2)}</p></div>
                    </Link>)}
                </div>
            </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
            <div className="rounded-[2.5rem] bg-gradient-to-r from-blue-600 to-cyan-500 p-8 text-white md:p-12">
                <h2 className="text-3xl font-black md:text-5xl">{bn ? 'চোখ পরীক্ষা করতে চান?' : 'Need an eye checkup?'}</h2>
                <p className="mt-4 max-w-2xl text-white/85">{bn ? 'আপনার সুবিধামতো সময় জানিয়ে অ্যাপয়েন্টমেন্ট পাঠান। আমাদের টিম দ্রুত যোগাযোগ করবে।' : 'Send an appointment request with your preferred time. Our team will contact you quickly.'}</p>
                <Link href="/contact" className="mt-8 inline-flex rounded-full bg-white px-7 py-4 font-black text-blue-700">{bn ? 'যোগাযোগ করুন' : 'Contact Now'}</Link>
            </div>
        </section>
    </WebsiteLayout>;
}

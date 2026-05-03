import { useMemo, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Input, Textarea } from '@/Components/Input';
import { Icon } from '@/Components/Icons';

const blank = {
    eyebrow: '', eyebrow_bn: '', title: '', title_bn: '', subtitle: '', subtitle_bn: '',
    button_text: 'Book Appointment', button_text_bn: 'অ্যাপয়েন্টমেন্ট নিন', button_url: '/contact',
    sort_order: 0, is_active: true, image: null,
};

const fromSlide = (slide) => ({
    eyebrow: slide?.eyebrow || '', eyebrow_bn: slide?.eyebrow_bn || '', title: slide?.title || '', title_bn: slide?.title_bn || '',
    subtitle: slide?.subtitle || '', subtitle_bn: slide?.subtitle_bn || '', button_text: slide?.button_text || '',
    button_text_bn: slide?.button_text_bn || '', button_url: slide?.button_url || '/contact', sort_order: slide?.sort_order || 0,
    is_active: Boolean(slide?.is_active), image: null,
});

export default function HeroSlides({ slides = [] }) {
    const [editing, setEditing] = useState(null);
    const create = useForm(blank);
    const edit = useForm(blank);

    const activeCount = slides.filter((slide) => slide.is_active).length;

    const startEdit = (slide) => {
        setEditing(slide);
        edit.setData(fromSlide(slide));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const submitCreate = (event) => {
        event.preventDefault();
        create.post('/website-admin/hero-slides', {
            forceFormData: true,
            onSuccess: () => create.reset(),
        });
    };

    const submitEdit = (event) => {
        event.preventDefault();
        if (!editing) return;
        edit.transform((data) => ({ ...data, _method: 'put' })).post(`/website-admin/hero-slides/${editing.id}`, {
            forceFormData: true,
            onSuccess: () => {
                edit.reset();
                setEditing(null);
            },
        });
    };

    return (
        <AdminLayout title="Hero Banner Management" subtitle="Manage multiple homepage hero banners and website slider content">
            <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
                <HeroForm
                    mode={editing ? 'edit' : 'create'}
                    title={editing ? 'Edit Hero Banner' : 'Add New Hero Banner'}
                    form={editing ? edit : create}
                    submit={editing ? submitEdit : submitCreate}
                    currentImage={editing?.image_url}
                    cancel={editing ? () => { setEditing(null); edit.reset(); } : null}
                />

                <div className="rounded-[2rem] bg-gradient-to-br from-blue-600 to-cyan-500 p-6 text-white shadow-xl shadow-blue-600/20">
                    <div className="inline-flex rounded-full bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-widest">Website Slider</div>
                    <h2 className="mt-5 text-3xl font-black">Multiple hero banners are supported</h2>
                    <p className="mt-3 text-sm leading-7 text-white/85">
                        Add more than one active banner and the public website homepage will automatically show them as a premium slider.
                    </p>
                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-white/15 p-4">
                            <div className="text-3xl font-black">{slides.length}</div>
                            <div className="text-xs font-bold text-white/75">Total Banners</div>
                        </div>
                        <div className="rounded-2xl bg-white/15 p-4">
                            <div className="text-3xl font-black">{activeCount}</div>
                            <div className="text-xs font-bold text-white/75">Active Slider Items</div>
                        </div>
                    </div>
                    <div className="mt-6 rounded-2xl bg-white p-4 text-slate-800">
                        <div className="text-sm font-black">Recommended image size</div>
                        <p className="mt-1 text-xs leading-6 text-slate-500">Use a wide banner image, around 1920×800 or similar ratio. Keep title text readable on mobile.</p>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex items-end justify-between gap-4">
                <div>
                    <p className="text-sm font-black uppercase tracking-widest text-blue-600">Hero banners</p>
                    <h2 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">Homepage slider items</h2>
                </div>
                <div className="text-sm font-bold text-slate-500">Drag sorting is not enabled yet. Use sort number.</div>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
                {slides.map((slide) => (
                    <HeroCard key={slide.id} slide={slide} onEdit={() => startEdit(slide)} />
                ))}
                {!slides.length && <div className="rounded-[2rem] bg-white p-10 text-center font-bold text-slate-500 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">No hero banner found.</div>}
            </div>
        </AdminLayout>
    );
}

function HeroForm({ title, mode, form, submit, currentImage, cancel }) {
    const { data, setData, processing, errors } = form;
    const preview = useMemo(() => data.image ? URL.createObjectURL(data.image) : currentImage, [data.image, currentImage]);

    return (
        <form onSubmit={submit} className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-black uppercase tracking-widest text-blue-600">{mode === 'edit' ? 'Update banner' : 'Create banner'}</p>
                    <h2 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">{title}</h2>
                </div>
                {cancel && <button type="button" onClick={cancel} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-600 dark:border-slate-700 dark:text-slate-200">Cancel Edit</button>}
            </div>

            <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_300px]">
                <div className="grid gap-4 md:grid-cols-2">
                    <Input label="Small Label / Eyebrow" value={data.eyebrow} onChange={(e) => setData('eyebrow', e.target.value)} />
                    <Input label="Small Label Bangla" value={data.eyebrow_bn} onChange={(e) => setData('eyebrow_bn', e.target.value)} />
                    <Input label="Title" value={data.title} onChange={(e) => setData('title', e.target.value)} error={errors.title} />
                    <Input label="Title Bangla" value={data.title_bn} onChange={(e) => setData('title_bn', e.target.value)} />
                    <Textarea label="Subtitle" rows="5" value={data.subtitle} onChange={(e) => setData('subtitle', e.target.value)} />
                    <Textarea label="Subtitle Bangla" rows="5" value={data.subtitle_bn} onChange={(e) => setData('subtitle_bn', e.target.value)} />
                    <Input label="Button Text" value={data.button_text} onChange={(e) => setData('button_text', e.target.value)} />
                    <Input label="Button Text Bangla" value={data.button_text_bn} onChange={(e) => setData('button_text_bn', e.target.value)} />
                    <Input label="Button URL" value={data.button_url} onChange={(e) => setData('button_url', e.target.value)} />
                    <Input label="Sort Order" type="number" value={data.sort_order} onChange={(e) => setData('sort_order', e.target.value)} />
                    <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-black dark:border-slate-700">
                        <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />
                        Active on website slider
                    </label>
                </div>

                <div className="rounded-[1.5rem] border border-dashed border-blue-300 bg-blue-50/60 p-4 dark:border-blue-900 dark:bg-blue-950/30">
                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-slate-950">
                        {preview ? <img src={preview} className="h-48 w-full object-cover" /> : <div className="grid h-48 place-items-center text-blue-600"><Icon name="image" className="h-12 w-12" /></div>}
                    </div>
                    <label className="mt-4 block cursor-pointer rounded-2xl bg-slate-950 px-5 py-3 text-center text-sm font-black text-white dark:bg-white dark:text-slate-950">
                        Upload Banner Image
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => setData('image', e.target.files?.[0] || null)} />
                    </label>
                    {errors.image && <p className="mt-2 text-xs font-bold text-red-500">{errors.image}</p>}
                    <p className="mt-3 text-xs leading-6 text-slate-500">Preview will update before saving. Image is optional, but recommended.</p>
                </div>
            </div>

            <button disabled={processing} className="mt-6 rounded-2xl bg-blue-600 px-7 py-3 font-black text-white shadow-lg shadow-blue-600/20 disabled:opacity-60">
                {processing ? 'Saving...' : (mode === 'edit' ? 'Update Hero Banner' : 'Save Hero Banner')}
            </button>
        </form>
    );
}

function HeroCard({ slide, onEdit }) {
    return (
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <div className="relative">
                {slide.image_url ? <img src={slide.image_url} className="h-64 w-full object-cover" /> : <div className="grid h-64 place-items-center bg-blue-50 text-blue-600"><Icon name="image" className="h-10 w-10" /></div>}
                <div className="absolute left-4 top-4 rounded-full bg-white/90 px-4 py-2 text-xs font-black text-slate-800 shadow-sm">Sort: {slide.sort_order}</div>
                <div className={`absolute right-4 top-4 rounded-full px-4 py-2 text-xs font-black shadow-sm ${slide.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{slide.is_active ? 'Active' : 'Inactive'}</div>
            </div>
            <div className="p-5">
                <div className="text-xs font-black uppercase tracking-widest text-blue-600">{slide.eyebrow_bn || slide.eyebrow || 'Hero Banner'}</div>
                <div className="mt-2 text-xl font-black text-slate-950 dark:text-white">{slide.title_bn || slide.title}</div>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{slide.subtitle_bn || slide.subtitle}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                    <button type="button" onClick={onEdit} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white">Edit</button>
                    <button type="button" onClick={() => router.delete(`/website-admin/hero-slides/${slide.id}`)} className="rounded-xl bg-red-50 px-4 py-2 text-sm font-black text-red-600 dark:bg-red-950/40">Delete</button>
                </div>
            </div>
        </div>
    );
}

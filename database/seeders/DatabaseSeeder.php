<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\HeroSlide;
use App\Models\WebsiteService;
use App\Models\WebsiteGalleryItem;
use App\Models\WebsiteSetting;
use App\Models\WebsiteTestimonial;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->firstOrCreate(
            ['email' => 'admin@optical.test'],
            [
                'name' => 'Shop Admin',
                'phone' => '01700000000',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'is_active' => true,
            ]
        );



        WebsiteSetting::query()->firstOrCreate([], [
            'site_name' => 'Madina Chokh Seba & Optical',
            'tagline' => 'Computerized eye checkup and optical center',
            'tagline_bn' => 'কম্পিউটারাইজড চক্ষু পরীক্ষা ও অপটিক্যাল সেন্টার',
            'short_description' => 'Madina Chokh Seba & Optical provides computerized eye examination and retinoscope-based eye observation, prescription glasses, quality frames, lenses and essential eye treatment support.',
            'short_description_bn' => 'মদিনা চক্ষু সেবা এন্ড অপটিক্যালে অত্যাধুনিক কম্পিউটার ও রেটিনোস্কোপের মাধ্যমে চোখ পরীক্ষা করা হয়। এখানে সঠিক পাওয়ারের চশমা, মানসম্মত ফ্রেম, লেন্স এবং চোখের প্রয়োজনীয় চিকিৎসা সহায়তা দেওয়া হয়।',
            'phone' => '01328-009121, 01709-216853',
            'whatsapp' => '01709-216853',
            'email' => 'info@madinaoptical.test',
            'address' => 'Pochabohor Allah Bhola Market Bazar, Islampur, Jamalpur',
            'address_bn' => 'পচাবহর আল্লাহ ভোলা মার্কেট বাজার, ইসলামপুর, জামালপুর',
            'opening_hours' => 'Every day: 9:00 AM - 9:00 PM | Referral slip: 100 Taka only',
            'seo_title' => 'Madina Chokh Seba & Optical - Computerized Eye Checkup in Islampur Jamalpur',
            'seo_title_bn' => 'মদিনা চক্ষু সেবা এন্ড অপটিক্যাল - ইসলামপুর জামালপুরে কম্পিউটারাইজড চোখ পরীক্ষা',
            'seo_description' => 'Computerized eye testing, retinoscope observation, prescription glasses, fitting and eye-care drops at Madina Chokh Seba & Optical.',
            'seo_description_bn' => 'মদিনা চক্ষু সেবা এন্ড অপটিক্যালে কম্পিউটার ও রেটিনোস্কোপে চোখ পরীক্ষা, চশমা, ফিটিং এবং চোখের ড্রপস পাওয়া যায়।',
        ]);

        HeroSlide::query()->updateOrCreate(['title' => 'Advanced eye care with modern diagnostic machines'], [
            'eyebrow' => 'Madina Eye Care & Optical',
            'eyebrow_bn' => 'মদিনা চক্ষু সেবা এন্ড অপটিক্যাল',
            'title_bn' => 'আধুনিক মেশিনে চোখ পরীক্ষা ও নির্ভরযোগ্য অপটিক্যাল সেবা',
            'subtitle' => 'Experience modern computerized eye examination, retinoscope observation, prescription glasses, premium frames, quality lenses and essential eye-care support in Islampur, Jamalpur.',
            'subtitle_bn' => 'ইসলামপুর, জামালপুরে অত্যাধুনিক কম্পিউটার ও রেটিনোস্কোপের মাধ্যমে চোখ পর্যবেক্ষণ, সঠিক পাওয়ারের চশমা, প্রিমিয়াম ফ্রেম, মানসম্মত লেন্স এবং প্রয়োজনীয় চোখের যত্নের সেবা।',
            'button_text' => 'Book Eye Checkup',
            'button_text_bn' => 'চোখ পরীক্ষা বুক করুন',
            'button_url' => '/contact',
            'image_path' => 'website/hero-advanced-eye-care.png',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        HeroSlide::query()->updateOrCreate(['title' => 'Computerized eye checkup with retinoscope observation'], [
            'eyebrow' => 'Prescription & Optical Support',
            'eyebrow_bn' => 'চশমার ব্যবস্থাপত্র ও অপটিক্যাল সাপোর্ট',
            'title_bn' => 'সঠিক পাওয়ার, চশমা ফিটিং ও চোখের যত্ন এক জায়গায়',
            'subtitle' => 'Referral slip, computerized eye power checking, prescription eyewear, fitting support and essential eye drops are available at Madina Chokh Seba & Optical.',
            'subtitle_bn' => 'মদিনা চক্ষু সেবা এন্ড অপটিক্যালে রেফারেল স্লিপ, কম্পিউটারাইজড চোখের পাওয়ার পরীক্ষা, প্রেসক্রিপশন চশমা, ফিটিং সাপোর্ট এবং প্রয়োজনীয় চোখের ড্রপস পাওয়া যায়।',
            'button_text' => 'View Services',
            'button_text_bn' => 'সেবা দেখুন',
            'button_url' => '/services',
            'image_path' => 'website/prescription-slip.png',
            'sort_order' => 2,
            'is_active' => true,
        ]);

        collect([
            ['icon' => 'eye', 'title' => 'Computerized Eye Checkup', 'title_bn' => 'কম্পিউটারাইজড চোখ পরীক্ষা', 'description' => 'Modern computerized support for accurate eye power checking and prescription guidance.', 'description_bn' => 'আধুনিক কম্পিউটার সাপোর্টে চোখের পাওয়ার পরীক্ষা ও প্রেসক্রিপশন গাইডেন্স।'],
            ['icon' => 'sparkles', 'title' => 'Retinoscope Eye Observation', 'title_bn' => 'রেটিনোস্কোপে চোখ পর্যবেক্ষণ', 'description' => 'Retinoscope-based observation helps assess refractive condition with better confidence.', 'description_bn' => 'রেটিনোস্কোপের মাধ্যমে চোখ পর্যবেক্ষণ করে পাওয়ার ও রিফ্র্যাকশন সম্পর্কে ভালো ধারণা নেওয়া হয়।'],
            ['icon' => 'box', 'title' => 'Prescription Glasses & Fitting', 'title_bn' => 'পাওয়ার চশমা ও ফিটিং', 'description' => 'Quality lenses, frames and fitting support prepared according to your eye prescription.', 'description_bn' => 'প্রেসক্রিপশন অনুযায়ী মানসম্মত লেন্স, ফ্রেম এবং চশমা ফিটিং সেবা।'],
            ['icon' => 'shield', 'title' => 'Eye Drops & Eye Treatment Support', 'title_bn' => 'চোখের ড্রপস ও চিকিৎসা সহায়তা', 'description' => 'Essential eye drops and eye-care product guidance are available with careful support.', 'description_bn' => 'প্রয়োজনীয় চোখের ড্রপস ও চোখের যত্নের পণ্য সম্পর্কে সহায়তা পাওয়া যায়।'],
            ['icon' => 'check', 'title' => 'Blue Cut, Photochromic & Progressive Lens', 'title_bn' => 'ব্লু-কাট, ফটোক্রোমিক ও প্রোগ্রেসিভ লেন্স', 'description' => 'Modern lens options for digital screen comfort, sunlight adaptation and reading support.', 'description_bn' => 'ডিজিটাল স্ক্রিন, সূর্যালোক এবং পড়ার সুবিধার জন্য আধুনিক লেন্স অপশন।'],
            ['icon' => 'users', 'title' => 'Family Friendly Optical Service', 'title_bn' => 'পরিবারের সবার জন্য অপটিক্যাল সেবা', 'description' => 'Friendly eye care and eyewear support for children, adults and seniors.', 'description_bn' => 'শিশু, বড় এবং বয়স্কদের জন্য যত্নশীল চক্ষু ও অপটিক্যাল সেবা।'],
        ])->each(fn (array $service) => WebsiteService::query()->firstOrCreate(['title' => $service['title']], [...$service, 'is_active' => true, 'is_featured' => true]));

        WebsiteGalleryItem::query()->firstOrCreate(['image_path' => 'website/prescription-slip.png'], [
            'title' => 'Madina Optical prescription slip',
            'title_bn' => 'মদিনা অপটিক্যাল চশমার ব্যবস্থাপত্র',
            'category' => 'Prescription',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        WebsiteTestimonial::query()->firstOrCreate(['name' => 'Happy Customer'], [
            'designation' => 'Customer',
            'designation_bn' => 'কাস্টমার',
            'message' => 'Computerized eye checkup service was helpful and the prescription glass fitting was very good.',
            'message_bn' => 'কম্পিউটারাইজড চোখ পরীক্ষা ও চশমা ফিটিং সেবা খুব ভালো লেগেছে।',
            'rating' => 5,
            'is_active' => true,
        ]);


        collect([
            ['name' => 'Medicine', 'type' => 'medicine'],
            ['name' => 'Eye Drop', 'type' => 'medicine'],
            ['name' => 'Eye Ointment', 'type' => 'medicine'],
            ['name' => 'Glass', 'type' => 'glass'],
            ['name' => 'Frame', 'type' => 'glass'],
            ['name' => 'Lens', 'type' => 'glass'],
            ['name' => 'Sunglass', 'type' => 'glass'],
            ['name' => 'Reading Glass', 'type' => 'glass'],
        ])->each(function (array $category): void {
            Category::query()->firstOrCreate(
                ['slug' => Str::slug($category['name'])],
                [
                    'name' => $category['name'],
                    'type' => $category['type'],
                    'is_active' => true,
                ]
            );
        });
    }
}

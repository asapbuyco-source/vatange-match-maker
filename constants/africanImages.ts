/**
 * African imagery constants for Vantage Match
 *
 * Using high-quality, culturally rich images from Unsplash
 * featuring African couples, Cameroon cityscapes, and lifestyle.
 * All photos are free to use under Unsplash License.
 */

export interface AfricanImage {
    url: string;
    credit: string;
    alt: string;
    city?: string;
}

// ---- Cameroon-Specific Couple Images ----
// Beautiful, authentic African couples for profile cards
export const AFRICAN_COUPLE_IMAGES: AfricanImage[] = [
    {
        url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=800&fit=crop&q=85',
        credit: '@havisitsme',
        alt: 'Elegant African couple smiling',
        city: 'Douala',
    },
    {
        url: 'https://images.unsplash.com/photo-1609096458733-95b38583ac4e?w=600&h=800&fit=crop&q=85',
        credit: '@eyeandeyephotography',
        alt: 'Romantic African couple outdoors',
        city: 'Yaoundé',
    },
    {
        url: 'https://images.unsplash.com/photo-1574272774991-2399c8c0e3db?w=600&h=800&fit=crop&q=85',
        credit: '@eyeandeyephotography',
        alt: 'African couple holding hands at sunset',
        city: 'Kribi',
    },
    {
        url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=800&fit=crop&q=85',
        credit: '@brookecagle',
        alt: 'Beautiful African woman smiling',
        city: 'Douala',
    },
    {
        url: 'https://images.unsplash.com/photo-1529111290557-82f6d5c6cf85?w=600&h=800&fit=crop&q=85',
        credit: '@heftiba',
        alt: 'African couple in city setting',
        city: 'Bafoussam',
    },
    {
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop&q=85',
        credit: '@reenub',
        alt: 'Confident African man portrait',
        city: 'Yaoundé',
    },
    {
        url: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=600&h=800&fit=crop&q=85',
        credit: '@claybanks',
        alt: 'Young African woman professional',
        city: 'Bamenda',
    },
    {
        url: 'https://images.unsplash.com/photo-1530785602389-07594beba81b?w=600&h=800&fit=crop&q=85',
        credit: '@brookecagle',
        alt: 'African man with warm smile',
        city: 'Douala',
    },
    {
        url: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=600&h=800&fit=crop&q=85',
        credit: '@cg_trombly',
        alt: 'African woman in colourful outfit',
        city: 'Limbe',
    },
    {
        url: 'https://images.unsplash.com/photo-1613068687893-5e85b4638b56?w=600&h=800&fit=crop&q=85',
        credit: '@eyeandeyephotography',
        alt: 'African couple dancing joyfully',
        city: 'Douala',
    },
];

// ---- Success Story / Testimonial Images ----
// For landing page "Real Love Stories" section
export const TESTIMONIAL_IMAGES: AfricanImage[] = [
    {
        url: 'https://images.unsplash.com/photo-1609096458733-95b38583ac4e?w=800&h=600&fit=crop&q=85',
        credit: '@eyeandeyephotography',
        alt: 'Happy African couple kissing outdoors',
        city: 'Douala',
    },
    {
        url: 'https://images.unsplash.com/photo-1574272774991-2399c8c0e3db?w=800&h=600&fit=crop&q=85',
        credit: '@eyeandeyephotography',
        alt: 'African newly-weds at ceremony',
        city: 'Yaoundé',
    },
    {
        url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&h=600&fit=crop&q=85',
        credit: '@havisitsme',
        alt: 'African couple laughing together',
        city: 'Kribi',
    },
    {
        url: 'https://images.unsplash.com/photo-1529111290557-82f6d5c6cf85?w=800&h=600&fit=crop&q=85',
        credit: '@heftiba',
        alt: 'Young African couple at beach',
        city: 'Limbe',
    },
];

// ---- Landing Page Hero Background Images ----
export const HERO_IMAGES: AfricanImage[] = [
    {
        url: 'https://images.unsplash.com/photo-1609096458733-95b38583ac4e?w=1200&h=900&fit=crop&q=90',
        credit: '@eyeandeyephotography',
        alt: 'Beautiful African couple hero shot',
        city: 'Douala',
    },
    {
        url: 'https://images.unsplash.com/photo-1574272774991-2399c8c0e3db?w=1200&h=900&fit=crop&q=90',
        credit: '@eyeandeyephotography',
        alt: 'African couple sunset silhouette',
        city: 'Kribi',
    },
];

// ---- Demo / Onboarding Avatar Fallbacks ----
// Used when a user hasn't uploaded a photo yet
export const AVATAR_PLACEHOLDERS = {
    male: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&q=80',
    female: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=300&h=300&fit=crop&q=80',
    other: 'https://images.unsplash.com/photo-1529111290557-82f6d5c6cf85?w=300&h=300&fit=crop&q=80',
};

// ---- Mock Cameroon Profiles (used in App.tsx demo) ----
// Beautiful, diverse, authentic African profile photos
export const DEMO_PROFILE_IMAGES = {
    amina: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=800&fit=crop&q=85',
    grace: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=600&h=800&fit=crop&q=85',
    fatima: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=600&h=800&fit=crop&q=85',
    chloe: 'https://images.unsplash.com/photo-1609096458733-95b38583ac4e?w=600&h=800&fit=crop&q=85',
    claire: 'https://images.unsplash.com/photo-1574272774991-2399c8c0e3db?w=600&h=800&fit=crop&q=85',
    kevin: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop&q=85',
    marcus: 'https://images.unsplash.com/photo-1530785602389-07594beba81b?w=600&h=800&fit=crop&q=85',
    christian: 'https://images.unsplash.com/photo-1613068687893-5e85b4638b56?w=600&h=800&fit=crop&q=85',
};

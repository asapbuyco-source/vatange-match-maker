/**
 * Photo Upload Service
 * Primary:  Cloudinary (with AI content moderation via aws_rek)
 * Fallback: Firebase Storage (when Cloudinary cloud name not configured)
 * Dev mode: Local Object URL
 *
 * Cloudinary setup:
 *   1. Create free account at https://cloudinary.com
 *   2. Settings → Upload → Upload Presets → Create unsigned preset
 *      named "vantage_profile_photos"
 *   3. Enable content moderation in the preset
 *
 * Firebase Storage setup (automatic — uses firebaseApp.ts config):
 *   Console → Storage → Rules:
 *     allow read, write: if request.auth != null;
 */

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, isFirebaseConfigured } from './firebaseApp';

const CLOUDINARY_CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'vantage_profile_photos';

export interface UploadResult {
    url: string;
    publicId: string;
    width: number;
    height: number;
    source: 'cloudinary' | 'firebase' | 'local';
}

// ── Cloudinary Upload ─────────────────────────────────────────────────────────
const uploadToCloudinary = async (file: File): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_PRESET);
    formData.append('folder', 'vantage/profiles');
    formData.append('transformation', 'c_fill,g_face,w_800,h_800,q_auto,f_auto');
    formData.append('moderation', 'aws_rek'); // AI content moderation

    const resp = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
        { method: 'POST', body: formData },
    );

    if (!resp.ok) {
        const err = await resp.json() as { error?: { message: string } };
        throw new Error(err.error?.message || `Cloudinary upload failed: ${resp.status}`);
    }

    const data = await resp.json() as {
        secure_url: string;
        public_id: string;
        width: number;
        height: number;
        moderation?: { status: string }[];
    };

    if (data.moderation?.[0]?.status === 'rejected') {
        throw new Error(
            'Photo was rejected by content moderation. Please use an appropriate profile photo.',
        );
    }

    return {
        url: data.secure_url,
        publicId: data.public_id,
        width: data.width,
        height: data.height,
        source: 'cloudinary',
    };
};

// ── Firebase Storage Upload ───────────────────────────────────────────────────
const uploadToFirebase = async (file: File): Promise<UploadResult> => {
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `profiles/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const storageRef = ref(storage, path);

    await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: { source: 'vantage-match', uploadedAt: new Date().toISOString() },
    });

    const url = await getDownloadURL(storageRef);
    return { url, publicId: path, width: 800, height: 800, source: 'firebase' };
};

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Upload a profile photo.
 * Uses Cloudinary if configured (has AI moderation),
 * then Firebase Storage as fallback,
 * then local object URL in dev if neither is configured.
 */
export const uploadProfilePhoto = async (file: File): Promise<UploadResult> => {
    if (file.size > 10 * 1024 * 1024) throw new Error('File must be under 10 MB');
    if (!file.type.startsWith('image/')) throw new Error('File must be an image');

    // 1. Cloudinary (preferred — has AI moderation)
    if (CLOUDINARY_CLOUD) {
        return uploadToCloudinary(file);
    }

    // 2. Firebase Storage (no moderation, but still persistent)
    if (isFirebaseConfigured()) {
        console.info('[Photo] Cloudinary not set — uploading to Firebase Storage');
        return uploadToFirebase(file);
    }

    // 3. Dev fallback: local object URL
    console.warn('[Photo] No upload service configured — using local object URL');
    return {
        url: URL.createObjectURL(file),
        publicId: `local_${Date.now()}`,
        width: 400,
        height: 400,
        source: 'local',
    };
};

/**
 * Delete a photo.
 * Cloudinary deletion must be done server-side (requires API secret).
 * Firebase Storage deletion handled here directly.
 */
export const deletePhoto = async (publicId: string, source?: string): Promise<void> => {
    if (source === 'firebase' || publicId.startsWith('profiles/')) {
        const { deleteObject, ref: fbRef } = await import('firebase/storage');
        await deleteObject(fbRef(storage, publicId));
        return;
    }
    // Cloudinary deletion — log for server-side handling
    console.info('[Photo] Cloudinary deletePhoto should be called server-side. public_id:', publicId);
};

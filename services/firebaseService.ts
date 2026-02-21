/**
 * Firebase Service — replaces supabaseService.ts
 * Powers: user profiles, matches, real-time chat messages,
 *         photo storage (Firebase Storage)
 *
 * Firestore Collections:
 *   /profiles/{userId}
 *   /matches/{matchId}
 *   /messages/{matchId}/msgs/{msgId}   ← sub-collection for realtime
 *
 * Firebase Console setup checklist:
 *   1. Enable Firestore Database (start in test mode or set rules below)
 *   2. Enable Authentication → Anonymous (for guest sessions)
 *   3. Enable Storage
 *
 * Recommended Firestore Security Rules:
 * ─────────────────────────────────────
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     match /profiles/{userId} {
 *       allow read: if true;
 *       allow write: if request.auth.uid == userId;
 *     }
 *     match /matches/{matchId} {
 *       allow read, write: if request.auth != null;
 *     }
 *     match /messages/{matchId}/msgs/{msgId} {
 *       allow read, write: if request.auth != null;
 *     }
 *   }
 * }
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    Timestamp,
    type DocumentData,
    type QuerySnapshot,
    type Unsubscribe,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebaseApp';

// ── Helpers ──────────────────────────────────────────────────────────────────

const tsToIso = (ts: unknown): string => {
    if (ts instanceof Timestamp) return ts.toDate().toISOString();
    if (typeof ts === 'string') return ts;
    return new Date().toISOString();
};

// ── Types (same shape as old supabaseService so nothing else needs to change) ─

export interface ProfileRow {
    id: string;
    name: string;
    age: number;
    job: string;
    bio: string;
    image_url: string;
    interests: string[];
    location: string;
    gender: 'male' | 'female' | 'other';
    verified: boolean;
    subscription_tier: string;
    last_active: string;
    created_at: string;
}

export interface MatchRow {
    id: string;
    user_id: string;
    match_id: string;
    ai_score: number | null;
    created_at: string;
}

export interface MessageRow {
    id: string;
    match_id: string;
    sender_id: string;
    text: string;
    is_read: boolean;
    created_at: string;
}

// ── Profiles ─────────────────────────────────────────────────────────────────

/** Create or update a profile document (merge). */
export const upsertProfile = async (
    profile: Omit<ProfileRow, 'created_at'>,
): Promise<ProfileRow | null> => {
    if (!isFirebaseConfigured()) {
        console.warn('[Firebase] Not configured — running in local mode.');
        return null;
    }
    try {
        const ref = doc(db, 'profiles', profile.id);
        const existing = await getDoc(ref);
        const now = new Date().toISOString();
        const data = {
            ...profile,
            last_active: now,
            created_at: existing.exists() ? existing.data().created_at : now,
        };
        await setDoc(ref, data, { merge: true });
        return data as ProfileRow;
    } catch (err) {
        console.error('[Firebase] upsertProfile failed:', err);
        return null;
    }
};

/** Get a single profile by userId. */
export const getProfile = async (id: string): Promise<ProfileRow | null> => {
    if (!isFirebaseConfigured()) return null;
    try {
        const snap = await getDoc(doc(db, 'profiles', id));
        if (!snap.exists()) return null;
        const d = snap.data() as DocumentData;
        return { ...d, id: snap.id, created_at: tsToIso(d.created_at), last_active: tsToIso(d.last_active) } as ProfileRow;
    } catch (err) {
        console.error('[Firebase] getProfile failed:', err);
        return null;
    }
};

/**
 * Get discover profiles filtered by city and age range.
 * Returns up to 30 profiles that are not the current user.
 */
export const getDiscoverProfiles = async (
    currentUserId: string,
    city: string,
    ageMin: number,
    ageMax: number,
): Promise<ProfileRow[]> => {
    if (!isFirebaseConfigured()) return [];
    try {
        const q = query(
            collection(db, 'profiles'),
            where('location', '==', city),
            where('age', '>=', ageMin),
            where('age', '<=', ageMax),
        );
        const snap = await getDocs(q);
        return snap.docs
            .filter(d => d.id !== currentUserId)
            .slice(0, 30)
            .map(d => {
                const data = d.data() as DocumentData;
                return {
                    ...data,
                    id: d.id,
                    created_at: tsToIso(data.created_at),
                    last_active: tsToIso(data.last_active),
                } as ProfileRow;
            });
    } catch (err) {
        console.error('[Firebase] getDiscoverProfiles failed:', err);
        return [];
    }
};

// ── Matches ───────────────────────────────────────────────────────────────────

/**
 * Create a match document.
 * matchId is deterministic: sorted concat of both user IDs to avoid duplicates.
 */
export const createMatch = async (
    userId: string,
    matchId: string,
    aiScore?: number,
): Promise<MatchRow | null> => {
    if (!isFirebaseConfigured()) return null;
    try {
        // Deterministic doc ID prevents duplicates
        const docId = [userId, matchId].sort().join('_');
        const ref = doc(db, 'matches', docId);
        const existing = await getDoc(ref);
        if (existing.exists()) return { ...existing.data(), id: docId } as MatchRow;

        const now = serverTimestamp();
        const data = {
            id: docId,
            user_id: userId,
            match_id: matchId,
            ai_score: aiScore ?? null,
            created_at: now,
        };
        await setDoc(ref, data);
        return { ...data, created_at: new Date().toISOString() } as MatchRow;
    } catch (err) {
        console.error('[Firebase] createMatch failed:', err);
        return null;
    }
};

/** Get all matches for a user (they appear as user_id OR match_id). */
export const getMatches = async (userId: string): Promise<MatchRow[]> => {
    if (!isFirebaseConfigured()) return [];
    try {
        const [asUser, asMatch] = await Promise.all([
            getDocs(query(collection(db, 'matches'), where('user_id', '==', userId))),
            getDocs(query(collection(db, 'matches'), where('match_id', '==', userId))),
        ]);

        const all = new Map<string, MatchRow>();
        const docToRow = (snap: QuerySnapshot) =>
            snap.docs.forEach(d => {
                const data = d.data() as DocumentData;
                all.set(d.id, { ...data, id: d.id, created_at: tsToIso(data.created_at) } as MatchRow);
            });
        docToRow(asUser);
        docToRow(asMatch);
        return Array.from(all.values());
    } catch (err) {
        console.error('[Firebase] getMatches failed:', err);
        return [];
    }
};

// ── Messages ──────────────────────────────────────────────────────────────────

/** Send a message into the match's sub-collection. */
export const sendMessage = async (
    matchId: string,
    senderId: string,
    text: string,
): Promise<MessageRow | null> => {
    if (!isFirebaseConfigured()) return null;
    try {
        const msgsRef = collection(db, 'messages', matchId, 'msgs');
        const data = {
            match_id: matchId,
            sender_id: senderId,
            text,
            is_read: false,
            created_at: serverTimestamp(),
        };
        const docRef = await addDoc(msgsRef, data);
        return { ...data, id: docRef.id, created_at: new Date().toISOString() } as MessageRow;
    } catch (err) {
        console.error('[Firebase] sendMessage failed:', err);
        return null;
    }
};

/** Fetch all messages for a match (one-time, ordered by time). */
export const getMessages = async (matchId: string): Promise<MessageRow[]> => {
    if (!isFirebaseConfigured()) return [];
    try {
        const q = query(
            collection(db, 'messages', matchId, 'msgs'),
            orderBy('created_at', 'asc'),
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => {
            const data = d.data() as DocumentData;
            return {
                ...data,
                id: d.id,
                created_at: tsToIso(data.created_at),
            } as MessageRow;
        });
    } catch (err) {
        console.error('[Firebase] getMessages failed:', err);
        return [];
    }
};

/**
 * Real-time subscription to new messages in a match.
 * Uses Firestore onSnapshot — much simpler than Supabase WebSocket.
 * Returns an unsubscribe function (call on component unmount).
 */
export const subscribeToMessages = (
    matchId: string,
    onMessage: (msg: MessageRow) => void,
): (() => void) => {
    if (!isFirebaseConfigured()) return () => { };

    const q = query(
        collection(db, 'messages', matchId, 'msgs'),
        orderBy('created_at', 'asc'),
    );

    // Track already-seen IDs so onSnapshot initial load doesn't re-fire all
    const seen = new Set<string>();
    let initialized = false;

    const unsub: Unsubscribe = onSnapshot(q, snap => {
        if (!initialized) {
            // Seed seen set with existing messages on first load (don't fire callbacks)
            snap.docs.forEach(d => seen.add(d.id));
            initialized = true;
            return;
        }
        snap.docChanges().forEach(change => {
            if (change.type === 'added' && !seen.has(change.doc.id)) {
                seen.add(change.doc.id);
                const data = change.doc.data() as DocumentData;
                onMessage({
                    ...data,
                    id: change.doc.id,
                    created_at: tsToIso(data.created_at),
                } as MessageRow);
            }
        });
    }, err => {
        console.error('[Firebase] subscribeToMessages error:', err);
    });

    return unsub;
};

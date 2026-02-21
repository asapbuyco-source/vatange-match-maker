/**
 * supabaseService.ts — Migration shim
 *
 * This app has migrated from Supabase to Firebase.
 * All exports are now re-exported from firebaseService.ts so any
 * existing code importing from this file continues to work without changes.
 *
 * You can safely delete this file once all imports are updated to
 * point directly at firebaseService.ts.
 */
export * from './firebaseService';

import type { Database } from '$lib/data-access/database.types';
import type { Session, User } from '@supabase/supabase-js';
import { SupabaseClient } from '@supabase/supabase-js';

declare global {
    namespace App {
        interface Locals {
            supabase: SupabaseClient<Database>;
            safeGetSession(): Promise<{
                session: Session | null;
                user: User | null;
            }>;
        }
        interface PageData {
            session?: Session | null;
            user?: User | null;
        }
        // interface Error {}
		    // interface PageState {}
        // interface Platform {}
    }
}

export {};
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nlwzzcintlgniluxthck.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sd3p6Y2ludGxnbmlsdXh0aGNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NzE0OTksImV4cCI6MjA3NzA0NzQ5OX0.wsIATT18eaW2qinY0jUhMw0etw9UEozcM-GIMP4k3i4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
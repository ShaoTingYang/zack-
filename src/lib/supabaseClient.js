import { createClient } from '@supabase/supabase-js';

// Strip stray BOM (U+FEFF) / zero-width space (U+200B) characters that some
// env-var tooling (Vercel CLI, shell piping, etc.) can silently inject, which
// otherwise breaks the browser's Headers API with a non-ISO-8859-1 error.
const cleanEnvValue = (value) => (value || '').replace(/[﻿​]/g, '').trim();

const supabaseUrl = cleanEnvValue(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = cleanEnvValue(import.meta.env.VITE_SUPABASE_ANON_KEY);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

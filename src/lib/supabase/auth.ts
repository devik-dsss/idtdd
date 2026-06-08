import { createClient } from "./client";

export async function signUp(
    email: string,
    password: string,
    fullName: string,
    username: string,
    usn?: string,
    branch?: string,
    section?: string
) {
    const supabase = createClient();

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: undefined, // Disable email confirmation
            data: {
                full_name: fullName,
                username,
            },
        },
    });

    if (authError) throw authError;

    // Create or update profile (upsert to handle existing profiles from triggers)
    if (authData.user) {
        const { error: profileError } = await (supabase.from("profiles") as any).upsert({
            id: authData.user.id,
            email,
            full_name: fullName,
            username,
            usn: usn || null,
            branch: branch || null,
            section: section || null,
        }, { onConflict: "id" });

        if (profileError) throw profileError;
    }

    return authData;
}

export async function signIn(email: string, password: string) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
    return data;
}

export async function signOut() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

export async function resetPassword(email: string) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;
    return data;
}

export async function updatePassword(newPassword: string) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
    });

    if (error) throw error;
    return data;
}

export async function resendVerificationEmail(email: string) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.resend({
        type: "signup",
        email,
    });

    if (error) throw error;
    return data;
}

export async function getCurrentUser() {
    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    return user;
}

export async function getSession() {
    const supabase = createClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();
    return session;
}

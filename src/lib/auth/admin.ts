/** Emails allowed to access the admin section. Compared case-insensitively. */
export const ADMIN_EMAILS = ["devikadmin@gmail.com", "dishant@gmail.com", "sampreet@gmail.com"];

/** Returns true if the given email is allowed to access the admin section. */
export function isAdminEmail(email: string | null | undefined): boolean {
    return !!email && ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

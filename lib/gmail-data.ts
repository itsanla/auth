import type { GmailAccount } from "@/types";

export function parseGmailData(): GmailAccount[] {
    const accounts: GmailAccount[] = [];
    const env = process.env;

    // Find all GMAIL{number}_USERNAME entries
    Object.keys(env).forEach((key) => {
        const match = key.match(/^GMAIL(\d+)_USERNAME$/);
        if (match) {
            const num = match[1];
            const email = env[`GMAIL${num}_USERNAME`] || "";
            const key = env[`GMAIL${num}_AUTHENTICATOR`] || "";
            const codes = env[`GMAIL${num}_BACKUP_CODES`] || "";

            if (email && key) {
                accounts.push({
                    email,
                    key,
                    backupCodes: codes.split(",").map((c) => c.trim()).filter(Boolean),
                });
            }
        }
    });

    // Sort by email for consistent ordering
    return accounts.sort((a, b) => a.email.localeCompare(b.email));
}

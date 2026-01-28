"use client";

import OTPCard from "./otp-card";
import type { GmailAccount } from "@/types";

interface OTPGridProps {
    accounts: GmailAccount[];
}

export default function OTPGrid({ accounts }: OTPGridProps) {
    if (accounts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                    <svg
                        className="w-10 h-10 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No accounts found</h3>
                <p className="text-gray-500 text-center max-w-sm">
                    Configure your GMAIL32_USERNAME and GMAIL32_AUTHENTICATOR environment
                    variables to add accounts.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {accounts.map((account, index) => (
                <OTPCard
                    key={index}
                    email={account.email}
                    secretKey={account.key}
                    backupCodes={account.backupCodes}
                />
            ))}
        </div>
    );
}

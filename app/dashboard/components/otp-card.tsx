"use client";

import { useState, useEffect, useCallback } from "react";
import * as OTPAuth from "otpauth";
import BackupModal from "./backup-modal";

interface OTPCardProps {
    email: string;
    secretKey: string;
    backupCodes: string[];
}

export default function OTPCard({ email, secretKey, backupCodes }: OTPCardProps) {
    const [otp, setOtp] = useState("");
    const [timeRemaining, setTimeRemaining] = useState(30);
    const [copied, setCopied] = useState(false);
    const [showBackup, setShowBackup] = useState(false);

    const generateOTP = useCallback(() => {
        try {
            const totp = new OTPAuth.TOTP({
                issuer: "Google",
                label: email,
                algorithm: "SHA1",
                digits: 6,
                period: 30,
                secret: OTPAuth.Secret.fromBase32(secretKey.toUpperCase()),
            });
            return totp.generate();
        } catch {
            return "------";
        }
    }, [email, secretKey]);

    useEffect(() => {
        const updateOTP = () => {
            const now = Math.floor(Date.now() / 1000);
            const remaining = 30 - (now % 30);
            setTimeRemaining(remaining);
            setOtp(generateOTP());
        };

        updateOTP();
        const interval = setInterval(updateOTP, 1000);
        return () => clearInterval(interval);
    }, [generateOTP]);

    const copyOTP = async () => {
        try {
            await navigator.clipboard.writeText(otp);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const progress = (timeRemaining / 30) * 100;
    const isExpiring = timeRemaining <= 5;

    return (
        <>
            <div className="group relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
                {/* Email Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                        {email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{email}</p>
                        <p className="text-gray-500 text-xs">Google Authenticator</p>
                    </div>
                </div>

                {/* OTP Display */}
                <button
                    onClick={copyOTP}
                    className="w-full py-4 px-6 bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl mb-4 hover:from-slate-700 hover:to-slate-600 transition-all duration-200 active:scale-[0.98] group/btn"
                >
                    {copied ? (
                        <div className="flex items-center justify-center gap-2 text-green-400">
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                            <span className="text-lg font-semibold">Copied!</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2">
                            <span
                                className={`text-3xl font-mono font-bold tracking-[0.3em] ${isExpiring ? "text-orange-400 animate-pulse" : "text-white"
                                    }`}
                            >
                                {otp.slice(0, 3)} {otp.slice(3)}
                            </span>
                            <svg
                                className="w-5 h-5 text-gray-400 opacity-0 group-hover/btn:opacity-100 transition-opacity"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                    )}
                </button>

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Expires in</span>
                        <span className={isExpiring ? "text-orange-400" : ""}>
                            {timeRemaining}s
                        </span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ease-linear ${isExpiring
                                    ? "bg-gradient-to-r from-orange-500 to-red-500"
                                    : "bg-gradient-to-r from-purple-500 to-pink-500"
                                }`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Backup Codes Button */}
                <button
                    onClick={() => setShowBackup(true)}
                    className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-gray-300 hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                        />
                    </svg>
                    View Backup Codes
                </button>
            </div>

            <BackupModal
                email={email}
                backupCodes={backupCodes}
                isOpen={showBackup}
                onClose={() => setShowBackup(false)}
            />
        </>
    );
}

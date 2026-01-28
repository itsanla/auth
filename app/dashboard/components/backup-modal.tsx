"use client";

import { useState, useEffect } from "react";

interface BackupModalProps {
    email: string;
    backupCodes: string[];
    isOpen: boolean;
    onClose: () => void;
}

export default function BackupModal({
    email,
    backupCodes,
    isOpen,
    onClose,
}: BackupModalProps) {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [usedCodes, setUsedCodes] = useState<Set<number>>(new Set());
    const [isSaving, setIsSaving] = useState(false);

    // Load used codes from API
    useEffect(() => {
        if (isOpen) {
            fetch("/api/used-codes")
                .then((res) => res.json())
                .then((data) => {
                    if (data[email]) {
                        setUsedCodes(new Set(data[email]));
                    }
                })
                .catch(() => {});
        }
    }, [isOpen, email]);

    const copyCode = async (code: string, index: number) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 1500);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const toggleUsed = async (index: number) => {
        const newSet = new Set(usedCodes);
        if (newSet.has(index)) {
            newSet.delete(index);
        } else {
            newSet.add(index);
        }
        setUsedCodes(newSet);

        // Save to API + GitHub
        setIsSaving(true);
        try {
            await fetch("/api/used-codes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    usedIndexes: Array.from(newSet),
                }),
            });
        } catch (error) {
            console.error("Failed to save:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-white">Backup Codes</h3>
                        <p className="text-sm text-gray-400 truncate max-w-[280px]">
                            {email}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Backup Codes Grid */}
                {backupCodes.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                        {backupCodes.map((code, index) => {
                            const isUsed = usedCodes.has(index);
                            return (
                                <div key={index} className="relative">
                                    <button
                                        onClick={() => copyCode(code, index)}
                                        className={`w-full p-3 border rounded-xl text-center font-mono text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                                            isUsed
                                                ? "bg-red-500/20 border-red-500/50 text-red-300 line-through"
                                                : "bg-white/5 hover:bg-white/10 border-white/10 text-white"
                                        }`}
                                    >
                                        {copiedIndex === index ? (
                                            <span className="text-green-400 text-sm">Copied!</span>
                                        ) : (
                                            code
                                        )}
                                    </button>
                                    <button
                                        onClick={() => toggleUsed(index)}
                                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center transition-all duration-200 hover:scale-110"
                                    >
                                        {isUsed && (
                                            <svg
                                                className="w-4 h-4 text-red-400"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400">
                        No backup codes available
                    </div>
                )}

                {/* Footer */}
                <p className="mt-6 text-xs text-gray-500 text-center">
                    {isSaving ? "Syncing to GitHub..." : "Click on a code to copy it to clipboard"}
                </p>
            </div>
        </div>
    );
}

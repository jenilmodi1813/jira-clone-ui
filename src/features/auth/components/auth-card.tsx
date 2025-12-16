"use client"

interface AuthCardProps {
    children: React.ReactNode
    title?: string // Optional now as we might render it inside
    error?: string
}

export function AuthCard({ children, title, error }: AuthCardProps) {
    return (
        <div className="w-full bg-white shadow-2xl rounded-[3px] border border-[var(--border)] overflow-hidden">
            {title && (
                <div className="p-8 pb-0 text-center">
                    <h2 className="text-base font-bold text-[#172b4d]">{title}</h2>
                </div>
            )}

            <div className="p-8 pt-10">
                {error && (
                    <div className="mb-4 p-2 text-sm text-red-600 bg-red-50 rounded border border-red-100 flex items-center justify-center text-center">
                        {error}
                    </div>
                )}
                {children}
            </div>
        </div>
    )
}

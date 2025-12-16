export function JiraLogo({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M11.58 3.19c-.31-.62-1.25-.62-1.56 0L5.78 11.66c-.31.62.14 1.34.83 1.34H11V3.19z"
                fill="#2684FF" // Blue
            />
            <path
                d="M13.78 6.94c-.31-.62-1.25-.62-1.56 0L8 15.42c-.31.62.14 1.34.83 1.34h5.17l-1.22-9.82z"
                fill="#2684FF" // Blue (Simulating the icon)
            />
            <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                fill="currentColor"
                className="text-[#0052cc]"
                fillOpacity="0" // Using a simple shape for now or complex path
            />
            {/* Actual Jira-like shape */}
            <path d="M11.185 1.733c-.357-.597-1.218-.597-1.575 0L3.13 12.569c-.357.597.073 1.35.772 1.35H10.4V1.733z" fill="#0052CC" />
            <path d="M12.923 10.15a.906.906 0 0 0-1.575 0l-1.925 3.22L12.923 10.15z" fill="#2684FF" />
            <path d="M13.6 6.845a.91.91 0 0 0-1.575 0l-5.4 9.034c-.357.597.073 1.35.772 1.35h11.233c.7 0 1.13-.753.772-1.35L13.6 6.845z" fill="#0052CC" />
        </svg>
    )
}

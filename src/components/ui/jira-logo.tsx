export function JiraLogo({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M11.33 2.152a.667.667 0 0 0-1.16 0L1.171 17.15c-.29.484.06.11.06-.5s-.35.016-.06.5c.29.484.636.484.926 0l9.006-14.998z"
                fill="#0052CC"
                className="hidden" // Hiding the old paths if any
            />
            {/* Clean Jira Logo Shapes */}
            <g fillRule="evenodd">
                <path
                    d="M12.634 10.354l-1.954 3.208a.933.933 0 0 1-1.583 0L7.143 10.354a.933.933 0 0 1 .813-1.442h3.865a.933.933 0 0 1 .813 1.442z"
                    fill="#0052CC"
                />
                <path
                    d="M15.118 6.5l-5.32 8.718a1.2 1.2 0 0 1-2.035 0L2.443 6.5a1.2 1.2 0 0 1 1.018-1.848h10.639c.9 0 1.448.974 1.018 1.848z"
                    fill="#2684FF"
                />
                <path
                    d="M21.56 12.5l-5.32 8.718a1.2 1.2 0 0 1-2.035 0L8.885 12.5a1.2 1.2 0 0 1 1.017-1.848H20.54c.901 0 1.449.974 1.019 1.848z"
                    fill="#0052CC"
                />
            </g>
        </svg>
    )
}

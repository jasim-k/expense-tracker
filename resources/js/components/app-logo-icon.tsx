import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect
                x="3"
                y="9"
                width="34"
                height="24"
                rx="6"
                stroke="currentColor"
                strokeWidth="3"
            />
            <path
                d="M3 16H37"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
            />
            <circle cx="28" cy="24.5" r="3" fill="currentColor" />
            <path
                d="M9 27.5L15 20.5L19.5 25L27 16"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.55"
            />
        </svg>
    );
}

import React from "react";

interface LogoProps {
    className?: string;
    size?: "sm" | "md" | "lg" | "xl";
    showText?: boolean;
}

export default function Logo({ className = "", size = "md", showText = false }: LogoProps) {
    const sizeClasses = {
        sm: "w-6 h-6",
        md: "w-10 h-10",
        lg: "w-16 h-16",
        xl: "w-24 h-24"
    };

    const finalClass = className || sizeClasses[size];

    return (
        <div className="flex items-center gap-2">
            <svg 
                viewBox="0 0 200 200" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className={finalClass}
            >
            {/* Background Shape */}
            <rect width="200" height="200" rx="40" fill="url(#paint0_linear)" />
            
            {/* Stylized 'C' */}
            <path 
                d="M130 50C100 50 60 70 60 100C60 130 100 150 130 150" 
                stroke="white" 
                strokeWidth="24" 
                strokeLinecap="round"
            />
            
            {/* Play Button integrated */}
            <path 
                d="M110 70L150 100L110 130V70Z" 
                fill="white"
            />

            {/* Gradients */}
            <defs>
                <linearGradient id="paint0_linear" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#f472b6" /> {/* Pastel Pink */}
                    <stop offset="1" stopColor="#e81cff" /> {/* Deep Pink/Purple accent */}
                </linearGradient>
            </defs>
            </svg>
            {showText && (
                <span className="text-xl font-black text-white tracking-tighter uppercase">
                    Samehadakuu
                </span>
            )}
        </div>
    );
}

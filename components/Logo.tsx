import React from 'react';
import { Flame } from 'lucide-react';

interface LogoProps {
    className?: string;
    showText?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = "", showText = true, size = 'md' }: LogoProps) {
    const sizeClasses = {
        sm: { iconBox: 'w-7 h-7', icon: 'w-4 h-4', text: 'text-lg' },
        md: { iconBox: 'w-9 h-9', icon: 'w-5 h-5', text: 'text-xl' },
        lg: { iconBox: 'w-12 h-12', icon: 'w-6 h-6', text: 'text-3xl' },
    };

    const s = sizeClasses[size];

    return (
        <div className={`flex items-center gap-2.5 group ${className}`}>
            <div className={`relative flex items-center justify-center ${s.iconBox} rounded-xl bg-gradient-to-br from-primary to-orange-600 shadow-lg shadow-primary/25 group-hover:rotate-12 transition-all duration-300`}>
                <Flame className={`${s.icon} text-white fill-white/30`} strokeWidth={2.5} />
                <div className="absolute inset-0 bg-white/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            {showText && (
                <span className={`${s.text} font-black tracking-tight text-white drop-shadow-sm`}>
                    Same<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">hadakuu</span>
                </span>
            )}
        </div>
    );
}

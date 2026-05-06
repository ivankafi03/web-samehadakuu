"use client";

import React, { createContext, useContext, useState } from "react";

interface WidgetContextType {
    rewardVisible: boolean;
    setRewardVisible: (visible: boolean) => void;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export function WidgetProvider({ children }: { children: React.ReactNode }) {
    const [rewardVisible, setRewardVisible] = useState(false);

    return (
        <WidgetContext.Provider value={{ rewardVisible, setRewardVisible }}>
            {children}
        </WidgetContext.Provider>
    );
}

export function useWidget() {
    const context = useContext(WidgetContext);
    if (context === undefined) {
        throw new Error("useWidget must be used within a WidgetProvider");
    }
    return context;
}

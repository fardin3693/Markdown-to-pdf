"use client";

import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
} from "react";
import { useMotionValue, useSpring, MotionValue } from "framer-motion";

interface CursorContextType {
    cursorX: MotionValue<number>;
    cursorY: MotionValue<number>;
    followX: MotionValue<number>;
    followY: MotionValue<number>;
    enableCursor: boolean;
    enableCursorFollow: boolean;
    setEnableCursor: (enabled: boolean) => void;
    setEnableCursorFollow: (enabled: boolean) => void;
    isHovering: boolean;
    setIsHovering: (hovering: boolean) => void;
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

interface CursorProviderProps {
    children: React.ReactNode;
    global?: boolean;
}

export function CursorProvider({
    children,
    global = false,
}: CursorProviderProps) {
    const cursorX = useMotionValue(0);
    const cursorY = useMotionValue(0);

    // Spring physics for smooth following animation
    const followX = useSpring(cursorX, {
        stiffness: 500,
        damping: 50,
        bounce: 0,
    });
    const followY = useSpring(cursorY, {
        stiffness: 500,
        damping: 50,
        bounce: 0,
    });

    const [enableCursor, setEnableCursor] = useState(true);
    const [enableCursorFollow, setEnableCursorFollow] = useState(true);
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
        },
        [cursorX, cursorY],
    );

    useEffect(() => {
        if (global) {
            window.addEventListener("mousemove", handleMouseMove);
        }
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, [global, handleMouseMove]);

    // Hide default cursor when custom cursor is enabled
    useEffect(() => {
        if (enableCursor || enableCursorFollow) {
            document.body.style.cursor = "none";
        } else {
            document.body.style.cursor = "auto";
        }
        return () => {
            document.body.style.cursor = "auto";
        };
    }, [enableCursor, enableCursorFollow]);

    return (
        <CursorContext.Provider
            value={{
                cursorX,
                cursorY,
                followX,
                followY,
                enableCursor,
                enableCursorFollow,
                setEnableCursor,
                setEnableCursorFollow,
                isHovering,
                setIsHovering,
            }}
        >
            {children}
        </CursorContext.Provider>
    );
}

export function useCursor() {
    const context = useContext(CursorContext);
    if (context === undefined) {
        throw new Error("useCursor must be used within a CursorProvider");
    }
    return context;
}

"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { useCursor } from "./CursorContext";

interface CursorProps extends HTMLMotionProps<"div"> {
    asChild?: boolean;
}

export function Cursor({ asChild, ...props }: CursorProps) {
    const { cursorX, cursorY, enableCursor, isHovering } = useCursor();

    if (!enableCursor) return null;

    const Comp = asChild ? motion.div : motion.div;

    return (
        <Comp
            className="fixed top-0 left-0 w-3 h-3 bg-slate-900 rounded-full pointer-events-none z-[9999] border-2 border-white shadow-lg"
            style={{
                x: cursorX,
                y: cursorY,
                translateX: "-50%",
                translateY: "-50%",
                scale: isHovering ? 1.5 : 1,
            }}
            transition={{
                type: "spring",
                stiffness: 500,
                damping: 28,
                mass: 0.5,
            }}
            {...props}
        />
    );
}

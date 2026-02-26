"use client";

import React from "react";
import { motion, HTMLMotionProps, SpringOptions } from "framer-motion";
import { useCursor } from "./CursorContext";

type CursorFollowSide = "top" | "right" | "bottom" | "left";
type CursorFollowAlign = "start" | "center" | "end";

interface CursorFollowProps extends HTMLMotionProps<"div"> {
    asChild?: boolean;
    side?: CursorFollowSide;
    sideOffset?: number;
    align?: CursorFollowAlign;
    alignOffset?: number;
    transition?: SpringOptions;
}

export function CursorFollow({
    asChild,
    side = "bottom",
    sideOffset = 15,
    align = "end",
    alignOffset = 5,
    transition = { stiffness: 500, damping: 50, bounce: 0 },
    children,
    ...props
}: CursorFollowProps) {
    const { followX, followY, enableCursorFollow } = useCursor();

    if (!enableCursorFollow) return null;

    const Comp = asChild ? motion.div : motion.div;

    // Calculate position based on side and align
    const getPositionStyles = () => {
        const baseStyles: React.CSSProperties = {
            position: "fixed",
            top: 0,
            left: 0,
            pointerEvents: "none",
            zIndex: 9999,
        };

        let xTransform = 0;
        let yTransform = 0;

        // Side offset
        switch (side) {
            case "top":
                yTransform = -sideOffset;
                break;
            case "right":
                xTransform = sideOffset;
                break;
            case "bottom":
                yTransform = sideOffset;
                break;
            case "left":
                xTransform = -sideOffset;
                break;
        }

        // Align offset
        switch (align) {
            case "start":
                if (side === "top" || side === "bottom") {
                    xTransform = -alignOffset;
                } else {
                    yTransform = -alignOffset;
                }
                break;
            case "center":
                if (side === "top" || side === "bottom") {
                    xTransform = 0;
                } else {
                    yTransform = 0;
                }
                break;
            case "end":
                if (side === "top" || side === "bottom") {
                    xTransform = alignOffset;
                } else {
                    yTransform = alignOffset;
                }
                break;
        }

        return {
            ...baseStyles,
            x: followX,
            y: followY,
            translateX: `${xTransform}px`,
            translateY: `${yTransform}px`,
        };
    };

    return (
        <Comp style={getPositionStyles()} transition={transition} {...props}>
            {children}
        </Comp>
    );
}

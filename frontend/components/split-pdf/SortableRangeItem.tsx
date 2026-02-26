"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Input } from "@/components/ui/input";
import { GripVertical, Trash2 } from "lucide-react";

interface SortableRangeItemProps {
    id: string;
    index: number;
    range: { id: string; from: string; to: string };
    totalPages: number;
    onRangeChange: (id: string, field: "from" | "to", value: string) => void;
    onRemove: (id: string) => void;
    canRemove: boolean;
    isActive?: boolean;
    onClick?: () => void;
    colorClass?: string;
}

export default function SortableRangeItem({
    id,
    index,
    range,
    totalPages,
    onRangeChange,
    onRemove,
    canRemove,
    isActive = false,
    onClick,
    colorClass = "bg-blue-100 border-blue-400",
}: SortableRangeItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const fromError =
        parseInt(range.from, 10) > totalPages || parseInt(range.from, 10) < 1;
    const toError =
        parseInt(range.to, 10) > totalPages || parseInt(range.to, 10) < 1;
    const orderError = parseInt(range.from, 10) > parseInt(range.to, 10);

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={onClick}
            className={`flex items-center gap-1 p-1.5 rounded border transition-all cursor-pointer ${
                isDragging
                    ? "border-blue-300 bg-blue-50"
                    : isActive
                      ? `${colorClass} ring-2 ring-offset-1 ring-blue-400`
                      : "border-slate-200 bg-slate-50 hover:border-slate-300"
            }`}
        >
            <button
                {...attributes}
                {...listeners}
                className="cursor-grab hover:bg-slate-200 p-0.5 rounded shrink-0"
                onClick={(e) => e.stopPropagation()}
            >
                <GripVertical className="w-3 h-3 text-slate-400" />
            </button>

            <span className="text-[10px] font-semibold text-slate-500 w-10 shrink-0">
                R{index + 1}
            </span>

            <Input
                type="number"
                min={1}
                max={totalPages}
                value={range.from}
                onChange={(e) => {
                    e.stopPropagation();
                    onRangeChange(id, "from", e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                className={`w-10 h-6 text-xs px-1 ${fromError ? "border-red-400" : ""}`}
            />
            <span className="text-[10px] text-slate-400">-</span>
            <Input
                type="number"
                min={1}
                max={totalPages}
                value={range.to}
                onChange={(e) => {
                    e.stopPropagation();
                    onRangeChange(id, "to", e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                className={`w-10 h-6 text-xs px-1 ${toError || orderError ? "border-red-400" : ""}`}
            />

            <div className="flex-1" />

            {canRemove && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(id);
                    }}
                    className="p-1 hover:bg-red-100 rounded text-slate-400 hover:text-red-500 shrink-0 ml-1"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );
}

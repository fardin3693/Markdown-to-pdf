'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
    Bold,
    Italic,
    Strikethrough,
    Heading1,
    Heading2,
    Heading3,
    Link,
    Code,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    Search,
    Image,
    Table,
    Minus,
} from 'lucide-react';

interface EditorToolbarProps {
    onFormat: (format: string, wrapper?: { before: string; after: string }) => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    onToggleFind: () => void;
}

const ToolbarButton = ({
    icon: Icon,
    label,
    onClick,
    disabled = false,
}: {
    icon: React.ElementType;
    label: string;
    onClick: () => void;
    disabled?: boolean;
}) => (
    <Button
        variant="ghost"
        size="sm"
        onClick={onClick}
        disabled={disabled}
        className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40"
        title={label}
    >
        <Icon className="h-4 w-4" />
    </Button>
);

const Divider = () => <div className="w-px h-6 bg-slate-200 mx-1" />;

export default function EditorToolbar({
    onFormat,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    onToggleFind,
}: EditorToolbarProps) {
    return (
        <div className="flex items-center gap-0.5 px-2 py-1.5 bg-white border-b border-slate-200 flex-wrap">
            {/* Text Formatting */}
            <ToolbarButton
                icon={Bold}
                label="Bold (Ctrl+B)"
                onClick={() => onFormat('bold', { before: '**', after: '**' })}
            />
            <ToolbarButton
                icon={Italic}
                label="Italic (Ctrl+I)"
                onClick={() => onFormat('italic', { before: '*', after: '*' })}
            />
            <ToolbarButton
                icon={Strikethrough}
                label="Strikethrough"
                onClick={() => onFormat('strike', { before: '~~', after: '~~' })}
            />

            <Divider />

            {/* Headers */}
            <ToolbarButton
                icon={Heading1}
                label="Heading 1"
                onClick={() => onFormat('h1', { before: '# ', after: '' })}
            />
            <ToolbarButton
                icon={Heading2}
                label="Heading 2"
                onClick={() => onFormat('h2', { before: '## ', after: '' })}
            />
            <ToolbarButton
                icon={Heading3}
                label="Heading 3"
                onClick={() => onFormat('h3', { before: '### ', after: '' })}
            />

            <Divider />

            {/* Insert */}
            <ToolbarButton
                icon={Link}
                label="Insert Link"
                onClick={() => onFormat('link', { before: '[', after: '](url)' })}
            />
            <ToolbarButton
                icon={Image}
                label="Insert Image"
                onClick={() => onFormat('image', { before: '![alt](', after: ')' })}
            />
            <ToolbarButton
                icon={Code}
                label="Inline Code"
                onClick={() => onFormat('code', { before: '`', after: '`' })}
            />
            <ToolbarButton
                icon={Quote}
                label="Blockquote"
                onClick={() => onFormat('quote', { before: '> ', after: '' })}
            />

            <Divider />

            {/* Lists */}
            <ToolbarButton
                icon={List}
                label="Bullet List"
                onClick={() => onFormat('ul', { before: '- ', after: '' })}
            />
            <ToolbarButton
                icon={ListOrdered}
                label="Numbered List"
                onClick={() => onFormat('ol', { before: '1. ', after: '' })}
            />
            <ToolbarButton
                icon={Table}
                label="Insert Table"
                onClick={() =>
                    onFormat('table', {
                        before: '\n| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n',
                        after: '',
                    })
                }
            />
            <ToolbarButton
                icon={Minus}
                label="Horizontal Rule"
                onClick={() => onFormat('hr', { before: '\n---\n', after: '' })}
            />

            <Divider />

            {/* Undo/Redo */}
            <ToolbarButton icon={Undo} label="Undo (Ctrl+Z)" onClick={onUndo} disabled={!canUndo} />
            <ToolbarButton icon={Redo} label="Redo (Ctrl+Y)" onClick={onRedo} disabled={!canRedo} />

            <Divider />

            {/* Find */}
            <ToolbarButton icon={Search} label="Find & Replace (Ctrl+F)" onClick={onToggleFind} />
        </div>
    );
}

import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils'; // We need to create this lib/utils or just use string concatenation if simpler for now.

// Let's assume user doesn't have lib/utils yet, we will make clsx/tailwind-merge inline or create the util.
// We installed clsx and tailwind-merge, so let's create the util file first in next step or inline it.
// I'll inline the classes logic for simplicity to avoid creating another file just for one function, 
// OR I'll strictly follow best practices and create lib/utils.js first? 
// Let's create reusable component with basic className prop.

const Input = forwardRef(({ className, type, ...props }, ref) => {
    return (
        <input
            type={type}
            className={`flex h-12 w-full rounded-full border border-white/50 bg-transparent px-6 py-2 text-sm text-white placeholder:text-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            ref={ref}
            {...props}
        />
    );
});

Input.displayName = "Input";

export { Input };

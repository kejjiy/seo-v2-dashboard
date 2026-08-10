import * as React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
    label: string;
    href: string;
    active?: boolean;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav className="flex items-center text-sm text-muted-foreground">
            {items.map((item, index) => (
                <React.Fragment key={item.href}>
                    {index > 0 && <ChevronRight className="h-4 w-4 mx-2 flex-shrink-0" />}
                    <Link
                        href={item.href}
                        className={cn(
                            "hover:text-foreground transition-colors truncate max-w-[200px]",
                            item.active && "text-foreground font-medium pointer-events-none"
                        )}
                    >
                        {item.label}
                    </Link>
                </React.Fragment>
            ))}
        </nav>
    );
}

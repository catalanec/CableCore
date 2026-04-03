import { Link } from '@/i18n/routing';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav aria-label="Breadcrumb" className="container-custom pt-6 pb-2">
            <ol
                className="flex flex-wrap items-center gap-1.5 text-sm text-brand-gold-muted"
                itemScope
                itemType="https://schema.org/BreadcrumbList"
            >
                {items.map((item, i) => (
                    <li
                        key={i}
                        className="flex items-center gap-1.5"
                        itemScope
                        itemProp="itemListElement"
                        itemType="https://schema.org/ListItem"
                    >
                        {i > 0 && <span className="text-brand-gold/30">/</span>}
                        {item.href ? (
                            <Link
                                href={item.href as Parameters<typeof Link>[0]['href']}
                                className="hover:text-brand-gold transition-colors"
                                itemProp="item"
                            >
                                <span itemProp="name">{item.label}</span>
                            </Link>
                        ) : (
                            <span className="text-white/70" itemProp="name">{item.label}</span>
                        )}
                        <meta itemProp="position" content={String(i + 1)} />
                    </li>
                ))}
            </ol>
        </nav>
    );
}

import { Link } from '@inertiajs/react';
import { Search, User, ShoppingBag, Heart } from 'lucide-react';

type NavbarCollection = {
    id: number;
    name: string;
    slug: string;
};

type NavbarProps = {
    cartCount?: number;
    collections?: NavbarCollection[];
};

export default function Navbar({ cartCount = 0, collections = [] }: NavbarProps) {
    const cartBadge = cartCount > 99 ? '99+' : String(cartCount);

    return (
        <nav className="sticky top-0 z-50 flex items-center justify-between bg-[#FAF9F6]/90 px-4 py-4 backdrop-blur-md transition-all duration-300 md:px-10">
            {/* Mobile View */}
            <div className="flex w-full items-center justify-between md:hidden">
                <Link href="/" className="font-serif text-2xl text-[#5A4F43]">
                    Auréa Syar'i
                </Link>
                <div className="flex items-center space-x-4 text-[#5A4F43]">
                    <Search
                        strokeWidth={1.5}
                        size={22}
                        className="cursor-pointer"
                    />
                    <Heart
                        strokeWidth={1.5}
                        size={22}
                        className="cursor-pointer"
                    />
                    <div className="relative">
                        <Link href="/my-cart" aria-label="Open cart">
                            <ShoppingBag
                                strokeWidth={1.5}
                                size={22}
                                className="cursor-pointer"
                            />
                        </Link>
                        {cartCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#8C7A6B] px-1 text-[9px] font-bold text-white">
                                {cartBadge}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Desktop View (Keeping existing structure but restyled) */}
            <div className="hidden w-full items-center justify-between md:flex">
                <Link
                    href="/"
                    className="flex transform cursor-pointer flex-col items-center justify-center transition-transform duration-300 hover:scale-105"
                >
                    <span className="font-serif text-xl text-[#5A4F43]">
                        Auréa Syar'i
                    </span>
                </Link>

                <div className="flex items-center space-x-10 text-[11px] font-semibold tracking-widest text-[#8C8578]">
                    <Link
                        href="/list"
                        className="transition-colors hover:text-[#5A4F43]"
                    >
                        SHOP ALL
                    </Link>
                    {collections.map((collection) => (
                        <Link
                            key={collection.id}
                            href={`/list?collection=${encodeURIComponent(collection.slug)}`}
                            className="transition-colors hover:text-[#5A4F43]"
                        >
                            {collection.name.toUpperCase()}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center space-x-6 text-[#5A4F43]">
                    <Link href="/my-profile" aria-label="Open profile">
                        <User
                            strokeWidth={1.5}
                            size={20}
                            className="cursor-pointer transition-all hover:text-[#8C7A6B]"
                        />
                    </Link>
                    <div className="relative">
                        <Link href="/my-cart" aria-label="Open cart">
                            <ShoppingBag
                                strokeWidth={1.5}
                                size={20}
                                className="cursor-pointer transition-all hover:text-[#8C7A6B]"
                            />
                        </Link>
                        {cartCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#8C7A6B] px-1 text-[9px] font-bold text-white">
                                {cartBadge}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

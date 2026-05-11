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
        <nav className="sticky top-0 z-50 flex h-16 items-center justify-between bg-[#FAF9F6]/90 px-4 backdrop-blur-md transition-all duration-300 md:h-15 md:px-10">
            {/* Mobile View */}
            <div className="flex w-full items-center justify-between md:hidden">
                <Link href="/" className="flex h-10 items-center overflow-visible">
                    <img
                        src="/logo-shay/shayda-logo-text-hitam.png"
                        alt="Shayda"
                        className="h-14 w-auto scale-125 object-contain"
                    />
                </Link>
                <div className="flex items-center space-x-4 text-[#4A2525]">
                    <Link href="/wishlist" aria-label="Buka wishlist">
                        <Heart
                            strokeWidth={1.5}
                            size={22}
                            className="cursor-pointer transition-all hover:text-[#7F2020]"
                        />
                    </Link>
                </div>
            </div>

            {/* Desktop View (Keeping existing structure but restyled) */}
            <div className="hidden w-full items-center justify-between md:flex">
                <Link
                    href="/"
                    className="flex h-12 transform cursor-pointer items-center justify-center overflow-visible transition-transform duration-300 hover:scale-105 lg:h-14"
                >
                    <img
                        src="/logo-shay/shayda-logo-text-hitam.png"
                        alt="Shayda"
                        className="h-16 w-auto scale-125 object-contain lg:h-20"
                    />
                </Link>

                <div className="flex items-center space-x-10 text-[11px] font-semibold tracking-widest text-[#8A6B62]">
                    <Link
                        href="/list"
                        className="border-b border-transparent pb-1 transition-colors hover:border-[#4A2525] hover:text-[#4A2525]"
                    >
                    BELANJA SEMUA
                    </Link>
                    {collections.map((collection) => (
                        <Link
                            key={collection.id}
                            href={`/list?collection=${encodeURIComponent(collection.slug)}`}
                            className="border-b border-transparent pb-1 transition-colors hover:border-[#4A2525] hover:text-[#4A2525]"
                        >
                            {collection.name.toUpperCase()}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center space-x-6 text-[#4A2525]">
                    <Link href="/my-profile" aria-label="Buka profil">
                        <User
                            strokeWidth={1.5}
                            size={20}
                            className="cursor-pointer transition-all hover:text-[#7F2020]"
                        />
                    </Link>
                    <div className="relative">
                        <Link href="/my-cart" aria-label="Buka keranjang">
                            <ShoppingBag
                                strokeWidth={1.5}
                                size={20}
                                className="cursor-pointer transition-all hover:text-[#7F2020]"
                            />
                        </Link>
                        {cartCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#7F2020] px-1 text-[9px] font-bold text-white">
                                {cartBadge}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

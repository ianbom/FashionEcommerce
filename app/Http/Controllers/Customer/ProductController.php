<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Collection;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $this->validatedFilters($request);

        $products = Product::query()
            ->with($this->productRelations())
            ->where('status', 'published')
            ->when($filters['search'] !== '', function ($query) use ($filters) {
                $query->where(function ($query) use ($filters) {
                    $query
                        ->where('name', 'like', "%{$filters['search']}%")
                        ->orWhere('sku', 'like', "%{$filters['search']}%")
                        ->orWhere('short_description', 'like', "%{$filters['search']}%");
                });
            })
            ->when($filters['category'] !== '', function ($query) use ($filters) {
                $query->whereHas('category', fn ($query) => $query->where('slug', $filters['category']));
            })
            ->when($filters['collection'] !== '', function ($query) use ($filters) {
                $query->whereHas('collection', fn ($query) => $query->where('slug', $filters['collection']));
            })
            ->when($filters['type'] === 'featured', fn ($query) => $query->where('is_featured', true))
            ->when($filters['type'] === 'new_arrival', fn ($query) => $query->where('is_new_arrival', true))
            ->when($filters['type'] === 'best_seller', fn ($query) => $query->where('is_best_seller', true))
            ->when($filters['type'] === 'discount', fn ($query) => $query->whereNotNull('sale_price'))
            ->when($filters['availability'] === 'in_stock', function ($query) {
                $query->whereHas('variants', fn ($query) => $query
                    ->where('is_active', true)
                    ->whereColumn('stock', '>', 'reserved_stock'));
            })
            ->when($filters['availability'] === 'out_of_stock', function ($query) {
                $query->whereDoesntHave('variants', fn ($query) => $query
                    ->where('is_active', true)
                    ->whereColumn('stock', '>', 'reserved_stock'));
            })
            ->when($filters['price'] === 'under_410', fn ($query) => $query->whereRaw('coalesce(sale_price, base_price) < ?', [410000]))
            ->when($filters['price'] === '410_830', fn ($query) => $query->whereRaw('coalesce(sale_price, base_price) between ? and ?', [410000, 830000]))
            ->when($filters['price'] === '830_1200', fn ($query) => $query->whereRaw('coalesce(sale_price, base_price) between ? and ?', [830000, 1200000]))
            ->when($filters['price'] === 'above_1200', fn ($query) => $query->whereRaw('coalesce(sale_price, base_price) > ?', [1200000]))
            ->when($filters['color'] !== '', function ($query) use ($filters) {
                $query->whereHas('variants', fn ($query) => $query
                    ->where('is_active', true)
                    ->where('color_hex', $filters['color']));
            })
            ->when($filters['size'] !== '', function ($query) use ($filters) {
                $query->whereHas('variants', fn ($query) => $query
                    ->where('is_active', true)
                    ->where('size', $filters['size']));
            });

        $this->applySort($products, $filters['sort'], $filters['order']);

        return Inertia::render('customer/products/list-product', [
            'products' => $products
                ->paginate($filters['per_page'])
                ->withQueryString()
                ->through(fn (Product $product) => $this->productCard($product)),
            'filters' => $filters,
            'options' => [
                'categories' => Category::query()
                    ->where('is_active', true)
                    ->orderBy('name')
                    ->get(['id', 'name', 'slug']),
                'collections' => Collection::query()
                    ->where('is_active', true)
                    ->orderBy('name')
                    ->get(['id', 'name', 'slug']),
                'colors' => $this->colorOptions(),
                'sizes' => $this->sizeOptions(),
                'priceRanges' => [
                    ['value' => 'under_410', 'label' => 'Under Rp 410.000'],
                    ['value' => '410_830', 'label' => 'Rp 410.000 - Rp 830.000'],
                    ['value' => '830_1200', 'label' => 'Rp 830.000 - Rp 1.200.000'],
                    ['value' => 'above_1200', 'label' => 'Rp 1.200.000 +'],
                ],
                'sorts' => [
                    ['value' => 'featured', 'label' => 'Featured'],
                    ['value' => 'latest', 'label' => 'Newest'],
                    ['value' => 'name', 'label' => 'Name'],
                    ['value' => 'price', 'label' => 'Price'],
                    ['value' => 'best_seller', 'label' => 'Best Seller'],
                ],
            ],
        ]);
    }

    public function show(Request $request): Response
    {
        $slug = (string) $request->query('product', '');

        $product = Product::query()
            ->with($this->productRelations())
            ->where('status', 'published')
            ->when(
                $slug !== '',
                fn ($query) => $query->where('slug', $slug),
                fn ($query) => $query->orderByDesc('is_featured')->orderByDesc('created_at')
            )
            ->firstOrFail();

        $related = Product::query()
            ->with($this->productRelations())
            ->where('status', 'published')
            ->where('id', '!=', $product->id)
            ->when($product->category_id, fn ($query) => $query->where('category_id', $product->category_id))
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn (Product $product) => $this->productCard($product));

        $recent = Product::query()
            ->with($this->productRelations())
            ->where('status', 'published')
            ->where('id', '!=', $product->id)
            ->latest()
            ->limit(4)
            ->get()
            ->map(fn (Product $product) => $this->productCard($product));

        return Inertia::render('customer/products/detail-product', [
            'product' => $this->productDetail($product),
            'relatedProducts' => $related,
            'recentProducts' => $recent,
        ]);
    }

    private function validatedFilters(Request $request): array
    {
        return [
            'search' => trim((string) $request->query('search', '')),
            'category' => (string) $request->query('category', ''),
            'collection' => (string) $request->query('collection', ''),
            'type' => $this->option($request, 'type', ['all', 'featured', 'new_arrival', 'best_seller', 'discount'], 'all'),
            'availability' => $this->option($request, 'availability', ['all', 'in_stock', 'out_of_stock'], 'all'),
            'price' => $this->option($request, 'price', ['all', 'under_410', '410_830', '830_1200', 'above_1200'], 'all'),
            'color' => (string) $request->query('color', ''),
            'size' => (string) $request->query('size', ''),
            'sort' => $this->option($request, 'sort', ['featured', 'latest', 'name', 'price', 'best_seller'], 'featured'),
            'order' => $this->option($request, 'order', ['asc', 'desc'], 'desc'),
            'per_page' => min(max((int) $request->query('per_page', 12), 8), 32),
        ];
    }

    private function option(Request $request, string $key, array $allowed, string $default): string
    {
        $value = (string) $request->query($key, $default);

        return in_array($value, $allowed, true) ? $value : $default;
    }

    private function applySort($query, string $sort, string $order): void
    {
        match ($sort) {
            'latest' => $query->orderBy('created_at', $order),
            'name' => $query->orderBy('name', $order),
            'price' => $query->orderByRaw("coalesce(sale_price, base_price) {$order}"),
            'best_seller' => $query->orderByDesc('is_best_seller')->orderByDesc('created_at'),
            default => $query->orderByDesc('is_featured')->orderByDesc('is_new_arrival')->orderByDesc('created_at'),
        };
    }

    private function productRelations(): array
    {
        return [
            'category:id,name,slug',
            'collection:id,name,slug',
            'primaryImage:id,product_id,image_url,alt_text',
            'images:id,product_id,image_url,alt_text,sort_order',
            'variants' => fn ($query) => $query
                ->select('id', 'product_id', 'sku', 'color_name', 'color_hex', 'size', 'stock', 'reserved_stock', 'additional_price', 'image_url', 'is_active')
                ->where('is_active', true)
                ->orderBy('color_name')
                ->orderBy('size'),
        ];
    }

    private function productDetail(Product $product): array
    {
        $variants = $product->variants;
        $images = $product->images
            ->map(fn ($image) => [
                'url' => $image->image_url,
                'alt' => $image->alt_text ?? $product->name,
            ])
            ->merge($variants
                ->filter(fn ($variant) => filled($variant->image_url))
                ->unique('image_url')
                ->map(fn ($variant) => [
                    'url' => $variant->image_url,
                    'alt' => trim("{$product->name} {$variant->color_name} {$variant->size}"),
                ]))
            ->unique('url')
            ->values();

        return [
            ...$this->productCard($product),
            'short_description' => $product->short_description,
            'description' => $product->description,
            'material' => $product->material,
            'care_instruction' => $product->care_instruction,
            'weight' => $product->weight,
            'dimensions' => [
                'length' => $product->length,
                'width' => $product->width,
                'height' => $product->height,
            ],
            'images' => $images,
            'variants' => $variants
                ->map(fn ($variant) => [
                    'id' => $variant->id,
                    'sku' => $variant->sku,
                    'color_name' => $variant->color_name,
                    'color_hex' => $variant->color_hex,
                    'size' => $variant->size,
                    'additional_price' => (float) $variant->additional_price,
                    'stock' => $variant->stock,
                    'reserved_stock' => $variant->reserved_stock,
                    'available_stock' => max(0, $variant->stock - $variant->reserved_stock),
                    'image_url' => $variant->image_url,
                ])
                ->values(),
        ];
    }

    private function productCard(Product $product): array
    {
        $variants = $product->variants;
        $salePrice = $product->sale_price !== null ? (float) $product->sale_price : null;
        $basePrice = (float) $product->base_price;
        $image = $product->primaryImage?->image_url
            ?? $product->images->first()?->image_url
            ?? $variants->firstWhere('image_url', '!=', null)?->image_url;

        return [
            'id' => $product->id,
            'slug' => $product->slug,
            'title' => $product->name,
            'sku' => $product->sku,
            'price' => $basePrice,
            'sale_price' => $salePrice,
            'image' => $image,
            'badge' => $this->badge($product),
            'category' => $product->category?->name,
            'category_slug' => $product->category?->slug,
            'collection' => $product->collection?->name,
            'collection_slug' => $product->collection?->slug,
            'colors' => $variants
                ->filter(fn ($variant) => filled($variant->color_hex))
                ->unique('color_hex')
                ->values()
                ->map(fn ($variant) => [
                    'name' => $variant->color_name,
                    'hex' => $variant->color_hex,
                ]),
            'sizes' => $variants
                ->pluck('size')
                ->filter()
                ->unique()
                ->values(),
            'available_stock' => $variants->sum(fn ($variant) => max(0, $variant->stock - $variant->reserved_stock)),
        ];
    }

    private function badge(Product $product): ?string
    {
        if ($product->sale_price !== null) {
            return 'SALE';
        }

        if ($product->is_new_arrival) {
            return 'NEW';
        }

        if ($product->is_best_seller) {
            return 'BEST SELLER';
        }

        return $product->is_featured ? 'FEATURED' : null;
    }

    private function colorOptions()
    {
        return Product::query()
            ->join('product_variants', 'products.id', '=', 'product_variants.product_id')
            ->where('products.status', 'published')
            ->where('product_variants.is_active', true)
            ->whereNotNull('product_variants.color_hex')
            ->orderBy('product_variants.color_name')
            ->get(['product_variants.color_name as name', 'product_variants.color_hex as hex'])
            ->unique('hex')
            ->values();
    }

    private function sizeOptions()
    {
        return Product::query()
            ->join('product_variants', 'products.id', '=', 'product_variants.product_id')
            ->where('products.status', 'published')
            ->where('product_variants.is_active', true)
            ->whereNotNull('product_variants.size')
            ->orderBy('product_variants.size')
            ->pluck('product_variants.size')
            ->unique()
            ->values();
    }
}

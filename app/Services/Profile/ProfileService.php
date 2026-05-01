<?php

namespace App\Services\Profile;

use App\Models\CustomerAddress;
use App\Models\User;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProfileService
{
    /**
     * Build shared props for profile pages.
     */
    public function profilePageProps(Request $request): array
    {
        /** @var User $user */
        $user = $request->user();
        $defaultAddress = CustomerAddress::query()
            ->where('user_id', $user->id)
            ->where('is_default', true)
            ->latest()
            ->first();

        return [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status'          => $request->session()->get('status'),
            'defaultAddress'  => $defaultAddress ? $this->addressPayload($defaultAddress) : null,
            'user'            => [
                'id'           => $user->id,
                'name'         => $user->name,
                'email'        => $user->email,
                'phone'        => $user->phone,
                'avatar_url'   => $user->avatar_url,
                'role'         => $user->role,
                'member_since' => $user->created_at?->format('Y'),
            ],
        ];
    }

    /**
     * Update profile fields and reset verification when email changes.
     *
     * @param  array{name: string, email: string, phone?: string|null, avatar_url?: UploadedFile|null}  $attributes
     */
    public function updateProfile(User $user, array $attributes): void
    {
        $avatar = $attributes['avatar_url'] ?? null;
        unset($attributes['avatar_url']);

        $user->fill($attributes);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        if ($avatar instanceof UploadedFile) {
            $this->deleteStoredAvatar($user->avatar_url);

            $user->avatar_url = Storage::url($avatar->store('avatars', 'public'));
        }

        $user->save();
    }

    private function deleteStoredAvatar(?string $avatarUrl): void
    {
        if (! filled($avatarUrl)) {
            return;
        }

        $path = parse_url($avatarUrl, PHP_URL_PATH);
        if (! is_string($path) || ! Str::startsWith($path, '/storage/')) {
            return;
        }

        Storage::disk('public')->delete(Str::after($path, '/storage/'));
    }

    /**
     * @return array<string, mixed>
     */
    private function addressPayload(CustomerAddress $address): array
    {
        return [
            'id' => $address->id,
            'label' => $address->label,
            'recipient_name' => $address->recipient_name,
            'recipient_phone' => $address->recipient_phone,
            'province' => $address->province,
            'city' => $address->city,
            'district' => $address->district,
            'subdistrict' => $address->subdistrict,
            'postal_code' => $address->postal_code,
            'full_address' => $address->full_address,
            'note' => $address->note,
            'is_default' => $address->is_default,
        ];
    }

    /**
     * Resolve profile route by role.
     */
    public function profileRoute(User $user): string
    {
        return $user->role === 'admin' ? 'profile.edit' : 'my-profile';
    }
}

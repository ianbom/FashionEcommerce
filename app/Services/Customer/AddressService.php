<?php

namespace App\Services\Customer;

use App\Models\CustomerAddress;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;

class AddressService
{
    public function pageData(User $user): array
    {
        return [
            'redirectTo' => request()->string('redirect_to')->toString(),
            'addresses' => CustomerAddress::query()
                ->where('user_id', $user->id)
                ->orderByDesc('is_default')
                ->latest()
                ->get()
                ->map(fn (CustomerAddress $address): array => $this->payload($address))
                ->values()
                ->all(),
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function store(User $user, array $data, bool $isDefault): CustomerAddress
    {
        return DB::transaction(function () use ($user, $data, $isDefault): CustomerAddress {
            $payload = $this->writePayload($data, $isDefault);
            $hasAddress = CustomerAddress::query()->where('user_id', $user->id)->exists();

            if (! $hasAddress) {
                $payload['is_default'] = true;
            }

            if ($payload['is_default']) {
                $this->clearDefaultAddress($user);
            }

            return CustomerAddress::query()->create([
                ...$payload,
                'user_id' => $user->id,
            ]);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(User $user, CustomerAddress $address, array $data, bool $isDefault): CustomerAddress
    {
        return DB::transaction(function () use ($user, $address, $data, $isDefault): CustomerAddress {
            $ownedAddress = $this->ownedAddress($address, $user);
            $payload = $this->writePayload($data, $isDefault);

            if ($payload['is_default']) {
                $this->clearDefaultAddress($user, $ownedAddress->id);
            } elseif (
                $ownedAddress->is_default
                && ! CustomerAddress::query()
                    ->where('user_id', $user->id)
                    ->whereKeyNot($ownedAddress->id)
                    ->where('is_default', true)
                    ->exists()
            ) {
                $payload['is_default'] = true;
            }

            $ownedAddress->update($payload);

            return $ownedAddress->refresh();
        });
    }

    public function delete(User $user, CustomerAddress $address): void
    {
        DB::transaction(function () use ($user, $address): void {
            $ownedAddress = $this->ownedAddress($address, $user);
            $wasDefault = $ownedAddress->is_default;

            $ownedAddress->delete();

            if (! $wasDefault) {
                return;
            }

            CustomerAddress::query()
                ->where('user_id', $user->id)
                ->latest('id')
                ->first()
                ?->update(['is_default' => true]);
        });
    }

    private function clearDefaultAddress(User $user, ?int $exceptId = null): void
    {
        CustomerAddress::query()
            ->where('user_id', $user->id)
            ->when($exceptId !== null, fn ($query) => $query->whereKeyNot($exceptId))
            ->where('is_default', true)
            ->update(['is_default' => false]);
    }

    private function ownedAddress(CustomerAddress $address, User $user): CustomerAddress
    {
        $ownedAddress = CustomerAddress::query()
            ->whereKey($address->id)
            ->where('user_id', $user->id)
            ->first();

        if ($ownedAddress) {
            return $ownedAddress;
        }

        $exception = new ModelNotFoundException;
        $exception->setModel(CustomerAddress::class, [$address->id]);

        throw $exception;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function writePayload(array $data, bool $isDefault): array
    {
        return [
            'recipient_name' => $data['recipient_name'],
            'recipient_phone' => $data['recipient_phone'],
            'label' => $data['label'] ?? null,
            'province' => $data['province'],
            'city' => $data['city'],
            'district' => $data['district'],
            'subdistrict' => $data['subdistrict'] ?? null,
            'postal_code' => $data['postal_code'],
            'biteship_area_id' => $data['biteship_area_id'] ?? null,
            'latitude' => $data['latitude'] ?? null,
            'longitude' => $data['longitude'] ?? null,
            'full_address' => $data['full_address'],
            'note' => $data['note'] ?? null,
            'is_default' => $isDefault,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(CustomerAddress $address): array
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
            'biteship_area_id' => $address->biteship_area_id,
            'latitude' => $address->latitude,
            'longitude' => $address->longitude,
            'full_address' => $address->full_address,
            'note' => $address->note,
            'is_default' => $address->is_default,
        ];
    }
}

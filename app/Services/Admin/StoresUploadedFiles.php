<?php

namespace App\Services\Admin;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

trait StoresUploadedFiles
{
    protected function storePublicFile(UploadedFile $file, string $directory): string
    {
        return Storage::url($file->store($directory, 'public'));
    }

    protected function deletePublicFile(?string $url): void
    {
        if (! filled($url)) {
            return;
        }

        Storage::disk('public')->delete(str_replace('/storage/', '', $url));
    }
}

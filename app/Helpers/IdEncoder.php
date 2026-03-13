<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Crypt;

class IdEncoder
{
    /**
     * Encode an ID for use in URLs.
     */
    public static function encode(int|string $id): string
    {
        return base64_encode(Crypt::encryptString((string) $id));
    }

    /**
     * Decode an encoded ID from URL.
     */
    public static function decode(string $encoded): int
    {
        try {
            $decoded = Crypt::decryptString(base64_decode($encoded));
            return (int) $decoded;
        } catch (\Exception $e) {
            abort(404);
        }
    }
}

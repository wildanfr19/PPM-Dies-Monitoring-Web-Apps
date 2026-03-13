<?php

namespace App\Http\Middleware;

use App\Helpers\IdEncoder;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class DecryptRouteIds
{
    /**
     * Route parameter names that should be decrypted.
     */
    protected array $parameters = [
        'die',
        'process',
        'specialRepair',
        'message',
        'production',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        foreach ($this->parameters as $param) {
            if ($request->route($param)) {
                $value = $request->route($param);
                // Only decrypt if it's a string (not already resolved by model binding)
                if (is_string($value) && !is_numeric($value)) {
                    try {
                        $decrypted = IdEncoder::decode($value);
                        $request->route()->setParameter($param, $decrypted);
                    } catch (\Exception $e) {
                        abort(404);
                    }
                }
            }
        }

        return $next($request);
    }
}

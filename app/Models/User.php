<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * Available roles
     */
    const ROLE_ADMIN = 'admin';
    const ROLE_PE = 'pe';               // Production Engineering - Input production data
    const ROLE_MTN_DIES = 'mtn_dies';   // Maintenance Dies - Upload data & PPM processing
    const ROLE_MGR_GM = 'mgr_gm';       // Manager/General Manager - Receive alerts
    const ROLE_MD = 'md';               // Managing Director - Receive alerts
    const ROLE_PPIC = 'ppic';           // PPIC - Create date last of LOT, receive alerts
    const ROLE_PRODUCTION = 'production';

    const ROLES = [
        self::ROLE_ADMIN => 'Administrator',
        self::ROLE_PE => 'Production Engineering',
        self::ROLE_MTN_DIES => 'Maintenance Dies',
        self::ROLE_MGR_GM => 'Manager/GM',
        self::ROLE_MD => 'Managing Director',
        self::ROLE_PPIC => 'PPIC',
        self::ROLE_PRODUCTION => 'Production',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'nik',
        'email',
        'password',
        'role',
        'photo',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = ['photo_url', 'role_label'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the photo URL.
     */
    public function getPhotoUrlAttribute(): ?string
    {
        if ($this->photo) {
            return Storage::url($this->photo);
        }
        return null;
    }

    /**
     * Get the role label.
     */
    public function getRoleLabelAttribute(): string
    {
        return self::ROLES[$this->role] ?? ucfirst($this->role);
    }

    /**
     * Check if user is admin.
     */
    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    /**
     * Check if user is Production Engineering.
     */
    public function isPe(): bool
    {
        return $this->role === self::ROLE_PE;
    }

    /**
     * Check if user is maintenance dies.
     */
    public function isMtnDies(): bool
    {
        return $this->role === self::ROLE_MTN_DIES;
    }

    /**
     * Check if user is Manager/GM.
     */
    public function isMgrGm(): bool
    {
        return $this->role === self::ROLE_MGR_GM;
    }

    /**
     * Check if user is Managing Director.
     */
    public function isMd(): bool
    {
        return $this->role === self::ROLE_MD;
    }

    /**
     * Check if user is PPIC.
     */
    public function isPpic(): bool
    {
        return $this->role === self::ROLE_PPIC;
    }

    /**
     * Check if user is production.
     */
    public function isProduction(): bool
    {
        return $this->role === self::ROLE_PRODUCTION;
    }

    /**
     * Check if user should receive alerts (MGR/GM, MD, Admin, PPIC, PROD).
     */
    public function shouldReceiveAlerts(): bool
    {
        return in_array($this->role, [
            self::ROLE_ADMIN,
            self::ROLE_MGR_GM,
            self::ROLE_MD,
            self::ROLE_PPIC,
            self::ROLE_PRODUCTION,
        ]);
    }

    /**
     * Check if user should receive critical (red) alerts.
     */
    public function shouldReceiveCriticalAlerts(): bool
    {
        return in_array($this->role, [
            self::ROLE_ADMIN,
            self::ROLE_MGR_GM,
            self::ROLE_MD,
            self::ROLE_MTN_DIES,  // MTN Dies - PPM Processing
            self::ROLE_PPIC,      // PPIC - Create date last of LOT
            self::ROLE_PRODUCTION, // PROD - Transfer dies to MTN Dies
        ]);
    }
}

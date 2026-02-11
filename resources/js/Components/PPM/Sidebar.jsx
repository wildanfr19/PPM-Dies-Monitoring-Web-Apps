import { Link, usePage } from '@inertiajs/react';

export default function Sidebar() {
    const { url } = usePage();

    const navigation = [
        { name:  'Dashboard', href: route('dashboard'), icon: '📊', current: url === '/dashboard' },
        { name:  'Dies List', href: route('dies.index'), icon: '🔧', current: url.startsWith('/dies') },
        { name: 'Production Result', href: route('production.index'), icon: '⚙️', current: url.startsWith('/production') },
    ];

    const management = [
        { name: 'Customers', href: '#', icon: '🏢', current: false },
        { name: 'Machine Models', href: '#', icon:  '🏭', current: false },
        { name: 'Settings', href: '#', icon: '⚙️', current: false },
    ];

    return (
        <div className="flex flex-col w-64 bg-gray-900 min-h-screen">
            {/* Logo */}
            <div className="flex items-center justify-center h-16 bg-gray-800">
                <span className="text-white text-xl font-bold">🏭 PPM Dies Monitoring</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Main Menu
                </p>
                {navigation.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            item.current
                                ? 'bg-gray-800 text-white'
                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                    >
                        <span className="mr-3">{item.icon}</span>
                        {item.name}
                    </Link>
                ))}

                <div className="pt-6">
                    <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Management
                    </p>
                    {management.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                item.current
                                    ?  'bg-gray-800 text-white'
                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            }`}
                        >
                            <span className="mr-3">{item.icon}</span>
                            {item.name}
                        </Link>
                    ))}
                </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800">
                <p className="text-xs text-gray-500 text-center">
                    PPM Dies Monitoring v1.0
                </p>
            </div>
        </div>
    );
}

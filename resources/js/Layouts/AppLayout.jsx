import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import NotificationBell from '@/Components/NotificationBell';
import useFlashMessages from '@/Hooks/useFlashMessages';

export default function AppLayout({ user, header, children }) {
    const { url } = usePage();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Handle flash messages with SweetAlert
    useFlashMessages();

    // Role-based access control
    const isAdmin = user.role === 'admin';
    const isMtnDies = user.role === 'mtn_dies';
    const isProduction = user.role === 'production';
    const isMd = user.role === 'md';
    const isMgrGm = user.role === 'mgr_gm';
    const isPe = user.role === 'pe';

    // Navigation items with role restrictions
    const allNavigation = [
        { name: 'Dashboard', href: route('dashboard'), icon: 'fa-chart-pie', current: url === '/dashboard', roles: ['admin', 'mtn_dies', 'production', 'pe', 'md', 'mgr_gm'] },
        { name: 'Dies List', href: route('dies.index'), icon: 'fa-wrench', current: url.startsWith('/dies'), roles: ['admin', 'mtn_dies', 'md', 'mgr_gm'] },
        { name: 'Schedule Calendar', href: route('schedule.index'), icon: 'fa-calendar-alt', current: url.startsWith('/schedule'), roles: ['admin', 'mtn_dies'] },
        { name: 'Production Log', href: route('production.index'), icon: 'fa-cogs', current: url.startsWith('/production'), roles: ['admin', 'mtn_dies', 'production', 'pe'] },
        { name: 'Import / Export', href: route('import.index'), icon: 'fa-file-import', current: url.startsWith('/import'), roles: ['admin', 'mtn_dies', 'production'] },
        { name: 'Reports', href: route('reports.index'), icon: 'fa-chart-line', current: url.startsWith('/reports'), roles: ['admin', 'mtn_dies', 'production', 'pe', 'md', 'mgr_gm'] },
    ];

    // Filter navigation based on user role
    const navigation = allNavigation.filter(item => item.roles.includes(user.role));

    // Master Data - Admin only (Machine Models & Tonnage Standards also for mtn_dies)
    const masterNavigation = isAdmin ? [
        { name: 'Customers', href: route('customers.index'), icon: 'fa-building', current: url.startsWith('/customers') },
        { name: 'Machine Models', href: route('machine-models.index'), icon: 'fa-industry', current: url.startsWith('/machine-models') },
        { name: 'Tonnage Standards', href: route('tonnage-standards.index'), icon: 'fa-ruler-combined', current: url.startsWith('/tonnage-standards') },
        { name: 'Users', href: route('users.index'), icon: 'fa-users', current: url.startsWith('/users') },
        { name: 'Test Alert', href: route('test-alert.index'), icon: 'fa-bell', current: url.startsWith('/test-alert') },
    ] : isMtnDies ? [
        { name: 'Machine Models', href: route('machine-models.index'), icon: 'fa-industry', current: url.startsWith('/machine-models') },
        { name: 'Tonnage Standards', href: route('tonnage-standards.index'), icon: 'fa-ruler-combined', current: url.startsWith('/tonnage-standards') },
    ] : [];

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 transition-all duration-300 flex flex-col`}>
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-4 bg-gray-800">
                    {sidebarOpen && (
                        <span className="text-white text-lg font-bold">🏭 PPM Dies Monitoring</span>
                    )}
                    <button
                        onClick={() => setSidebarOpen(! sidebarOpen)}
                        className="text-gray-400 hover:text-white"
                    >
                        {sidebarOpen ? '◀' : '▶'}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                    {sidebarOpen && (
                        <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Main Menu
                        </p>
                    )}
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                                item.current
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            }`}
                            title={! sidebarOpen ? item.name : ''}
                        >
                            <i className={`fas ${item.icon} ${sidebarOpen ? 'mr-3 w-5 text-center' : 'mx-auto text-lg'}`}></i>
                            {sidebarOpen && item.name}
                        </Link>
                    ))}

                    {/* Master Data Section - Admin Only */}
                    {masterNavigation.length > 0 && (
                        <>
                            {sidebarOpen && (
                                <p className="px-3 mt-6 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Master Data
                                </p>
                            )}
                            {masterNavigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                                        item.current
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    }`}
                                    title={!sidebarOpen ? item.name : ''}
                                >
                                    <i className={`fas ${item.icon} ${sidebarOpen ? 'mr-3 w-5 text-center' : 'mx-auto text-lg'}`}></i>
                                    {sidebarOpen && item.name}
                                </Link>
                            ))}
                        </>
                    )}
                </nav>

                {/* Sidebar Footer */}
                {sidebarOpen && (
                    <div className="p-4 border-t border-gray-800">
                        <p className="text-xs text-gray-500 text-center">
                            PT. Indonesia Thai Summit Auto
                        </p>
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Navbar */}
                <header className="bg-white dark:bg-gray-800 shadow h-16 flex items-center justify-between px-6">
                    <div>
                        {header}
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Notifications Bell */}
                        <NotificationBell />

                        {/* User Dropdown */}
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
                                    {user.photo_url ? (
                                        <img
                                            src={user.photo_url}
                                            alt={user.name}
                                            className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                                        />
                                    ) : (
                                        <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                            {user.name.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                    <span className="hidden md:block">{user.name}</span>
                                    <span>▼</span>
                                </button>
                            </Dropdown.Trigger>

                            <Dropdown.Content>
                                <Dropdown.Link href={route('profile.edit')}>
                                    Profile
                                </Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button">
                                    Log Out
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}

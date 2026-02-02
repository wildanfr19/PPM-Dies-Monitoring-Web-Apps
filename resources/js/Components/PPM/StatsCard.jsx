export default function StatsCard({ title, value, icon, color = 'blue', subtitle }) {
    const colorClasses = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        orange:  'bg-orange-500',
        red: 'bg-red-500',
        gray: 'bg-gray-500',
    };

    // Check if icon is FontAwesome class (starts with fa-) or emoji
    const isFontAwesome = icon && icon.startsWith('fa-');

    return (
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
            <div className="p-6">
                <div className="flex items-center">
                    <div className={`flex-shrink-0 p-3 rounded-lg ${colorClasses[color]}`}>
                        {isFontAwesome ? (
                            <i className={`fas ${icon} text-2xl text-white`}></i>
                        ) : (
                            <span className="text-2xl text-white">{icon}</span>
                        )}
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {title}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {value}
                        </p>
                        {subtitle && (
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

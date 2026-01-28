export default function TonnageProgress({ data }) {
    return (
        <div className="space-y-4">
            {data.map((item, index) => (
                <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                            {item.tonnage}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                            {item.ok} / {item.total} OK ({item.percentage}%)
                        </span>
                    </div>
                    <div className="flex h-4 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                        <div
                            className="bg-green-500 transition-all"
                            style={{ width: `${(item.ok / item.total) * 100}%` }}
                            title={`OK: ${item.ok}`}
                        />
                        <div
                            className="bg-orange-500 transition-all"
                            style={{ width:  `${(item.warning / item.total) * 100}%` }}
                            title={`Warning: ${item.warning}`}
                        />
                        <div
                            className="bg-red-500 transition-all"
                            style={{ width: `${(item.critical / item.total) * 100}%` }}
                            title={`Critical: ${item.critical}`}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

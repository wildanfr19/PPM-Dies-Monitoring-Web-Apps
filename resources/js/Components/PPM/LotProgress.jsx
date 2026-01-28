export default function LotProgress({
    lots,
    percentage,
    accumulationStroke,
    standardStroke,
    showDetails = true
}) {
    const getColorClass = (status) => {
        switch (status) {
            case 'green': return 'bg-green-500 text-white';
            case 'orange': return 'bg-orange-500 text-white';
            case 'red': return 'bg-red-500 text-white';
            default:  return 'bg-gray-200 text-gray-500';
        }
    };

    const getProgressColor = () => {
        if (percentage >= 100) return 'bg-red-500';
        if (percentage >= 75) return 'bg-orange-500';
        return 'bg-green-500';
    };

    return (
        <div className="space-y-2">
            {/* Lot boxes */}
            <div className="flex gap-1">
                {lots.map((lot, index) => (
                    <div
                        key={index}
                        className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold transition-all ${getColorClass(lot.status)}`}
                        title={`Lot ${lot.lot}:  ${lot.completed ?  'Completed' : 'In Progress'}`}
                    >
                        {lot.lot}
                    </div>
                ))}
            </div>

            {/* Progress bar */}
            {showDetails && (
                <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                            className={`h-2 rounded-full transition-all ${getProgressColor()}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                    </div>
                    <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
                        {accumulationStroke?. toLocaleString()} / {standardStroke?.toLocaleString()} ({percentage}%)
                    </span>
                </div>
            )}
        </div>
    );
}

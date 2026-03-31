export default function LotProgress({
    lots,
    percentage,
    accumulationStroke,
    standardStroke,
    showDetails = true
}) {
    /**
     * Get color class based on lot zone
     * Zone is determined by lot position:
     * - Last lot: Red zone
     * - Second to last lot: Orange zone
     * - Other lots: Green zone
     */
    const getColorClass = (lot) => {
        const zone = lot.zone || lot.status;
        const isEmpty = !lot.completed && !lot.current;

        switch (zone) {
            case 'green':
                return isEmpty
                    ? 'bg-green-100 text-green-600 border border-green-300'
                    : 'bg-green-500 text-white';
            case 'orange':
                return isEmpty
                    ? 'bg-orange-100 text-orange-600 border border-orange-300'
                    : 'bg-orange-500 text-white';
            case 'red':
                return isEmpty
                    ? 'bg-red-100 text-red-600 border border-red-300'
                    : 'bg-red-500 text-white';
            default:
                // Fallback for backward compatibility
                if (lot.status === 'green') return 'bg-green-500 text-white';
                if (lot.status === 'orange') return 'bg-orange-500 text-white';
                if (lot.status === 'red') return 'bg-red-500 text-white';
                return 'bg-gray-200 text-gray-500';
        }
    };

    const getProgressColor = () => {
        // Color based on ppm_status passed via percentage thresholds
        // standard_stroke - lot_size = orange, >= standard_stroke = red
        if (percentage >= 100) return 'bg-red-500';
        // Use a simple heuristic: if lots exist, check the zones
        const hasOrangeLot = lots.some(l => l.zone === 'orange' && (l.completed || l.current));
        const hasRedLot = lots.some(l => l.zone === 'red' && (l.completed || l.current));
        if (hasRedLot) return 'bg-red-500';
        if (hasOrangeLot) return 'bg-orange-500';
        return 'bg-green-500';
    };

    const getLotTitle = (lot) => {
        const zone = lot.zone || lot.status;
        const zoneLabel = zone === 'red' ? 'Red Zone (Critical)'
            : zone === 'orange' ? 'Orange Zone (Warning)'
            : 'Green Zone (Safe)';

        let status = lot.completed ? 'Completed' : (lot.current ? 'In Progress' : 'Not Started');

        return `Lot ${lot.lot}: ${status}\n${zoneLabel}\nStrokes: ${lot.stroke_start?.toLocaleString() || 0} - ${lot.stroke_end?.toLocaleString() || 0}`;
    };

    return (
        <div className="space-y-2">
            {/* Lot boxes */}
            <div className="flex gap-1 flex-wrap">
                {lots.map((lot, index) => (
                    <div
                        key={index}
                        className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold transition-all ${getColorClass(lot)}`}
                        title={getLotTitle(lot)}
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
                        {accumulationStroke?.toLocaleString()} / {standardStroke?.toLocaleString()} ({percentage}%)
                    </span>
                </div>
            )}
        </div>
    );
}

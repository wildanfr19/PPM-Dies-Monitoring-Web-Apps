export default function StatusBadge({ status, label }) {
    const colors = {
        green: 'bg-green-100 text-green-800 border-green-200',
        orange: 'bg-orange-100 text-orange-800 border-orange-200',
        red: 'bg-red-100 text-red-800 border-red-200',
    };

    const icons = {
        green: '✓',
        orange: '⚠',
        red: '✕',
    };

    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status] || colors.green}`}>
            <span>{icons[status]}</span>
            <span>{label || status. toUpperCase()}</span>
        </span>
    );
}

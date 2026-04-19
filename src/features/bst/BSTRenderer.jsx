export default function BSTRenderer({ tree, step }) {
    if (!tree || tree.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No tree to display.
            </div>
        );
    }

    const visitedSet   = new Set(step?.visitedNodes ?? []);
    const currentNode  = step?.currentNode ?? null;
    const foundNode    = step?.foundNode ?? null;
    const highlightNodes = new Set(step?.highlightNodes ?? []);

    return (
        <div className="flex flex-col h-full gap-2">
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 900 400"
                className="bg-white flex-1"
            >
                {/* Draw edges first so they appear behind nodes */}
                {tree.map((node) => {
                    if (node.parentId == null) return null;
                    const parent = tree.find(n => n.id === node.parentId);
                    if (!parent) return null;

                    return (
                        <line
                            key={`edge-${node.id}`}
                            x1={parent.x} y1={parent.y}
                            x2={node.x}   y2={node.y}
                            stroke="#9ca3af"
                            strokeWidth={2}
                        />
                    );
                })}

                {/* Draw nodes */}
                {tree.map((node) => {
                    const isCurrent     = node.id === currentNode;
                    const isVisited     = visitedSet.has(node.id);
                    const isFound       = node.id === foundNode;
                    const isHighlighted = highlightNodes.has(node.id);
                    const isDeleted     = step?.deletedNode === node.id;

                    let fill = "#ffffff";
                    let stroke = "#111827";
                    let strokeWidth = 2;

                    if (isDeleted)                { fill = "#fee2e2"; stroke = "#dc2626"; strokeWidth = 3; }
                    else if (isFound || isHighlighted) { fill = "#dcfce7"; stroke = "#16a34a"; strokeWidth = 3; }
                    else if (isCurrent)           { fill = "#fef9c3"; stroke = "#000000"; strokeWidth = 4; }
                    else if (isVisited)            { fill = "#e5e7eb"; stroke = "#374151"; }

                    return (
                        <g key={node.id}>
                            <circle
                                cx={node.x} cy={node.y} r="26"
                                fill={fill} stroke={stroke} strokeWidth={strokeWidth}
                            />
                            <text
                                x={node.x} y={node.y + 5}
                                fontSize="13" fontWeight="bold"
                                textAnchor="middle" fill="#111827"
                            >
                                {node.value}
                            </text>
                        </g>
                    );
                })}
            </svg>

            {/* legend row below graph */}
            <div className="flex flex-wrap gap-3 text-xs text-gray-600 justify-center pb-1">
                <LegendItem colour="#fef9c3" border="#000000" label="Current" />
                <LegendItem colour="#e5e7eb" border="#374151" label="Visited" />
                <LegendItem colour="#dcfce7" border="#16a34a" label="Found / Inserted" />
                <LegendItem colour="#fee2e2" border="#dc2626" label="Deleted" />
                <LegendItem colour="#ffffff" border="#111827" label="Unvisited" />
            </div>
        </div>
    );
}

function LegendItem({ colour, border, label }) {
    return (
        <div className="flex items-center gap-1">
            <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: colour, border: `2px solid ${border}` }}
            />
            <span>{label}</span>
        </div>
    );
}
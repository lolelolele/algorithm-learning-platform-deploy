export default function BSTRenderer({ tree, step }) {
    if (!tree || tree.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No tree to display.
            </div>
        );
    }

    const visitedSet = new Set(step?.visitedNodes ?? []);
    const currentNode = step?.currentNode ?? null;
    const foundNode = step?.foundNode ?? null;
    const highlightNodes = new Set(step?.highlightNodes ?? []);

    return (
        <svg
            width="100%"
            height="100%"
            viewBox="0 0 900 400"
            className="bg-white"
        >
            {/* Legend */}
            <foreignObject x="5" y="-150" width="145" height="155">
                <div className="rounded-md border bg-white/90 p-2 text-xs text-gray-700">
                    <div className="font-semibold mb-2">Legend:</div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="inline-block h-3 w-3 rounded-full border"
                                style={{ background: "#fef9c3", borderColor: "#000000" }} />
                            <span>Current</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-block h-3 w-3 rounded-full border"
                                style={{ background: "#e5e7eb", borderColor: "#374151" }} />
                            <span>Visited</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-block h-3 w-3 rounded-full border"
                                style={{ background: "#dcfce7", borderColor: "#16a34a" }} />
                            <span>Found / Inserted</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-block h-3 w-3 rounded-full border"
                                style={{ background: "#fee2e2", borderColor: "#dc2626" }} />
                            <span>Deleted</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-block h-3 w-3 rounded-full border"
                                style={{ background: "#ffffff", borderColor: "#111827" }} />
                            <span>Unvisited</span>
                        </div>
                    </div>
                </div>
            </foreignObject>

            {/* Draw edges first so they appear behind nodes */}
            {tree.map((node) => {
                if (node.parentId == null) return null;
                const parent = tree.find(n => n.id === node.parentId);
                if (!parent) return null;

                return (
                    <line
                        key={`edge-${node.id}`}
                        x1={parent.x}
                        y1={parent.y}
                        x2={node.x}
                        y2={node.y}
                        stroke="#9ca3af"
                        strokeWidth={2}
                    />
                );
            })}

            {/* Draw nodes */}
            {tree.map((node) => {
                const isCurrent = node.id === currentNode;
                const isVisited = visitedSet.has(node.id);
                const isFound = node.id === foundNode;
                const isHighlighted = highlightNodes.has(node.id);
                const isDeleted = step?.deletedNode === node.id;

                let fill = "#ffffff";
                let stroke = "#111827";
                let strokeWidth = 2;

                /* visual priority: deleted > found > current > visited > unvisited */
                if (isDeleted) {
                    fill = "#fee2e2";
                    stroke = "#dc2626";
                    strokeWidth = 3;
                } else if (isFound || isHighlighted) {
                    fill = "#dcfce7";
                    stroke = "#16a34a";
                    strokeWidth = 3;
                } else if (isCurrent) {
                    fill = "#fef9c3";
                    stroke = "#000000";
                    strokeWidth = 4;
                } else if (isVisited) {
                    fill = "#e5e7eb";
                    stroke = "#374151";
                }

                return (
                    <g key={node.id}>
                        <circle
                            cx={node.x}
                            cy={node.y}
                            r="26"
                            fill={fill}
                            stroke={stroke}
                            strokeWidth={strokeWidth}
                        />
                        <text
                            x={node.x}
                            y={node.y + 5}
                            fontSize="13"
                            fontWeight="bold"
                            textAnchor="middle"
                            fill="#111827"
                        >
                            {node.value}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}
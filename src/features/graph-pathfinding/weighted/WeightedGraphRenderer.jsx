export default function GraphRenderer({ graph, startId, endId, step }) {
    const { nodes, edges } = graph;

    const visitedSet = new Set(step?.visited ?? []);
    const frontierSet = new Set(step?.frontier ?? []);

    const currentNode = step?.currentNode ?? null;
    const activeEdgeId = step?.activeEdge ?? null;
    const shortestPathEdgeSet = new Set(step?.shortestPathEdges ?? []);
    const shortestPathNodeSet = new Set(step?.shortestPathNodes ?? []);

    return (
        <div className="flex flex-col h-full gap-2">
            <svg
                width="100%"
                height="100%"
                viewBox="-50 0 900 320"
                className="bg-white flex-1"
            >
                {edges.map((edge) => {
                    const from = nodes.find((n) => n.id === edge.from);
                    const to = nodes.find((n) => n.id === edge.to);
                    if (!from || !to) return null;

                    const midX = (from.x + to.x) / 2;
                    const midY = (from.y + to.y) / 2;
                    const isVertical = from.x === to.x;
                    const labelX = isVertical ? midX + 15 : midX;
                    const labelY = isVertical ? midY : midY - 10;

                    const isActive = edge.id === activeEdgeId;
                    const isOnShortestPath = shortestPathEdgeSet.has(edge.id);

                    let stroke = "#9ca3af";
                    let strokeWidth = 3;

                    if (isOnShortestPath) { stroke = "#2563eb"; strokeWidth = 6; }
                    if (isActive) { stroke = "#111827"; strokeWidth = 6; }

                    return (
                        <g key={edge.id}>
                            <line
                                x1={from.x} y1={from.y}
                                x2={to.x}   y2={to.y}
                                stroke={stroke}
                                strokeWidth={strokeWidth}
                            />
                            <text
                                x={labelX} y={labelY}
                                fontSize="16"
                                textAnchor="middle"
                                fill="#374151"
                            >
                                {edge.weight}
                            </text>
                        </g>
                    );
                })}

                {nodes.map((node) => {
                    const isStart          = node.id === startId;
                    const isEnd            = node.id === endId;
                    const isCurrent        = node.id === currentNode;
                    const isVisited        = visitedSet.has(node.id);
                    const isFrontier       = frontierSet.has(node.id);
                    const isOnShortestPath = shortestPathNodeSet.has(node.id);

                    let fill = "#ffffff";
                    let stroke = "#111827";
                    let strokeWidth = 3;

                    if (isStart)            { fill = "#dcfce7"; stroke = "#16a34a"; }
                    else if (isEnd)         { fill = "#fee2e2"; stroke = "#dc2626"; }
                    else if (isCurrent)     { fill = "#fef9c3"; stroke = "#000000"; strokeWidth = 5; }
                    else if (isOnShortestPath) { fill = "#dbeafe"; stroke = "#2563eb"; strokeWidth = 5; }
                    else if (isVisited)     { fill = "#e5e7eb"; stroke = "#374151"; }
                    else if (isFrontier)    { fill = "#dbeafe"; stroke = "#374151"; }

                    return (
                        <g key={node.id}>
                            <circle
                                cx={node.x} cy={node.y} r="28"
                                fill={fill} stroke={stroke} strokeWidth={strokeWidth}
                            />
                            <text
                                x={node.x} y={node.y + 5}
                                fontSize="16" fontWeight="bold"
                                textAnchor="middle" fill="#111827"
                            >
                                {node.id}
                            </text>
                        </g>
                    );
                })}
            </svg>

            {/* legend row below graph */}
            <div className="flex flex-wrap gap-3 text-xs text-gray-600 justify-center pb-1">
                <LegendItem colour="#dcfce7" border="#16a34a" label="Start" />
                <LegendItem colour="#fee2e2" border="#dc2626" label="End" />
                <LegendItem colour="#fef9c3" border="#000000" label="Current" />
                <LegendItem colour="#e5e7eb" border="#374151" label="Visited" />
                <LegendItem colour="#dbeafe" border="#374151" label="Frontier" />
                <LegendItem colour="#dbeafe" border="#2563eb" label="Shortest Path" />
                <LegendItem colour="#111827" border="#111827" label="Active Edge" />
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
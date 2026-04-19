export default function GraphRenderer({ graph, step }) {
    const { nodes, edges } = graph;

    const visitedSet      = new Set(step?.visited ?? []);
    const queueOrStackSet = new Set(step?.frontier ?? []);
    const currentNode     = step?.currentNode ?? null;
    const highlightEdgeSet = new Set(step?.highlightEdges ?? []);

    return (
        <div className="flex flex-col h-full gap-2">
            <svg
                width="100%"
                height="100%"
                viewBox="-50 0 900 380"
                className="bg-white flex-1"
            >
                {/* Edges */}
                {edges.map((edge) => {
                    const from = nodes.find((n) => n.id === edge.from);
                    const to   = nodes.find((n) => n.id === edge.to);
                    if (!from || !to) return null;

                    const isHighlighted = highlightEdgeSet.has(edge.id);

                    return (
                        <line
                            key={edge.id}
                            x1={from.x} y1={from.y}
                            x2={to.x}   y2={to.y}
                            stroke={isHighlighted ? "#f97316" : "#9ca3af"}
                            strokeWidth={isHighlighted ? 5 : 3}
                        />
                    );
                })}

                {/* Nodes */}
                {nodes.map((node) => {
                    const isStart   = node.id === (step?.startId ?? null);
                    const isCurrent = node.id === currentNode;
                    const isVisited = visitedSet.has(node.id);
                    const isInQueue = queueOrStackSet.has(node.id);

                    let fill = "#ffffff";
                    let stroke = "#111827";
                    let strokeWidth = 2;

                    if (isCurrent)       { fill = "#fef9c3"; stroke = "#000000"; strokeWidth = 5; }
                    else if (isStart)    { fill = "#dcfce7"; stroke = "#16a34a"; strokeWidth = 3; }
                    else if (isVisited)  { fill = "#e5e7eb"; stroke = "#374151"; }
                    else if (isInQueue)  { fill = "#dbeafe"; stroke = "#374151"; }

                    return (
                        <g key={node.id}>
                            <circle
                                cx={node.x} cy={node.y} r="24"
                                fill={fill} stroke={stroke} strokeWidth={strokeWidth}
                            />
                            <text
                                x={node.x} y={node.y + 5}
                                fontSize="14" fontWeight="bold"
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
                <LegendItem colour="#fef9c3" border="#000000" label="Current" />
                <LegendItem colour="#e5e7eb" border="#374151" label="Visited" />
                <LegendItem colour="#dbeafe" border="#374151" label="In Queue / Stack" />
                <LegendItem colour="#ffffff" border="#111827" label="Unvisited" />
                <LegendItem colour="#f97316" border="#f97316" label="Explored Edge" isEdge />
            </div>
        </div>
    );
}

function LegendItem({ colour, border, label, isEdge }) {
    return (
        <div className="flex items-center gap-1">
            {isEdge
                ? <div className="w-5 h-2 rounded flex-shrink-0" style={{ backgroundColor: colour }} />
                : <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: colour, border: `2px solid ${border}` }} />
            }
            <span>{label}</span>
        </div>
    );
}
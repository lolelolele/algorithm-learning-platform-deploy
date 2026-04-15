export default function GraphRenderer({ graph, startId, endId, step }) {
    const { nodes, edges } = graph;

    
    const visitedSet = new Set(step?.visited ?? []);
    const frontierSet = new Set(step?.frontier ?? []);

    /* step highlighting:
        - currentnode: node currently being processed
        - activeEdge: edge currently being considered for relaxation
        - shortestPathNode/Edge: final path highlighted at the end of the algorithm execution*/
    const currentNode = step?.currentNode ?? null;
    const activeEdgeId = step?.activeEdge ?? null;
    const shortestPathEdgeSet = new Set(step?.shortestPathEdges ?? []);
    const shortestPathNodeSet = new Set(step?.shortestPathNodes ?? []);

    return (
        /* SVG used for predictable and resolution-independent rendering */
        <svg
            width="100%"
            height="100%"
            viewBox="-50 0 900 320"
            className="bg-white"
        >

            {/* legend inside SVG using foreignObject*/}
            <foreignObject x="-50" y="-190" width="150" height="170">
                <div className="rounded-md border bg-white/90 p-1 text-xs text-gray-700">
                    <div className="font-semibold mb-2">Legend:</div>

                    {/*legend colours match node/edge styling rules from visualisation */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="inline-block h-3 w-3 rounded-full border" style={{ background: "#dcfce7", borderColor: "#16a34a"}} />
                            <span>Start</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="inline-block h-3 w-3 rounded-full border" style={{ background: "#fee2e2", borderColor: "#dc2626"}} />
                            <span>End</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="inline-block h-3 w-3 rounded-full border" style={{ background: "#fef9c3", borderColor: "#000000"}} />
                            <span>Current</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="inline-block h-3 w-3 rounded-full border" style={{ background: "#e5e7eb", borderColor: "#374151"}} />
                            <span>Visited</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="inline-block h-3 w-3 rounded-full border" style={{ background: "#dbeafe", borderColor: "#374151"}} />
                            <span>Frontier</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="inline-block h-3 w-3 rounded-full border" style={{ background: "#2563eb" }} />
                            <span>Shortest Path</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="inline-block h-3 w-3 rounded-full border" style={{ background: "#111827" }} />
                            <span>Active Edge</span>
                        </div>
                    </div>
                </div>
            </foreignObject>

            {/*Edges*/}
            {edges.map((edge) => {
                const from = nodes.find((n) => n.id === edge.from);
                const to = nodes.find((n) => n.id === edge.to);
                
                /* skips invalid edge if node ids dont exist*/
                if (!from || !to) return null;

                /* midpoint used for placing weight labels */
                const midX = (from.x + to.x) / 2;
                const midY = (from.y + to.y) / 2;

                /* moves weight label for vertical edges to the right for better viewability */
                const isVertical = from.x === to.x;
                const labelX = isVertical ? midX + 15 : midX;
                const labelY = isVertical ? midY : midY - 10;

                const isActive = edge.id === activeEdgeId;
                const isOnShortestPath = shortestPathEdgeSet.has(edge.id);

                /* default edge style */
                let stroke = "#9ca3af";
                let strokeWidth = 3;

                /* highlighting final shortest path */
                if (isOnShortestPath) {
                    stroke = "#2563eb";
                    strokeWidth = 6;
                }

                /* active edge overrides to show current relaxation check */
                if (isActive) {
                    stroke = "#111827";
                    strokeWidth = 6;
                }

                return (
                    <g key={edge.id}>
                        <line
                            x1={from.x}
                            y1={from.y}
                            x2={to.x}
                            y2={to.y}
                            stroke={stroke}
                            strokeWidth={strokeWidth}
                        />
                        <text
                            x={labelX}
                            y={labelY}
                            fontSize="16"
                            textAnchor="middle"
                            fill="#374151"
                        >
                            {edge.weight}
                        </text>
                    </g>
                );
            })}

            {/*Nodes*/}
            {nodes.map((node) => {
                const isStart = node.id === startId;
                const isEnd = node.id === endId;
                const isCurrent = node.id === currentNode;
                const isVisited = visitedSet.has(node.id);
                const isFrontier = frontierSet.has(node.id)
                const isOnShortestPath = shortestPathNodeSet.has(node.id);

                /* default node style */
                let fill = "#ffffff";
                let stroke = "#111827";
                let strokeWidth = 3;

                /* visual priority */
                if (isStart) {
                    fill = "#dcfce7";
                    stroke = "#16a34a";
                } else if (isEnd) {
                    fill = "#fee2e2";  //light red
                    stroke = "#dc2626";
                } else if (isCurrent) {
                    fill = "#fef9c3";  //light yellow
                    stroke = "#000000";
                    strokeWidth = 5;
                } else if (isOnShortestPath) {
                    fill = "#dbeafe";  //light red
                    stroke = "#2563eb";
                    strokeWidth = 5;
                } else if (isVisited) {
                    fill = "#e5e7eb";  //light gray
                    stroke = "#374151";
                } else if (isFrontier) {
                    fill = "#dbeafe"; 
                    stroke = "#374151";
                }
                
                return (
                <g key={node.id}>
                    <circle
                        cx={node.x}
                        cy={node.y}
                        r="28"
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={strokeWidth}
                    />
                    
                    {/* node label */}
                    <text
                        x={node.x}
                        y={node.y + 5}
                        fontSize="16"
                        fontWeight="bold"
                        textAnchor="middle"
                        fill="#111827"
                    >
                        {node.id}
                    </text>

                </g>
                );
            })}
        </svg>
    );
}
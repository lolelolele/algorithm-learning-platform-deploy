export default function GraphRenderer({ graph, step }) {
    const { nodes, edges } = graph;

    //sets used for quick lookup of node states
    const visitedSet = new Set(step?.visited ?? []);
    const queueOrStackSet = new Set(step?.frontier ?? []);

    /* step highlighting:
        - currentnode: node currently being processed
        - highlightEdges: edges being explored from the current node
    */
    const currentNode = step?.currentNode ?? null;
    const highlightEdgeSet = new Set(step?.highlightEdges ?? []);

    return (
        /* SVG used for scalable and consistent rendering */
        <svg
            width="100%"
            height="100%"
            viewBox="-50 0 900 380"
            className="bg-white"
        >
            {/* legend inside SVG using foreignObject*/}
            <foreignObject x="-50" y="-160" width="150" height="170">
                <div className="rounded-md border bg-white/90 p-2 text-xs text-gray-700">
                    <div className="font-semibold mb-2">Legend:</div>
                    
                    {/*legend colours match node/edge styling rules from visualisation */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="inline-block h-3 w-3 rounded-full border"
                                style={{ background: "#dcfce7", borderColor: "#16a34a" }} />
                            <span>Start</span>
                        </div>
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
                                style={{ background: "#dbeafe", borderColor: "#374151" }} />
                            <span>In Queue</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-block h-3 w-3 rounded-full border"
                                style={{ background: "#ffffff", borderColor: "#111827" }} />
                            <span>Unvisited</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-block h-2 w-6 rounded"
                                style={{ background: "#f97316" }} />
                            <span>Explored Edge</span>
                        </div>
                    </div>
                </div>
            </foreignObject>

            {/* Edges */}
            {edges.map((edge) => {
                const from = nodes.find((n) => n.id === edge.from);
                const to = nodes.find((n) => n.id === edge.to);

                /* skips invalid edge if node ids dont exist*/
                if (!from || !to) return null;

                const isHighlighted = highlightEdgeSet.has(edge.id);

                return (
                    <line
                        key={edge.id}
                        x1={from.x}
                        y1={from.y}
                        x2={to.x}
                        y2={to.y}
                        /* highlighted edges represent currently explored connections */
                        stroke={isHighlighted ? "#f97316" : "#9ca3af"}
                        strokeWidth={isHighlighted ? 5 : 3}
                    />
                );
            })}

            {/* Nodes */}
            {nodes.map((node) => {
                const isStart = node.id === (step?.startId ?? null);
                const isCurrent = node.id === currentNode;
                const isVisited = visitedSet.has(node.id);
                const isInQueue = queueOrStackSet.has(node.id);

                /* default node style*/
                let fill = "#ffffff";
                let stroke = "#111827";
                let strokeWidth = 2;

                /* visual priority: current > start > visited > in queue > unvisited */
                if (isCurrent) {
                    fill = "#fef9c3";
                    stroke = "#000000";
                    strokeWidth = 5;
                } else if (isStart) {
                    fill = "#dcfce7";
                    stroke = "#16a34a";
                    strokeWidth = 3;
                } else if (isVisited) {
                    fill = "#e5e7eb";
                    stroke = "#374151";
                } else if (isInQueue) {
                    fill = "#dbeafe";
                    stroke = "#374151";
                }

                return (
                    <g key={node.id}>
                        <circle
                            cx={node.x}
                            cy={node.y}
                            r="24"
                            fill={fill}
                            stroke={stroke}
                            strokeWidth={strokeWidth}
                        />
                        {/*node label*/}
                        <text
                            x={node.x}
                            y={node.y + 5}
                            fontSize="14"
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
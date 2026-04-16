const STATE_COLOURS = {
    active:  { fill: "#fde68a", stroke: "#d97706" },  // amber  — being partitioned
    pivot:   { fill: "#e9d5ff", stroke: "#7c3aed" },  // purple — pivot element
    sorted:  { fill: "#bbf7d0", stroke: "#16a34a" },  // green  — final position
    idle:    { fill: "#f1f5f9", stroke: "#94a3b8" },  // slate  — waiting
};

const TYPE_COLOURS = {
    pivot:   { fill: "#e9d5ff", stroke: "#7c3aed" },
    sorted:  { fill: "#bbf7d0", stroke: "#16a34a" },
};

const LEVEL_HEIGHT = 110;
const BOX_H        = 40;
const CELL_W       = 32;
const CELL_PAD     = 8;
const SVG_WIDTH    = 800;
const MIN_SVG_H    = 400;

function nodeX(position) {
    return 40 + position * (SVG_WIDTH - 80);
}

function nodeY(level) {
    return level * LEVEL_HEIGHT + 20;
}

function boxWidth(array) {
    return Math.max(array.length, 1) * CELL_W + CELL_PAD * 2;
}

function getColours(node) {
    if (node.type === "pivot")  return TYPE_COLOURS.pivot;
    if (node.type === "sorted") return TYPE_COLOURS.sorted;
    return STATE_COLOURS[node.state] ?? STATE_COLOURS.idle;
}

export default function QuickRenderer({ step }) {
    if (!step || !step.nodes || step.nodes.length === 0) {
        return <div className="text-sm text-gray-400">No data to display.</div>;
    }

    const { nodes, activeNodeId } = step;

    const maxLevel = Math.max(...nodes.map(n => n.level), 0);
    const svgH = Math.max(MIN_SVG_H, (maxLevel + 1) * LEVEL_HEIGHT + 80);

    function renderArrows() {
        return nodes.flatMap(node => {
            const arrows = [];
            const px = nodeX(node.position);
            const py = nodeY(node.level) + BOX_H;

            // left child arrow
            if (node.leftChildId) {
                const child = nodes.find(n => n.id === node.leftChildId);
                if (child) {
                    const cx = nodeX(child.position);
                    const cy = nodeY(child.level);
                    arrows.push(
                        <line
                            key={`${node.id}-left`}
                            x1={px} y1={py}
                            x2={cx} y2={cy}
                            stroke="#94a3b8"
                            strokeWidth={1.5}
                            markerEnd="url(#arrow)"
                        />
                    );
                }
            }

            // mid (pivot) child arrow
            if (node.midChildId) {
                const child = nodes.find(n => n.id === node.midChildId);
                if (child) {
                    const cx = nodeX(child.position);
                    const cy = nodeY(child.level);
                    arrows.push(
                        <line
                            key={`${node.id}-mid`}
                            x1={px} y1={py}
                            x2={cx} y2={cy}
                            stroke="#7c3aed"
                            strokeWidth={1.5}
                            strokeDasharray="4 2"
                            markerEnd="url(#arrowPurple)"
                        />
                    );
                }
            }

            // right child arrow
            if (node.rightChildId) {
                const child = nodes.find(n => n.id === node.rightChildId);
                if (child) {
                    const cx = nodeX(child.position);
                    const cy = nodeY(child.level);
                    arrows.push(
                        <line
                            key={`${node.id}-right`}
                            x1={px} y1={py}
                            x2={cx} y2={cy}
                            stroke="#94a3b8"
                            strokeWidth={1.5}
                            markerEnd="url(#arrow)"
                        />
                    );
                }
            }

            return arrows;
        });
    }

    function renderLabels() {
        return nodes.flatMap(node => {
            const labels = [];
            const py = nodeY(node.level) + BOX_H + 12;

            if (node.leftChildId && node.leftLabel) {
                const child = nodes.find(n => n.id === node.leftChildId);
                if (child) {
                    const cx = nodeX(child.position);
                    labels.push(
                        <text
                            key={`${node.id}-leftlabel`}
                            x={cx}
                            y={py}
                            textAnchor="middle"
                            fontSize="11"
                            fill="#3b82f6"
                            fontWeight="600"
                        >
                            {node.leftLabel}
                        </text>
                    );
                }
            }

            if (node.rightChildId && node.rightLabel) {
                const child = nodes.find(n => n.id === node.rightChildId);
                if (child) {
                    const cx = nodeX(child.position);
                    labels.push(
                        <text
                            key={`${node.id}-rightlabel`}
                            x={cx}
                            y={py}
                            textAnchor="middle"
                            fontSize="11"
                            fill="#f97316"
                            fontWeight="600"
                        >
                            {node.rightLabel}
                        </text>
                    );
                }
            }

            return labels;
        });
    }

    function renderNodes() {
        return nodes.map(node => {
            const x        = nodeX(node.position);
            const y        = nodeY(node.level);
            const bw       = boxWidth(node.array);
            const colours  = getColours(node);
            const isActive = node.id === activeNodeId;

            return (
                <g key={node.id}>
                    {/* outer box */}
                    <rect
                        x={x - bw / 2}
                        y={y}
                        width={bw}
                        height={BOX_H}
                        rx={6}
                        fill={colours.fill}
                        stroke={colours.stroke}
                        strokeWidth={isActive ? 3 : 1.5}
                    />

                    {/* pivot indicator label above box */}
                    {node.type === "pivot" && (
                        <text
                            x={x}
                            y={y - 6}
                            textAnchor="middle"
                            fontSize="10"
                            fill="#7c3aed"
                            fontWeight="700"
                        >
                            pivot
                        </text>
                    )}

                    {/* cell dividers and values */}
                    {node.array.map((val, i) => {
                        const cellX = x - bw / 2 + CELL_PAD + i * CELL_W;
                        return (
                            <g key={i}>
                                {i > 0 && (
                                    <line
                                        x1={cellX}
                                        y1={y + 6}
                                        x2={cellX}
                                        y2={y + BOX_H - 6}
                                        stroke={colours.stroke}
                                        strokeWidth={1}
                                        opacity={0.4}
                                    />
                                )}
                                <text
                                    x={cellX + CELL_W / 2 - CELL_PAD / node.array.length}
                                    y={y + BOX_H / 2 + 5}
                                    textAnchor="middle"
                                    fontSize="13"
                                    fontWeight={isActive ? "700" : "500"}
                                    fill="#1e293b"
                                >
                                    {val}
                                </text>
                            </g>
                        );
                    })}
                </g>
            );
        });
    }

    return (
        <div className="flex flex-col items-center justify-center gap-4 w-full h-full overflow-auto">
            <svg
                width={SVG_WIDTH}
                height={svgH}
                style={{ maxWidth: "100%", overflow: "visible" }}
            >
                <defs>
                    <marker
                        id="arrow"
                        markerWidth="6"
                        markerHeight="6"
                        refX="3"
                        refY="3"
                        orient="auto"
                    >
                        <path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8" />
                    </marker>
                    <marker
                        id="arrowPurple"
                        markerWidth="6"
                        markerHeight="6"
                        refX="3"
                        refY="3"
                        orient="auto"
                    >
                        <path d="M0,0 L6,3 L0,6 Z" fill="#7c3aed" />
                    </marker>
                </defs>

                {/* render order: arrows → labels → nodes */}
                {renderArrows()}
                {renderLabels()}
                {renderNodes()}
            </svg>

            {/* legend */}
            <div className="flex gap-4 text-xs text-gray-600">
                <LegendItem colour="#fde68a" border="#d97706" label="Active"     />
                <LegendItem colour="#e9d5ff" border="#7c3aed" label="Pivot"      />
                <LegendItem colour="#bbf7d0" border="#16a34a" label="Sorted"     />
                <LegendItem colour="#f1f5f9" border="#94a3b8" label="Partition"  />
            </div>
        </div>
    );
}

function LegendItem({ colour, border, label }) {
    return (
        <div className="flex items-center gap-1">
            <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: colour, border: `2px solid ${border}` }}
            />
            <span>{label}</span>
        </div>
    );
}
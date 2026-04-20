const STATE_COLOURS = {
    active:  { fill: "#fde68a", stroke: "#d97706" },  // amber  — currently processing
    merging: { fill: "#bfdbfe", stroke: "#3b82f6" },  // blue   — being merged
    sorted:  { fill: "#bbf7d0", stroke: "#16a34a" },  // green  — merged/sorted
    idle:    { fill: "#f1f5f9", stroke: "#94a3b8" },  // slate  — waiting
};

const LEVEL_HEIGHT = 100;  // vertical gap between tree levels
const BOX_H = 40;
const CELL_W = 32;   // width per element inside a node box
const CELL_PAD = 8;    // padding inside box
const SVG_WIDTH = 800;
const MIN_SVG_H = 400;

// converts a node's fractional position (0–1) to an x pixel coordinate
function nodeX(position) {
    return 40 + position * (SVG_WIDTH - 80);
}

function nodeY(level) {
    return level * LEVEL_HEIGHT + 20;
}

function boxWidth(array) {
    return array.length * CELL_W + CELL_PAD * 2;
}

export default function MergeRenderer({ step }) {
    if (!step || !step.nodes || step.nodes.length === 0) {
        return <div className="text-sm text-gray-400">No data to display.</div>;
    }

    const { nodes, activeNodeId } = step;

    // work out how many levels exist so we can size the SVG
    const maxLevel = Math.max(...nodes.map(n => n.level), 0);
    const svgH = Math.max(MIN_SVG_H, (maxLevel + 1) * LEVEL_HEIGHT + 60);

    function renderArrows() {
        return nodes.map(node => {
            if (!node.leftChildId && !node.rightChildId) return null;

            const px = nodeX(node.position);
            const py = nodeY(node.level) + BOX_H;

            const arrows = [];

            if (node.leftChildId) {
                const left = nodes.find(n => n.id === node.leftChildId);
                if (left) {
                    const cx = nodeX(left.position);
                    const cy = nodeY(left.level);
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

            if (node.rightChildId) {
                const right = nodes.find(n => n.id === node.rightChildId);
                if (right) {
                    const cx = nodeX(right.position);
                    const cy = nodeY(right.level);
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

    function renderNodes() {
        return nodes.map(node => {
            const x = nodeX(node.position);
            const y = nodeY(node.level);
            const bw = boxWidth(node.array);
            const colours = STATE_COLOURS[node.state] ?? STATE_COLOURS.idle;
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
                        strokeWidth={isActive ? 2.5 : 1.5}
                    />

                    {/* cell dividers and values */}
                    {node.array.map((val, i) => {
                        const cellX = x - bw / 2 + CELL_PAD + i * CELL_W;
                        return (
                            <g key={i}>
                                {/* divider line between cells */}
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
                                {/* value */}
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
                </defs>

                {/* arrows first so they sit behind nodes */}
                {renderArrows()}
                {renderNodes()}
            </svg>

            {/* legend */}
            <div className="flex gap-4 text-xs text-gray-600">
                <LegendItem colour="#fde68a" border="#d97706" label="Active" />
                <LegendItem colour="#bfdbfe" border="#3b82f6" label="Merging" />
                <LegendItem colour="#bbf7d0" border="#16a34a" label="Sorted" />
                <LegendItem colour="#f1f5f9" border="#94a3b8" label="Idle" />
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
import { useId } from "react";

export default function BubbleRenderer({ array, step }) {
    const arrowId = useId();

    if (!array || array.length === 0) {
        return <div className="text-sm text-gray-400">No array to display.</div>;
    }

    const comparing = step?.comparing ?? null;
    const swapped   = step?.swapped   ?? null;
    const sorted    = step?.sortedIndices instanceof Set
        ? step.sortedIndices
        : new Set(step?.sortedIndices ?? []);

    const activeLeft  = comparing?.[0] ?? swapped?.[0] ?? null;
    const activeRight = comparing?.[1] ?? swapped?.[1] ?? null;
    const isSwap      = !!swapped;

    const BOX_W   = 48;
    const BOX_H   = 48;
    const GAP     = 8;
    const ARROW_H = 32;
    const INDEX_H = 20;   // space below boxes for index labels
    const n       = array.length;
    const svgW    = n * BOX_W + (n - 1) * GAP;
    const svgH    = BOX_H + ARROW_H + INDEX_H + 16;

    function boxColour(i) {
        if (sorted.has(i)) {
            return { fill: "#bbf7d0", stroke: "#16a34a" };
        }
        if (i === activeLeft || i === activeRight) {
            return isSwap
                ? { fill: "#fecaca", stroke: "#dc2626" }
                : { fill: "#fde68a", stroke: "#d97706" };
        }
        return { fill: "#f1f5f9", stroke: "#94a3b8" };
    }

    function renderArrow() {
        if (activeLeft === null || activeRight === null) return null;

        const x1 = activeLeft  * (BOX_W + GAP) + BOX_W / 2;
        const x2 = activeRight * (BOX_W + GAP) + BOX_W / 2;
        const y  = BOX_H + 4;
        const mx = (x1 + x2) / 2;
        const cy = y + ARROW_H * 0.75;

        const path = `M ${x1} ${y} Q ${mx} ${cy} ${x2} ${y}`;
        const colour = isSwap ? "#dc2626" : "#d97706";

        return (
            <g>
                <defs>
                    <marker
                        id={arrowId}
                        markerWidth="6"
                        markerHeight="6"
                        refX="3"
                        refY="3"
                        orient="auto"
                    >
                        <path d="M0,0 L6,3 L0,6 Z" fill={colour} />
                    </marker>
                </defs>
                <path
                    d={path}
                    fill="none"
                    stroke={colour}
                    strokeWidth="2"
                    markerEnd={`url(#${arrowId})`}
                />
                <text
                    x={mx}
                    y={cy - 4}
                    textAnchor="middle"
                    fontSize="11"
                    fill={colour}
                    fontWeight="600"
                >
                    {isSwap ? "swap" : "compare"}
                </text>
            </g>
        );
    }

    return (
        <div className="flex flex-col items-center gap-4 w-full overflow-x-auto py-2">
            <svg
                width={svgW}
                height={svgH}
                style={{ overflow: "visible", minWidth: svgW }}
            >
                {array.map((val, i) => {
                    const x = i * (BOX_W + GAP);
                    const { fill, stroke } = boxColour(i);
                    return (
                        <g key={i}>
                            {/* value box */}
                            <rect
                                x={x} y={0}
                                width={BOX_W} height={BOX_H}
                                rx={6}
                                fill={fill}
                                stroke={stroke}
                                strokeWidth={2}
                            />
                            {/* value label */}
                            <text
                                x={x + BOX_W / 2}
                                y={BOX_H / 2 + 5}
                                textAnchor="middle"
                                fontSize="16"
                                fontWeight="600"
                                fill="#1e293b"
                            >
                                {val}
                            </text>
                            {/* index label below box */}
                            <text
                                x={x + BOX_W / 2}
                                y={BOX_H + INDEX_H - 4}
                                textAnchor="middle"
                                fontSize="11"
                                fill="#94a3b8"
                            >
                                {i}
                            </text>
                        </g>
                    );
                })}

                {renderArrow()}
            </svg>

            <div className="flex gap-4 text-xs text-gray-600">
                <LegendItem colour="#fde68a" border="#d97706" label="Comparing" />
                <LegendItem colour="#fecaca" border="#dc2626" label="Swapped"   />
                <LegendItem colour="#bbf7d0" border="#16a34a" label="Sorted"    />
                <LegendItem colour="#f1f5f9" border="#94a3b8" label="Unsorted"  />
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
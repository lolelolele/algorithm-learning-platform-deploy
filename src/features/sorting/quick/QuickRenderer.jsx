import { useId } from "react";

export default function QuickRenderer({ array, step }) {
    const arrowId = useId();

    if (!array || array.length === 0) {
        return <div className="text-sm text-gray-400">No array to display.</div>;
    }

    const pivotIndex = step?.pivotIndex   ?? null;
    const leftPartition = new Set(step?.leftPartition  ?? []);
    const rightPartition = new Set(step?.rightPartition ?? []);
    const activeRange = step?.activeRange  ?? null;
    const sorted = step?.sortedIndices instanceof Set
        ? step.sortedIndices
        : new Set(step?.sortedIndices ?? []);
    const swapped = step?.swapped ?? null;
    const comparingIndex = step?.comparingIndex ?? null;

    const BOX_W = 48;
    const BOX_H = 48;
    const GAP = 8;
    const ARROW_H = 36;
    const INDEX_H = 20;
    const n = array.length;
    const svgW = n * BOX_W + (n - 1) * GAP;
    const PIVOT_LABEL_H = 20;
    const svgH = PIVOT_LABEL_H + BOX_H + ARROW_H + INDEX_H + 16;

    function boxColour(i) {
        if (sorted.has(i)) return { fill: "#bbf7d0", stroke: "#16a34a" }; // green
        if (swapped && (swapped[0] === i || swapped[1] === i)) return { fill: "#fecaca", stroke: "#dc2626" }; // red
        if (i === pivotIndex) return { fill: "#e9d5ff", stroke: "#7c3aed" }; // purple
        if (i === comparingIndex) return { fill: "#fef08a", stroke: "#ca8a04" }; // yellow
        if (leftPartition.has(i)) return { fill: "#bfdbfe", stroke: "#3b82f6" }; // blue
        if (rightPartition.has(i)) return { fill: "#fed7aa", stroke: "#f97316" }; // orange

        // dim elements outside active range
        if (activeRange) {
            const [l, r] = activeRange;
            if (i < l || i > r) return { fill: "#f8fafc", stroke: "#cbd5e1" }; // very faded
        }

        return { fill: "#f1f5f9", stroke: "#94a3b8" }; // default slate
    }

    function renderArrow() {
        const colour = "#7c3aed";
        const swapColour = "#d97706";
        const elements = [];
    
        // pivot label above pivot box
        if (pivotIndex !== null) {
            const x1 = pivotIndex * (BOX_W + GAP) + BOX_W / 2;
            elements.push(
                <text
                    key="pivot-label"
                    x={x1}
                    y={PIVOT_LABEL_H - 6}
                    textAnchor="middle"
                    fontSize="10"
                    fill={colour}
                    fontWeight="700"
                >
                    pivot
                </text>
            );
        }
    
        // swap arrow between swapped pair
        if (swapped) {
            const x1 = swapped[0] * (BOX_W + GAP) + BOX_W / 2;
            const x2 = swapped[1] * (BOX_W + GAP) + BOX_W / 2;
            const y  = PIVOT_LABEL_H + BOX_H + 4;
            const mx = (x1 + x2) / 2;
            const cy = y + ARROW_H * 0.75;
            const path = `M ${x1} ${y} Q ${mx} ${cy} ${x2} ${y}`;
    
            elements.push(
                <g key="swap-arrow">
                    <defs>
                        <marker
                            id={arrowId}
                            markerWidth="6"
                            markerHeight="6"
                            refX="3"
                            refY="3"
                            orient="auto"
                        >
                            <path d="M0,0 L6,3 L0,6 Z" fill={swapColour} />
                        </marker>
                    </defs>
                    <path
                        d={path}
                        fill="none"
                        stroke={swapColour}
                        strokeWidth="2"
                        markerEnd={`url(#${arrowId})`}
                    />
                    <text
                        x={mx}
                        y={cy - 4}
                        textAnchor="middle"
                        fontSize="11"
                        fill={swapColour}
                        fontWeight="600"
                    >
                        swap
                    </text>
                </g>
            );
        }
    
        return elements;
    }

    return (
        <div className="flex flex-col items-center justify-center gap-4 w-full h-full overflow-x-auto py-2">
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
                            <rect
                                x={x} y={PIVOT_LABEL_H}
                                width={BOX_W} height={BOX_H}
                                rx={6}
                                fill={fill}
                                stroke={stroke}
                                strokeWidth={i === pivotIndex ? 2.5 : 1.5}
                            />
                            <text
                                x={x + BOX_W / 2}
                                y={PIVOT_LABEL_H + BOX_H / 2 + 5}
                                textAnchor="middle"
                                fontSize="15"
                                fontWeight={i === pivotIndex ? "700" : "500"}
                                fill="#1e293b"
                            >
                                {val}
                            </text>
                            {/* index label */}
                            <text
                                x={x + BOX_W / 2}
                                y={PIVOT_LABEL_H + BOX_H + INDEX_H - 4}
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

            {/* active range label */}
            {activeRange && (
                <div className="text-xs text-gray-500 font-mono">
                    Active range: [{activeRange[0]}–{activeRange[1]}]
                </div>
            )}

            {/* legend */}
            <div className="flex flex-wrap gap-3 text-xs text-gray-600 justify-center">
                <LegendItem colour="#e9d5ff" border="#7c3aed" label="Pivot"         />
                <LegendItem colour="#bfdbfe" border="#3b82f6" label="≤ pivot (left)" />
                <LegendItem colour="#fed7aa" border="#f97316" label="> pivot (right)" />
                <LegendItem colour="#fef08a" border="#ca8a04" label="Being compared" />
                <LegendItem colour="#fecaca" border="#dc2626" label="Swapped"       />
                <LegendItem colour="#bbf7d0" border="#16a34a" label="Sorted"        />
                <LegendItem colour="#f1f5f9" border="#94a3b8" label="Unsorted"      />
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
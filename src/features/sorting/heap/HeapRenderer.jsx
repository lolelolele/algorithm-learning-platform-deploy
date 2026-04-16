import { useId } from "react";

const COLOURS = {
    active: { fill: "#fde68a", stroke: "#d97706" },  // amber
    comparing: { fill: "#bfdbfe", stroke: "#3b82f6" },  // blue
    swapped: { fill: "#fecaca", stroke: "#dc2626" },  // red
    sorted: { fill: "#bbf7d0", stroke: "#16a34a" },  // green
    heap: { fill: "#e0f2fe", stroke: "#0ea5e9" },  // sky
    outside: { fill: "#f1f5f9", stroke: "#cbd5e1" },  // faded
};

const NODE_R = 22;   // circle radius
const H_GAP = 56;   // horizontal gap between nodes at deepest level
const V_GAP = 70;   // vertical gap between levels
const BOX_W = 44;
const BOX_H = 36;
const BOX_GAP = 6;
const SVG_PAD = 20;

function getNodeColour(index, step) {
    const { comparing, swapped, activeNode, sortedIndices, heapSize } = step;

    if (sortedIndices && sortedIndices.has(index)) return COLOURS.sorted;
    if (index >= heapSize) return COLOURS.outside;
    if (swapped && (swapped[0] === index || swapped[1] === index)) return COLOURS.swapped;
    if (comparing && (comparing[0] === index || comparing[1] === index)) return COLOURS.comparing;
    if (activeNode === index) return COLOURS.active;
    return COLOURS.heap;
}

// calculate x,y position for a node at given index in a binary tree
function nodePositions(n, svgWidth) {
    const positions = [];
    const levels = Math.floor(Math.log2(n)) + 1;

    for (let i = 0; i < n; i++) {
        const level = Math.floor(Math.log2(i + 1));
        const levelStart = Math.pow(2, level) - 1;
        const posInLevel = i - levelStart;
        const nodesInLevel = Math.pow(2, level);
        const totalLevels  = Math.floor(Math.log2(n)) + 1;

        // spread nodes evenly across the SVG width at each level
        const sectionW = svgWidth / nodesInLevel;
        const x = sectionW * posInLevel + sectionW / 2;
        const y = SVG_PAD + level * V_GAP + NODE_R;

        positions.push({ x, y, level });
    }

    return positions;
}

export default function HeapRenderer({ array, step }) {
    const swapArrowId = useId();

    if (!array || array.length === 0) {
        return <div className="text-sm text-gray-400">No array to display.</div>;
    }

    if (!step) return null;

    const n = array.length;
    const heapSize = step.heapSize ?? n;
    const swapped = step.swapped ?? null;

    // SVG width based on deepest level node count
    const levels = Math.floor(Math.log2(n)) + 1;
    const maxNodes = Math.pow(2, levels - 1);
    const treeWidth = Math.max(maxNodes * H_GAP, 300);
    const treeHeight = levels * V_GAP + NODE_R * 2 + SVG_PAD;

    // array row dimensions
    const arrayRowW = n * (BOX_W + BOX_GAP) - BOX_GAP;
    const svgWidth = Math.max(treeWidth, arrayRowW + SVG_PAD * 2);
    const svgHeight = treeHeight + BOX_H + 40;

    const positions = nodePositions(n, treeWidth);
    // centre the tree in the SVG
    const treeOffsetX = (svgWidth - treeWidth) / 2;

    function renderEdges() {
        return array.map((_, i) => {
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            const edges = [];
            const p = positions[i];

            if (left < n) {
                const c = positions[left];
                edges.push(
                    <line
                        key={`edge-${i}-left`}
                        x1={p.x + treeOffsetX} y1={p.y + NODE_R}
                        x2={c.x + treeOffsetX} y2={c.y - NODE_R}
                        stroke="#94a3b8"
                        strokeWidth={1.5}
                    />
                );
            }

            if (right < n) {
                const c = positions[right];
                edges.push(
                    <line
                        key={`edge-${i}-right`}
                        x1={p.x + treeOffsetX} y1={p.y + NODE_R}
                        x2={c.x + treeOffsetX} y2={c.y - NODE_R}
                        stroke="#94a3b8"
                        strokeWidth={1.5}
                    />
                );
            }
            return edges;
        });
    }

    function renderNodes() {
        return array.map((val, i) => {
            const { x, y } = positions[i];
            const cx = x + treeOffsetX;
            const colours = getNodeColour(i, step);

            return (
                <g key={i}>
                    <circle
                        cx={cx} cy={y}
                        r={NODE_R}
                        fill={colours.fill}
                        stroke={colours.stroke}
                        strokeWidth={step.activeNode === i ? 2.5 : 1.5}
                    />
                    <text
                        x={cx} y={y + 5}
                        textAnchor="middle"
                        fontSize="13"
                        fontWeight="600"
                        fill="#1e293b"
                    >
                        {val}
                    </text>
                    {/* index label below circle */}
                    <text
                        x={cx} y={y + NODE_R + 14}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#94a3b8"
                    >
                        {i}
                    </text>
                </g>
            );
        });
    }

    function renderArrayRow() {
        const rowY = treeHeight + 16;
        const rowStartX = (svgWidth - arrayRowW) / 2;

        const elements = [];

        // swap arrow in array row
        if (swapped) {
            const x1 = rowStartX + swapped[0] * (BOX_W + BOX_GAP) + BOX_W / 2;
            const x2 = rowStartX + swapped[1] * (BOX_W + BOX_GAP) + BOX_W / 2;
            const y  = rowY + BOX_H;
            const mx = (x1 + x2) / 2;
            const cy = y + 30;
            const path = `M ${x1} ${y} Q ${mx} ${cy} ${x2} ${y}`;

            elements.push(
                <g key="swap-arrow">
                    <defs>
                        <marker
                            id={swapArrowId}
                            markerWidth="6" markerHeight="6"
                            refX="3" refY="3"
                            orient="auto"
                        >
                            <path d="M0,0 L6,3 L0,6 Z" fill="#dc2626" />
                        </marker>
                    </defs>
                    <path
                        d={path}
                        fill="none"
                        stroke="#dc2626"
                        strokeWidth="1.5"
                        markerEnd={`url(#${swapArrowId})`}
                    />
                    <text
                        x={mx} y={cy - 4}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#dc2626"
                        fontWeight="600"
                    >
                        swap
                    </text>
                </g>
            );
        }

        // boxes
        array.forEach((val, i) => {
            const x = rowStartX + i * (BOX_W + BOX_GAP);
            const colours = getNodeColour(i, step);

            elements.push(
                <g key={`box-${i}`}>
                    <rect
                        x={x} y={rowY}
                        width={BOX_W} height={BOX_H}
                        rx={5}
                        fill={colours.fill}
                        stroke={colours.stroke}
                        strokeWidth={1.5}
                    />
                    <text
                        x={x + BOX_W / 2}
                        y={rowY + BOX_H / 2 + 5}
                        textAnchor="middle"
                        fontSize="13"
                        fontWeight="500"
                        fill="#1e293b"
                    >
                        {val}
                    </text>
                    <text
                        x={x + BOX_W / 2}
                        y={rowY + BOX_H + 14}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#94a3b8"
                    >
                        {i}
                    </text>
                </g>
            );
        });

        return elements;
    }

    return (
        <div className="flex flex-col items-center justify-center gap-3 w-full h-full overflow-auto">
            {/* phase label */}
            <div className="text-xs font-medium text-gray-500">
                Heap Size: {heapSize} / {n}
            </div>

            <svg
                width={svgWidth}
                height={svgHeight}
                style={{ maxWidth: "100%", overflow: "visible" }}
            >
                {/* edges behind nodes */}
                {renderEdges()}
                {renderNodes()}
                {renderArrayRow()}
            </svg>

            {/* legend */}
            <div className="flex flex-wrap gap-3 text-xs text-gray-600 justify-center">
                <LegendItem colour="#fde68a" border="#d97706" label="Active"    />
                <LegendItem colour="#bfdbfe" border="#3b82f6" label="Comparing" />
                <LegendItem colour="#fecaca" border="#dc2626" label="Swapped"   />
                <LegendItem colour="#e0f2fe" border="#0ea5e9" label="In heap"   />
                <LegendItem colour="#bbf7d0" border="#16a34a" label="Sorted"    />
            </div>
        </div>
    );
}

function LegendItem({ colour, border, label }) {
    return (
        <div className="flex items-center gap-1">
            <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: colour, border: `2px solid ${border}` }}
            />
            <span>{label}</span>
        </div>
    );
}
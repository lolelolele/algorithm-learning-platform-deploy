import { useState, useEffect } from "react";
import AlgorithmLayout from "../components/AlgorithmLayout";
import WeightedGraphRenderer from "../features/graph-pathfinding/weighted/WeightedGraphRenderer";
import { defaultGraph, templates } from "../features/graph-pathfinding/weighted/a-star/data/graphs";
import { generateAStarSteps } from "../features/graph-pathfinding/weighted/a-star/logic/aStarSteps";

// ui icons for playback controls
import playIcon from "../assets/icons/play.png";
import pauseIcon from "../assets/icons/pause.png";
import stepForwardIcon from "../assets/icons/step_forward.png";
import stepBackwardIcon from "../assets/icons/step_backward.png";
import resetIcon from "../assets/icons/reset.png";

// deep clone a graph so we can safely mutate edge weights
function cloneGraph(g) {
    return {
        ...g,
        nodes: g.nodes.map(n => ({ ...n })),
        edges: g.edges.map(e => ({ ...e })),
    };
}

export default function AStar() {

    /* Graph configuration:
        - graph: current graph data
        - selectedTemplateId: which template is currently active */
    const [graph, setGraph] = useState(cloneGraph(defaultGraph));
    const [selectedTemplateId, setSelectedTemplateId] = useState("custom");

    /* Algorithm state:
        - startId: current source node chosen by the user
        - endId: target node chosen by user
        - stepIndex: current playback position in the step sequence */
    const [startId, setStartId] = useState(graph.startId);
    const [endId, setEndId] = useState(graph.endId);
    const [stepIndex, setStepIndex] = useState(0);

    /* step-by-step execution trace for the current graph and endpoints */
    const steps = generateAStarSteps(graph, startId, endId);
    
    /* prevents out of range access if the steps array shrinks after changing graph */
    const safeStepIndex = Math.min(stepIndex, steps.length - 1);
    const currentStep = steps[safeStepIndex];

    /* Playback controls:
        - isPlaying: whether autoplay is running
        - speed: playback speed multipler */
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);

    // local weight edits — stored as { "A-B": 7, ... }
    const [weightEdits, setWeightEdits] = useState({});
    const [weightError, setWeightError] = useState("");

    /* if the start/end changes -> reset playback */
    useEffect(() => {
        setIsPlaying(false);
        setStepIndex(0);
    }, [startId, endId]);

    useEffect(() => {
        if (!isPlaying) return;

        //stops autoplay when last step has been reached
        if (safeStepIndex >= steps.length - 1) {
            setIsPlaying(false);
            return;
        }

        const timer = setTimeout(() => {
            setStepIndex((i) => Math.min(i + 1, steps.length - 1));
        }, 700/speed);

        // prevents multiple timers and memory leaks
        return () => clearTimeout(timer);
    }, [isPlaying, speed, safeStepIndex, steps.length]);

    return (
        <AlgorithmLayout
            title="A* Search Algorithm"

            algoInfo={
                <div className="space-y-4 text-sm text-gray-700 leading-relaxed">

                    {/*a-star description*/}
                    <div>
                        <h3 className="font-medium mb-1">Description</h3>
                            <p className="text-sm text-gray-600">
                                A* is an informed search algorithm that finds the shortest
                                path by combining the actual cost from the start (g) with
                                an estimated cost to the goal (h). This heuristic guides
                                the search toward the goal, making it faster than Dijkstra
                                in most cases.
                            </p>
                    </div>

                    {/* steps on how a-star works */}
                    <div>
                        <h3 className="font-medium mb-1">How it works</h3>
                        <ul className="list-disc ml-5 space-y-1 text-gray-600">
                            <li>Assign f(n) = g(n) + h(n) to each node.</li>
                            <li>g(n) is the actual cost from start to n.</li>
                            <li>h(n) is the estimated cost from n to goal.</li>
                            <li>Always expand the node with the lowest f score.</li>
                            <li>Stop when the goal is reached or open list is empty.</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-medium mb-1">Complexity</h3>
                        <ul className="list-disc ml-5 space-y-1 text-gray-600">
                            <li>
                                <span className="font-medium">Time:</span> O((V + E) log V) 
                            </li>
                            <li>
                                <span>Space:</span> O(V)
                            </li>
                        </ul>
                    </div>
                </div>
            }

            /* supports template switching and selcting start/end nodes */
            graphEditor={
                <div className="space-y-4 text-sm">

                    <div>
                        <label className="block font-medium mb-1">Graph Templates:</label>

                        <select 
                            className="w-full rounded-md border p-2" 
                            value={selectedTemplateId}
                            onChange={(e) => {
                                const value = e.target.value;
                                setSelectedTemplateId(value);

                                //stop autoplay and reset to keep state consistent after data changes
                                setIsPlaying(false);
                                setStepIndex(0);

                                //resets to default graph configuration
                                if (value === "custom") {
                                    setGraph(defaultGraph);
                                    setStartId(defaultGraph.startId);
                                    setEndId(defaultGraph.endId);
                                } else {
                                    //load a template by id
                                    const selected = templates.find(t => t.id ===value);
                                    if (selected) {
                                        setGraph(selected);
                                        setStartId(selected.startId);
                                        setEndId(selected.endId);
                                    }
                                }
                            }}

                        >
                            <option value="custom">Custom (Default)</option>

                            {/* group templates selection */}
                            <optgroup label="Grid">
                                {templates
                                    .filter(t => t.category === "Grid")
                                    .map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                        </option>
                                    ))}
                            </optgroup>

                            <optgroup label="Heuristic Trap">
                                {templates
                                    .filter(t => t.category === "Heuristic Trap")
                                    .map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                        </option>
                                    ))}
                            </optgroup>

                            <optgroup label="Uniform Weights">
                                {templates
                                    .filter(t => t.category === "A* vs Dijkstra")
                                    .map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                        </option>
                                    ))}
                            </optgroup>

                        </select>
                    </div>

                    {/* start node selector */}
                    <div>
                        <label className="block font-medium mb-1">Start Node:</label>
                        <select
                            className="w-full rounded-md border p-2"
                            value={startId}
                            onChange={(e) => setStartId(e.target.value)}
                        >
                            {graph.nodes.map((node) => (
                                <option key={node.id} value={node.id} disabled={node.id === endId}>
                                {node.id}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* end node selector */}
                    <div>
                        <label className="block font-medium mb-1">End Node:</label>
                        <select
                            className="w-full rounded-md border p-2"
                            value={endId}
                            onChange={(e) => setEndId(e.target.value)}
                        >
                            {graph.nodes.map((node) => (
                                <option key={node.id} value={node.id} disabled={node.id === startId}>
                                {node.id}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            }

            /* GraphRender draws the graph and highlights algorithm state for the current step */
            visualisation={
                <WeightedGraphRenderer
                    graph={graph}
                    startId={startId}
                    endId={endId}
                    step={{
                        currentNode: currentStep.currentNode,
                        visited: currentStep.visited,
                        frontier: currentStep.openList,
                        activeEdge: currentStep.activeEdge,
                        shortestPathNodes: currentStep.shortestPathNodes,
                        shortestPathEdges: currentStep.shortestPathEdges,
                    }}
                />
            }

            /* showcases internal state (frontier & counters) e*/
            metrics={
                <div className="text-sm text-gray-700 space-y-3">
                    <div>
                        <h3 className="font-medium mb-2">Frontier</h3>

                        {/* displays the current frontier snapshot with the node and its distances */}
                        <div className="rounded-md border bg-white p-2 text-gray-700">
                            {currentStep?.pq?.length
                                ? currentStep.pq
                                    .map(
                                        (item) =>
                                            `${item.id}(${item.dist === Infinity ? "∞" : item.dist})`
                                    )
                                    .join(", ")
                                : "Empty"}
                        </div>
                    
                    </div>

                    <div>
                        <h3 className="font-medium mb-2">Live Counters</h3>
                        <ul className="space-y-1 text-gray-600">
                            <li>Node visits: {currentStep?.counters?.nodeVisits ?? 0}</li>
                            <li>Relax attempts: {currentStep?.counters?.relaxAttempts ?? 0}</li>
                            <li>Successful relaxations: {currentStep?.counters?.successfulRelaxations ?? 0}</li>
                        </ul>
                    </div>
                </div>
            }

            /* displays algorithm explanation step-by step includes rule, reason and the effect */
            whyThisStep={
                <div className="text-sm text-gray-700 space-y-3">
                    <div className="text-xs text-gray-500 space-y-1">
                        <div>Phase: {currentStep?.phase ?? "-"}</div>
                        <div>Frontier: {currentStep?.frontierWithDist ?? "∅"}</div>
                    </div>

                    {currentStep?.explanationParts ?(
                        <div className="space-y-2 leading-relaxed">
                            <div>
                                <span className="font-semibold">Rule: </span>
                                <span>{currentStep.explanationParts.rule}</span>
                            </div>

                            <div>
                                <span className="font-semibold">Reason: </span>
                                <span>{currentStep.explanationParts.reason}</span>
                            </div>

                            <div>
                                <span className="font-semibold">Effect: </span>
                                <span>{currentStep.explanationParts.effect}</span>
                            </div>
                        </div>
                    ) : (
                        <p className="leading-relaxed">
                            {currentStep?.explanation ?? "No explanation available for this step yet."}
                        </p>
                    )}
                </div>
            }

            /* playback controls includes:
                - manual stepping (forward/backwards)
                - autoplay
                - speed slider (0.25x-2x) */
            controls={

                <div className="flex items-center justify-between gap-4">
                    
                    {/*Left control panel buttons*/}
                    <div className="flex items-center gap-2">
                        {/*Step Backwards button, disabled at the first step*/}
                        <button
                            type="button"
                            title="Step Backward"
                            aria-label="Step Backward"
                            disabled={safeStepIndex === 0}
                            onClick={() => {
                                setIsPlaying(false);
                                setStepIndex((i) => Math.max(i - 1, 0));
                            }}
                            className="rounded-md border px-3 py-1 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white text-lg"
                        >
                            <img 
                            src={stepBackwardIcon} 
                            alt="Step Back"
                            className="h-6 w-5"
                            />
                        </button>

                        {/*Play and pause button*/}
                        <button
                            type="button"
                            title={isPlaying ? "Pause" : "Play"}
                            aria-label={isPlaying ? "Pause" : "Play"}
                            disabled={steps.length <= 1}
                            onClick={() => setIsPlaying((p) => !p)}
                            className="rounded-md border px-3 py-1 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white text-lg"
                        >
                            <img 
                            src={isPlaying ? pauseIcon : playIcon} 
                            alt={isPlaying ? "Pause" : "Play"} 
                            className="h-6 w-5"
                            />
                        </button>

                        {/*Step Forward button, disabled at the final step*/}
                        <button
                            type="button"
                            title="Step Forward"
                            aria-label="Step Back"
                            disabled={safeStepIndex >= steps.length - 1}
                            onClick={() => {
                                setIsPlaying(false);
                                setStepIndex((i) => Math.min(i + 1, steps.length - 1));
                            }}
                            className="rounded-md border px-3 py-1 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white text-lg"
                        >
                            <img 
                            src={stepForwardIcon} 
                            alt="Step Forward"
                            className="h-6 w-5"
                            />
                        </button>

                        {/*Reset button to step 0*/}
                        <button
                            type="button"
                            title="Reset"
                            aria-label="Reset"
                            onClick={() => {
                                setIsPlaying(false);
                                setStepIndex(0);
                            }}
                            className="rounded-md border px-3 py-1 hover:bg-gray-100 text-lg"
                        >
                            <img 
                            src={resetIcon} 
                            alt="Reset"
                            className="h-6 w-5"
                            />
                        </button>
                    </div>

                    {/*Middle control panel: speed slider*/}
                    <div className="flex items-center gap-3">
                        <span>Speed: </span>

                        <input
                            type="range"
                            min="0.25"
                            max="2"
                            step="0.25"
                            value={speed}
                            onChange={(e) => setSpeed(Number(e.target.value))}
                            className="w-40"
                        />

                        <span className="text-xs text-gray-500">{speed}x</span>
                    </div>

                    {/*Right control panel: progress indicator (step/total steps)*/}
                    <div className="text-gray-700">
                        Step: {safeStepIndex + 1} / {steps.length}
                    </div>
                </div>
                
            }
        />
    );
}
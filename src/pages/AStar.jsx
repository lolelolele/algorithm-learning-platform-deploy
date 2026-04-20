import { useState, useEffect, useMemo } from "react";
import AlgorithmLayout from "../components/AlgorithmLayout";
import WeightedGraphRenderer from "../features/graph-pathfinding/weighted/WeightedGraphRenderer";
import { defaultGraph, templates } from "../features/graph-pathfinding/weighted/a-star/data/graphs";
import { generateAStarSteps } from "../features/graph-pathfinding/weighted/a-star/logic/aStarSteps";
import ChallengeMode from "../components/ChallengeMode";
import { generateAStarChallengeQuestions } from "../features/graph-pathfinding/weighted/a-star/logic/aStarChallengeQuestions";

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
    const steps = useMemo(() => generateAStarSteps(graph, startId, endId), [graph, startId, endId]);
    
    /* prevents out of range access if the steps array shrinks after changing graph */
    const safeStepIndex = Math.min(stepIndex, steps.length - 1);
    const currentStep = steps[safeStepIndex];

    const challengeQuestions = useMemo(() => generateAStarChallengeQuestions(steps), [steps]);

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

    // when template changes it loads a new graph and resets weight edit
    function handleTemplateChange(value) {
        setSelectedTemplateId(value);
        setIsPlaying(false);
        setStepIndex(0);
        setWeightEdits({});
        setWeightError("");
    
        if (value === "custom") {
            const g = cloneGraph(defaultGraph);
            setGraph(g);
            setStartId(g.startId);
            setEndId(g.endId);
        } else {
            const selected = templates.find(t => t.id === value);
            if (selected) {
                const g = cloneGraph(selected);
                setGraph(g);
                setStartId(g.startId);
                setEndId(g.endId);
            }
        }
    }

    // get the edge key used in weightEdits
    function edgeKey(e) {
        return `${e.from}-${e.to}`;
    }

    // get current displayed weight for an edge
    function displayWeight(e) {
        const key = edgeKey(e);
        return weightEdits[key] !== undefined ? weightEdits[key] : e.weight;
    }

    // apply all weight edits to the graph
    function applyWeights() {
        // validate all edits are positive numbers
        for (const [key, val] of Object.entries(weightEdits)) {
            const num = Number(val);
            if (isNaN(num) || num <= 0) {
                setWeightError(`Invalid weight for edge ${key} — must be a positive number.`);
                return;
            }
        }

        setWeightError("");
        const updated = cloneGraph(graph);
        updated.edges = updated.edges.map(e => {
            const key = edgeKey(e);
            return weightEdits[key] !== undefined
                ? { ...e, weight: Number(weightEdits[key]) }
                : e;
        });
        setGraph(updated);
        setStepIndex(0);
        setIsPlaying(false);
    }

    function resetWeights() {
        setWeightEdits({});
        setWeightError("");
        const source = selectedTemplateId === "custom"
            ? defaultGraph
            : templates.find(t => t.id === selectedTemplateId) ?? defaultGraph;
        const g = cloneGraph(source);
        setGraph(g);
        setStepIndex(0);
        setIsPlaying(false);
    }

    return (
        <AlgorithmLayout
            title="A* Search Algorithm"

            algoInfo={
                <div className="space-y-4 text-sm text-gray-700 leading-relaxed">

                    {/*a-star description*/}
                    <div>
                        <h3 className="font-medium mb-1">Description</h3>
                            <p className="text-sm text-gray-600">
                                A* is an informed search algorithm that finds the shortest path from
                                a start node to a goal node. Unlike Dijkstra which explores in all
                                directions equally, A* uses a heuristic estimate h(n) of the remaining
                                distance to the goal to guide the search toward the target. This makes it
                                significantly faster in practice while still guaranteeing the optimal path,
                                provided the heuristic never overestimates the true cost.
                            </p>
                    </div>

                    <div>
                        <h3 className="font-medium mb-1">The f(n) = g(n) + h(n) formula</h3>
                        <ul className="list-disc ml-5 space-y-1 text-gray-600">
                            <li><span className="font-medium">g(n)</span>: the actual cost of the path from the start node to node n.</li>
                            <li><span className="font-medium">h(n)</span>: the heuristic estimate of the cost from n to the goal. In this visualisation, h(n) values are pre-assigned to each node.</li>
                            <li><span className="font-medium">f(n) = g(n) + h(n)</span>:the total estimated cost of the cheapest path through n. A* always expands the node with the lowest f score.</li>
                        </ul>
                    </div>

                    {/* steps on how a-star works */}
                    <div>
                        <h3 className="font-medium mb-1">How it works</h3>
                        <ul className="list-disc ml-5 space-y-1 text-gray-600">
                            <li>Initialise with the start node in the open list with f = h(start).</li>
                            <li>Select the node with the lowest f score from the open list.</li>
                            <li>If it is the goal, the shortest path has been found.</li>
                            <li>Otherwise, expand its neighbours: calculate g and f scores.</li>
                            <li>Add or update neighbours in the open list if a better path is found.</li>
                            <li>Move the current node to the closed list (visited).</li>
                            <li>Repeat until the goal is reached or the open list is empty.</li>
                        </ul>
                    </div>

                    <div>
                    <h3 className="font-medium mb-1">Complexity</h3>
                        <ul className="list-disc ml-5 space-y-1 text-gray-600">
                            <li>
                                <span className="font-medium">Time: O((V + E) log V)</span>
                                <p className="text-xs text-gray-500 mt-0.5">Similar to Dijkstra in the worst case. With a good heuristic, A* explores far fewer nodes in practice, potentially much faster than Dijkstra on large graphs.</p>
                            </li>
                            <li>
                                <span className="font-medium">Space: O(V)</span>
                                <p className="text-xs text-gray-500 mt-0.5">The open and closed lists can contain up to V nodes each. A*'s main drawback is memory usage as it must keep all generated nodes in memory.</p>
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
                            
                            onChange={e => handleTemplateChange(e.target.value)}

                        >
                            <option value="custom">Default</option>

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
                                    .filter(t => t.category === "Uniform Weights")
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

                    {/* weight editor */}
                    <div className="border-t pt-3">
                        <label className="block font-medium mb-2">Edit Edge Weights:</label>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            {graph.edges.map(e => (
                                <div key={edgeKey(e)} className="flex items-center gap-2">
                                    <span className="text-gray-600 font-mono text-xs w-16 flex-shrink-0">
                                        {e.from} → {e.to}
                                    </span>
                                    <input
                                        type="number"
                                        min="1"
                                        value={displayWeight(e)}
                                        onChange={ev => setWeightEdits(prev => ({
                                            ...prev,
                                            [edgeKey(e)]: ev.target.value,
                                        }))}
                                        className="w-full rounded-md border p-1 text-sm"
                                    />
                                </div>
                            ))}
                        </div>
                        {weightError && (
                            <p className="text-red-500 text-xs mt-1">{weightError}</p>
                        )}

                        <div className="mt-2 flex gap-2">
                            <button
                                onClick={applyWeights}
                                className="flex-1 rounded-md border px-3 py-1.5 bg-gray-50 hover:bg-gray-100 font-medium text-sm"
                            >
                                Apply Weights
                            </button>
                            <button
                                onClick={resetWeights}
                                className="flex-1 rounded-md border px-3 py-1.5 bg-gray-50 hover:bg-gray-100 font-medium text-sm"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>
            }

            /* GraphRender draws the graph and highlights algorithm state for the current step */
            visualisation={
                <ChallengeMode
                    steps={steps}
                    currentStepIndex={safeStepIndex}
                    onStepChange={setStepIndex}
                    isPlaying={isPlaying}
                    onPlayingChange={setIsPlaying}
                    questions={challengeQuestions}
                >
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
                </ChallengeMode>
            }

            /* showcases internal state (frontier & counters) e*/
            metrics={
                <div className="text-sm text-gray-700 space-y-3">
                    <div>
                        <h3 className="font-medium mb-2">Open List</h3>
                        <div className="rounded-md border bg-white p-2 text-gray-700">
                            {currentStep?.openList?.length > 0
                                ? currentStep.openList.map(nodeId =>
                                    `${nodeId}(f:${currentStep.f?.[nodeId] !== undefined && currentStep.f[nodeId] !== Infinity
                                        ? currentStep.f[nodeId]
                                        : "∞"})`
                                  ).join(", ")
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
                        <div>Open List: {currentStep?.openList?.length > 0
                            ? currentStep.openList.join(", ")
                            : "∅"}
                        </div>
                    </div>
                    <div className="space-y-2 leading-relaxed">
                        <div>
                            <span className="font-semibold">Rule: </span>
                            <span>{currentStep?.explanationParts?.rule ?? "—"}</span>
                        </div>
                        <div>
                            <span className="font-semibold">Reason: </span>
                            <span>{currentStep?.explanationParts?.reason ?? "—"}</span>
                        </div>
                        <div>
                            <span className="font-semibold">Effect: </span>
                            <span>{currentStep?.explanationParts?.effect ?? "—"}</span>
                        </div>
                    </div>
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
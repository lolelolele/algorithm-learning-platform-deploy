import { useState, useEffect } from "react";
import AlgorithmLayout from "../components/AlgorithmLayout";
import TraversalRenderer from "../features/graph-pathfinding/traversal/TraversalRenderer";
import { defaultGraph, templates } from "../features/graph-pathfinding/traversal/dfs/data/graphs";
import { generateDFSSteps } from "../features/graph-pathfinding/traversal/dfs/logic/dfsSteps";

// ui icons for playback controls
import playIcon from "../assets/icons/play.png";
import pauseIcon from "../assets/icons/pause.png";
import stepForwardIcon from "../assets/icons/step_forward.png";
import stepBackwardIcon from "../assets/icons/step_backward.png";
import resetIcon from "../assets/icons/reset.png";

export default function DFS() {

    /* Graph configuration:
        - graph: current graph data
        - selectedTemplateId: which template is currently active */
    const [graph, setGraph] = useState(defaultGraph);
    const [selectedTemplateId, setSelectedTemplateId] = useState("custom");

    /* Algorithm state:
        - startId: current source node chosen by the user
        - stepIndex: current playback position in the step sequence */
    const [startId, setStartId] = useState(graph.startId);
    const [stepIndex, setStepIndex] = useState(0);

    /* Playback controls:
        - isPlaying: whether autoplay is running
        - speed: playback speed multipler */
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);

    /* step-by-step execution trace for the current graph and endpoints */
    const steps = generateDFSSteps(graph, startId);
    
    /* prevents out of range access if the steps array shrinks after changing graph */
    const safeStepIndex = Math.min(stepIndex, steps.length - 1);
    const currentStep = steps[safeStepIndex];

    /* if the start/end changes -> reset playback */
    useEffect(() => {
        setIsPlaying(false);
        setStepIndex(0);
    }, [startId]);

    /* autoplay timer */
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
            title="Depth-First Search (DFS)"

            algoInfo={
                <div className="space-y-4 text-sm text-gray-700 leading-relaxed">

                    {/*dfs description*/}
                    <div>
                        <h3 className="font-medium mb-1">Description</h3>
                            <p className="text-sm text-gray-600">
                                DFS explores a graph by going as deep as possible along
                                each branch before backtracking. It uses a stack (LIFO)
                                instead of BFS's queue, which means it prioritises depth
                                over breadth.
                            </p>
                    </div>

                    {/* steps on how dfs works */}
                    <div>
                        <h3 className="font-medium mb-1">How it works</h3>
                        <ul className="list-disc ml-5 space-y-1 text-gray-600">
                            <li>Push the start node onto a stack and mark it as seen.</li>
                            <li>Pop the top node and mark it as visited.</li>
                            <li>Push all unvisited neighbours onto the stack.</li>
                            <li>Repeat until the stack is empty.</li>
                            <li>If a dead end is reached, backtrack to the last node with unvisited neighbours.</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-medium mb-1">Complexity</h3>
                        <ul className="list-disc ml-5 space-y-1 text-gray-600">
                            <li>
                                <span className="font-medium">Time:</span> O(V + E)
                            </li>
                            <li>
                                <span>Space:</span> O(V)
                            </li>
                        </ul>
                    </div>
                </div>
            }

            /* supports template switching and selcting start/end nodes */
            editorPanel={
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
                                } else {
                                    //load a template by id
                                    const selected = templates.find(t => t.id ===value);
                                    if (selected) {
                                        setGraph(selected);
                                        setStartId(selected.startId);
                                    }
                                }
                            }}

                        >
                            <option value="custom">Custom (Default)</option>

                            {/* group templates selection */}
                            <optgroup label="Tree">
                                {templates
                                    .filter(t => t.category === "Tree")
                                    .map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                        </option>
                                    ))}
                            </optgroup>

                            <optgroup label="Cyclic">
                                {templates
                                    .filter(t => t.category === "Cyclic")
                                    .map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                        </option>
                                    ))}
                            </optgroup>

                            <optgroup label="Grid">
                                {templates
                                    .filter(t => t.category === "Grid")
                                    .map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                        </option>
                                    ))}
                            </optgroup>

                            <optgroup label="Linear">
                                {templates
                                    .filter(t => t.category === "Linear")
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
                                <option key={node.id} value={node.id}>
                                    {node.id}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            }

            /* GraphRender draws the graph and highlights algorithm state for the current step */
            visualisation={
                <TraversalRenderer
                    graph={graph}
                    step={{
                        startId: startId,
                        currentNode: currentStep.currentNode,
                        visited: Array.from(currentStep.visitedNodes),
                        //stack passed as frontier so TraversalRenderer colours it blue
                        frontier: currentStep.stack,
                        highlightEdges: Array.from(currentStep.highlightEdges),
                    }}
                />
            }

            /* showcases internal state (frontier & counters) e*/
            metrics={
                <div className="text-sm text-gray-700 space-y-3">
                    <div>
                        <h3 className="font-medium mb-2">Current Node:</h3>
                        <span className="font-mono">{currentStep.currentNode}</span>
                    </div>

                    <div>
                        <span className="font-medium">Stack: </span>
                        <span className="font-mono">
                            [{currentStep.stack.join(", ")}]
                        </span>
                    </div>

                    <div>
                        <span className="font-medium">Visited Order: </span>
                        <span className="font-mono">
                            {currentStep.visitedOrder.join(" → ")}
                        </span>
                    </div>

                    <div>
                        <span className="font-medium">Nodes Visited: </span>
                        <span>{currentStep.visitedNodes.size}</span>
                    </div>

                    <div>
                        <span className="font-medium">Operations: </span>
                        <span>{currentStep.operationCount}</span>
                    </div>
                    
                    <div className="mt-2 p-2 rounded bg-gray-50 border text-xs text-gray-600">
                        {currentStep.explanation}
                    </div>
                </div>
            }

            /* displays algorithm explanation step-by step includes rule, reason and the effect */
            whyThisStep={
                <div className="text-sm text-gray-600 leading-relaxed">
                    {currentStep.whyThisStep}
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
                            aria-label="Step Forward"
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
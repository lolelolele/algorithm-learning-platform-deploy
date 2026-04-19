import { useState, useEffect, useMemo } from "react";
import AlgorithmLayout from "../components/AlgorithmLayout";
import BSTRenderer from "../features/bst/BSTRenderer";
import { buildBST, buildBSTFromString, presetTrees, defaultValues } from "../features/bst/data/trees";
import { generateBSTSearchSteps } from "../features/bst/search/logic/bstSearchSteps";
import ChallengeMode from "../components/ChallengeMode";
import { generateBSTSearchChallengeQuestions } from "../features/bst/search/logic/bstSearchChallengeQuestions";

// ui icons for playback controls
import playIcon from "../assets/icons/play.png";
import pauseIcon from "../assets/icons/pause.png";
import stepForwardIcon from "../assets/icons/step_forward.png";
import stepBackwardIcon from "../assets/icons/step_backward.png";
import resetIcon from "../assets/icons/reset.png";

export default function BSTSearch() {

    /* tree state */
    const [treeRoot, setTreeRoot] = useState(() => buildBST(defaultValues));
    const [selectedPreset, setSelectedPreset] = useState("balanced-small");
    const [customInput, setCustomInput] = useState("");
    const [inputError, setInputError] = useState("");

    /* search target */
    const [searchValue, setSearchValue] = useState(4);
    const [searchInput, setSearchInput] = useState("4");

    /* playback */
    const [stepIndex, setStepIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);

    const steps = useMemo(() => generateBSTSearchSteps(treeRoot, searchValue), [treeRoot, searchValue]);
    const safeStepIndex = Math.min(stepIndex, steps.length - 1);
    const currentStep = steps[safeStepIndex];
    const challengeQuestions = useMemo(() => generateBSTSearchChallengeQuestions(steps), [steps]);

    /* if the start/end changes -> reset playback */
    useEffect(() => {
        setIsPlaying(false);
        setStepIndex(0);
    }, [treeRoot, searchValue]);

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

    function handlePresetChange(id) {
        setSelectedPreset(id);
        setCustomInput("");
        setInputError("");
        const preset = presetTrees.find(p => p.id === id);
        if (preset) setTreeRoot(buildBST(preset.values));
    }

    function handleCustomBuild() {
        const result = buildBSTFromString(customInput);
        if (!result) {
            setInputError("Invalid input. Enter comma-separated numbers e.g. 5, 3, 7");
            return;
        }
        setInputError("");
        setSelectedPreset("");
        setTreeRoot(result);
    }

    return (
        <AlgorithmLayout
            title="Binary Search Tree (BST) Search"
            editorLabel="Tree Editor"

            algoInfo={
                <div className="space-y-4 text-sm text-gray-700 leading-relaxed">

                    {/*bst search description*/}
                    <div>
                        <h3 className="font-medium mb-1">Description</h3>
                            <p className="text-sm text-gray-600">
                                A Binary Search Tree (BST) is a tree where every node satisfies one rule:
                                all values in the left subtree are smaller than the node, and all values
                                in the right subtree are larger. BST Search exploits this property to
                                find a target value efficiently. At each node, the search eliminates
                                an entire half of the remaining tree.z
                            </p>
                    </div>

                    {/* steps on how bst search works */}
                    <div>
                        <h3 className="font-medium mb-1">How it works</h3>
                        <ul className="list-disc ml-5 space-y-1 text-gray-600">
                            <li>Start at the root node.</li>
                            <li>Compare the target value with the current node's value.</li>
                            <li>If they are equal = the value is found.</li>
                            <li>If the target is smaller = move to the left child (all smaller values are there).</li>
                            <li>If the target is larger = move to the right child (all larger values are there).</li>
                            <li>Repeat until the value is found or a null node is reached (value not in tree).</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-medium mb-1">Complexity</h3>
                        <ul className="list-disc ml-5 space-y-1 text-gray-600">
                        <li>
                            <span className="font-medium">Time: O(h) where h is the tree height</span>
                            <p className="text-xs text-gray-500 mt-0.5">Each comparison moves one level down the tree. The maximum number of comparisons equals the height of the tree.</p>
                        </li>
                        <li>
                            <span className="font-medium">Best/Average case: O(log n) — balanced tree</span>
                            <p className="text-xs text-gray-500 mt-0.5">In a balanced BST, the height is log n. Each comparison eliminates roughly half the remaining nodes, giving logarithmic search time.</p>
                        </li>
                        <li>
                            <span className="font-medium">Worst case: O(n) — skewed tree</span>
                            <p className="text-xs text-gray-500 mt-0.5">If nodes are inserted in sorted order, the tree degenerates into a linked list (height = n). Search then requires visiting every node in the worst case.</p>
                        </li>
                        <li>
                            <span className="font-medium">Space: O(h)</span>
                            <p className="text-xs text-gray-500 mt-0.5">Recursive implementations use O(h) call stack space. The iterative version uses O(1) extra space.</p>
                        </li>
                        </ul>
                    </div>
                </div>
            }

            /* supports template switching and selcting start/end nodes */
            graphEditor={
                <div className="space-y-4 text-sm">

                    {/* preset selector */}
                    <div>
                        <label className="block font-medium mb-1">Preset Trees:</label>
                        <select
                            className="w-full rounded-md border p-2"
                            value={selectedPreset}
                            onChange={e => handlePresetChange(e.target.value)}
                        >
                            {presetTrees.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* custom input */}
                    <div>
                        <label className="block font-medium mb-1">Custom Tree:</label>
                        <input
                            type="text"
                            className="w-full rounded-md border p-2 text-sm"
                            placeholder="e.g. 5, 3, 7, 1, 4"
                            value={customInput}
                            onChange={e => setCustomInput(e.target.value)}
                        />
                        {inputError && (
                            <p className="text-xs text-red-500 mt-1">{inputError}</p>
                        )}
                        <div className="mt-2 flex gap-2">
                            <button
                                className="flex-1 rounded-md border px-3 py-1 text-sm hover:bg-gray-100"
                                onClick={handleCustomBuild}
                            >
                                Build Tree
                            </button>
                            <button
                                className="flex-1 rounded-md border px-3 py-1 text-sm hover:bg-gray-100"
                                onClick={() => {
                                    setSelectedPreset("balanced-small");
                                    setCustomInput("");
                                    setInputError("");
                                    const preset = presetTrees.find(p => p.id === "balanced-small");
                                    if (preset) setTreeRoot(buildBST(preset.values));
                                }}
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* search value */}
                    <div>
                        <label className="block font-medium mb-1">Search Value:</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                className="flex-1 rounded-md border p-2 text-sm"
                                value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                            />
                            <button
                                className="rounded-md border px-3 py-1 text-sm hover:bg-gray-100"
                                onClick={() => {
                                    const v = parseInt(searchInput);
                                    if (!isNaN(v)) setSearchValue(v);
                                }}
                            >
                                Search
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
                    <BSTRenderer
                    tree={currentStep?.treeSnapshot ?? treeRoot}
                    step={currentStep}
                />
                </ChallengeMode>
            }

            /* showcases internal state (frontier & counters) e*/
            metrics={
                <div className="text-sm text-gray-700 space-y-3">
                    <div>
                        <span className="font-medium">Searching for: </span>
                        <span className="font-mono">{searchValue}</span>
                    </div>
                    <div>
                        <span className="font-medium">Current Node: </span>
                        <span className="font-mono">
                            {currentStep.currentNode
                                ? currentStep.treeSnapshot?.find(n => n.id === currentStep.currentNode)?.value ?? "—"
                                : "—"}
                        </span>
                    </div>
                    <div>
                        <span className="font-medium">Nodes Visited: </span>
                        <span>{currentStep.visitedNodes?.length ?? 0}</span>
                    </div>
                    <div>
                        <span className="font-medium">Result: </span>
                        <span className={currentStep.foundNode ? "text-green-600 font-medium" : "text-gray-500"}>
                            {currentStep.foundNode ? "Found" : "Not found yet"}
                        </span>
                    </div>
                    <div className="p-2 rounded bg-gray-50 border text-xs text-gray-600">
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
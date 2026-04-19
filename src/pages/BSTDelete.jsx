import { useState, useEffect, useMemo } from "react";
import AlgorithmLayout from "../components/AlgorithmLayout";
import BSTRenderer from "../features/bst/BSTRenderer";
import { buildBST, buildBSTFromString, flattenTree, presetTrees, defaultValues } from "../features/bst/data/trees";
import { generateBSTDeleteSteps } from "../features/bst/delete/logic/bstDeleteSteps";
import ChallengeMode from "../components/ChallengeMode";
import { generateBSTDeleteChallengeQuestions } from "../features/bst/delete/logic/bstDeleteChallengeQuestions";

// ui icons for playback controls
import playIcon from "../assets/icons/play.png";
import pauseIcon from "../assets/icons/pause.png";
import stepForwardIcon from "../assets/icons/step_forward.png";
import stepBackwardIcon from "../assets/icons/step_backward.png";
import resetIcon from "../assets/icons/reset.png";

export default function BSTDelete() {

    const [treeRoot, setTreeRoot] = useState(() => buildBST(defaultValues));
    const [selectedPreset, setSelectedPreset] = useState("balanced-small");
    const [customInput, setCustomInput] = useState("");
    const [inputError, setInputError] = useState("");

    /* delete target picked from existing nodes in the tree */
    const [deleteValue, setDeleteValue] = useState(3);

    const [stepIndex, setStepIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);

    const steps = useMemo(() => generateBSTDeleteSteps(treeRoot, deleteValue), [treeRoot, deleteValue]);
    const safeStepIndex = Math.min(stepIndex, steps.length - 1);
    const currentStep = steps[safeStepIndex];
    const challengeQuestions = useMemo(() => generateBSTDeleteChallengeQuestions(steps), [steps]);

    /* get flat list of current node values for the delete selector */
    const treeNodes = flattenTree(treeRoot);

    /* if the start/end changes -> reset playback */
    useEffect(() => {
        setIsPlaying(false);
        setStepIndex(0);
    }, [treeRoot, deleteValue]);

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
        if (preset) {
            const newRoot = buildBST(preset.values);
            setTreeRoot(newRoot);
            /* set delete value to first node */
            setDeleteValue(preset.values[0]);
        }
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
        setDeleteValue(result.value);
    }

    return (
        <AlgorithmLayout
            title="Binary Search Tree (BST) Delete"
            editorLabel="Tree Editor"

            algoInfo={
                <div className="space-y-4 text-sm text-gray-700 leading-relaxed">

                    {/*bts delete description*/}
                    <div>
                        <h3 className="font-medium mb-1">Description</h3>
                            <p className="text-sm text-gray-600">
                            BST Deletion removes a node from the tree while maintaining the BST
                            property. It is the most complex BST operation because removing a node
                            with children requires careful restructuring to preserve the ordering
                            of all remaining values. There are three distinct cases depending on
                            how many children the node being deleted has.
                            </p>
                    </div>

                    {/* steps on how bts delete works */}
                    <div>
                        <h3 className="font-medium mb-1">How it works</h3>
                        <ul className="list-disc ml-5 space-y-1 text-gray-600">
                        <li><span className="font-medium">Leaf node:</span> simply remove it.</li>
                            <li><span className="font-medium">One child:</span> replace node with its child.</li>
                            <li><span className="font-medium">Two children:</span> replace with in-order successor, then delete successor.</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-medium mb-1">The Three Cases</h3>
                        <ul className="list-disc ml-5 space-y-2 text-gray-600">
                            <li>
                                <span className="font-medium">Case 1 — Leaf node (no children):</span>
                                <p className="text-xs text-gray-500 mt-0.5">Simply remove the node. No restructuring needed since removing a leaf cannot affect any other node's position.</p>
                            </li>
                            <li>
                                <span className="font-medium">Case 2 — One child:</span>
                                <p className="text-xs text-gray-500 mt-0.5">Replace the node with its child.</p>
                            </li>
                            <li>
                                <span className="font-medium">Case 3 — Two children:</span>
                                <p className="text-xs text-gray-500 mt-0.5">Find the in-order successor which is the smallest value in the right subtree. Replace the deleted node's value with the successor's value, then delete the successor (which has at most one child, reducing to Case 1 or 2).</p>
                            </li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3 className="font-medium mb-1">Why the in-order successor?</h3>
                        <p className="text-gray-600 text-xs">
                            The in-order successor is the smallest value greater than the deleted node.
                            Replacing the deleted node with it preserves the BST property as it is
                            larger than everything in the left subtree and smaller than everything
                            else in the right subtree.
                        </p>
                    </div>


                    <div>
                        <h3 className="font-medium mb-1">Complexity</h3>
                        <ul className="list-disc ml-5 space-y-1 text-gray-600">
                            <li>
                                <span className="font-medium">Time: O(h) where h is the tree height</span>
                                <p className="text-xs text-gray-500 mt-0.5">Finding the node to delete takes O(h). Finding the in-order successor (Case 3) also takes O(h). Total is O(h).</p>
                            </li>
                            <li>
                                <span className="font-medium">Best/Average case: O(log n) — balanced tree</span>
                                <p className="text-xs text-gray-500 mt-0.5">In a balanced BST, height is log n so deletion is logarithmic.</p>
                            </li>
                            <li>
                                <span className="font-medium">Worst case: O(n) — skewed tree</span>
                                <p className="text-xs text-gray-500 mt-0.5">A degenerate tree has height n, making deletion linear in the worst case.</p>
                            </li>
                            <li>
                                <span className="font-medium">Space: O(h)</span>
                                <p className="text-xs text-gray-500 mt-0.5">Recursive deletion uses O(h) call stack space.</p>
                            </li>
                        </ul>
                    </div>
                </div>
            }

            /* supports preset switching, custom tree input and node to delete */
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
                        <button
                            className="mt-2 w-full rounded-md border px-3 py-1 text-sm hover:bg-gray-100"
                            onClick={handleCustomBuild}
                        >
                            Build Tree
                        </button>
                    </div>

                    {/* delete node picker — shows all values currently in tree */}
                    <div>
                        <label className="block font-medium mb-1">Node to Delete:</label>
                        <select
                            className="w-full rounded-md border p-2"
                            value={deleteValue}
                            onChange={e => setDeleteValue(Number(e.target.value))}
                        >
                            {treeNodes.map(n => (
                                <option key={n.id} value={n.value}>{n.value}</option>
                            ))}
                        </select>
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
                        <span className="font-medium">Deleting: </span>
                        <span className="font-mono">{deleteValue}</span>
                    </div>
                    <div>
                        <span className="font-medium">Current Node: </span>
                        <span className="font-mono">{currentStep.currentNode ?? "—"}</span>
                    </div>
                    <div>
                        <span className="font-medium">Nodes Visited: </span>
                        <span>{currentStep.visitedNodes?.length ?? 0}</span>
                    </div>
                    <div>
                        <span className="font-medium">Case: </span>
                        <span className="text-gray-600">
                            {currentStep.deletedNode
                                ? currentStep.highlightNodes?.length > 0
                                    ? "Two children (successor)"
                                    : currentStep.explanation?.includes("leaf")
                                        ? "Leaf node"
                                        : "One child"
                                : "Searching"}
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
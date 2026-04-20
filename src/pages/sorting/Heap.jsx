import { useState, useEffect, useMemo } from "react";
import AlgorithmLayout from "../../components/AlgorithmLayout";
import HeapRenderer from "../../features/sorting/heap/HeapRenderer";
import { generateHeapSteps } from "../../features/sorting/heap/logic/heapSteps";
import { defaultArray, presets } from "../../features/sorting/data/arrays";
import ChallengeMode from "../../components/ChallengeMode";
import { generateHeapChallengeQuestions } from "../../features/sorting/heap/logic/heapChallengeQuestions";

// ui icons for playback controls
import playIcon from "../../assets/icons/play.png";
import pauseIcon from "../../assets/icons/pause.png";
import stepForwardIcon from "../../assets/icons/step_forward.png";
import stepBackwardIcon from "../../assets/icons/step_backward.png";
import resetIcon from "../../assets/icons/reset.png";

export default function Heap() {
    const [array, setArray] = useState(defaultArray);
    const [arraySize, setArraySize] = useState(defaultArray.length);
    const [preset, setPreset] = useState("random");
    const [customInput, setCustomInput] = useState("");
    const [customError, setCustomError] = useState("");
    const [stepIndex, setStepIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);

    const applyNewArray = (arr) => {
        setArray(arr);
        setStepIndex(0);
        setIsPlaying(false);
    };

    const regenerate = () => applyNewArray(presets[preset](arraySize));

    const applyCustom = () => {
        const parsed = customInput.split(",").map(s => parseInt(s.trim(), 10));
        if (parsed.some(isNaN) || parsed.length < 2) {
            setCustomError("Enter at least 2 comma-separated numbers.");
            return;
        }
        if (parsed.length > 10) {
            setCustomError("Maximum 10 elements for Heap Sort.");
            return;
        }
        setCustomError("");
        applyNewArray(parsed);
    };

    const steps = useMemo(() => generateHeapSteps(array), [array]);
    const safeStepIndex = Math.min(stepIndex, steps.length - 1);
    const currentStep = steps[safeStepIndex];
    const challengeQuestions = useMemo(() => generateHeapChallengeQuestions(steps), [steps]);

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

    useEffect(() => {
        applyNewArray(presets[preset](arraySize));
    }, [preset]);

    return (
        <AlgorithmLayout
            title="Heap Sort Algorithm"
            editorLabel="Array Editor"

            algoInfo={
                <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                    <div>
                        <h3 className="font-medium mb-1">Description</h3>
                        <p className="text-gray-600">
                        Heap Sort uses a data structure called a max-heap which is a binary tree where
                        every parent node is greater than or equal to its children. This guarantees
                        the largest element is always at the root. The algorithm has two phases:
                        first it builds a max-heap from the input array, then it repeatedly extracts
                        the maximum element and places it at the end of the sorted region.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-medium mb-1">Two Phases</h3>
                        <ul className="list-disc ml-5 space-y-1 text-gray-600">
                            <li>
                                <span className="font-medium">Phase 1 — Build max-heap:</span> heapify
                                every internal node from the bottom up to the root. Heapify ensures a node is larger than both
                                its children, swapping downward if not.
                            </li>
                            <li>
                                <span className="font-medium">Phase 2 — Extract max repeatedly:</span> swap
                                the root (maximum) with the last heap element, shrink the heap by one,
                                then re-heapify the root. Each extraction places one element in its
                                final sorted position.
                            </li>
                            <li>Repeat Phase 2 until the heap has only one element remaining.</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-medium mb-1">Complexity</h3>
                        <ul className="list-disc ml-5 space-y-1 text-gray-600">
                        <li>
                            <span className="font-medium">Time — All cases: O(n log n)</span>
                            <p className="text-xs text-gray-500 mt-0.5">Building the heap takes O(n). Each of the n extractions requires a heapify operation which takes O(log n) (the height of the tree). Total: O(n log n) in best, average, and worst cases.</p>
                        </li>
                        <li>
                            <span className="font-medium">Space (in-place): O(1)</span>
                            <p className="text-xs text-gray-500 mt-0.5">Heap Sort sorts directly within the original array using only a constant amount of extra memory, making it more memory-efficient than Merge Sort.</p>
                        </li>
                        </ul>
                    </div>
                </div>
            }

            graphEditor={
                <div className="space-y-4 text-sm">
                    <div>
                        <label className="block font-medium mb-1">Preset Type:</label>
                        <select
                            className="w-full rounded-md border p-2"
                            value={preset}
                            onChange={e => setPreset(e.target.value)}
                        >
                            <option value="random">Random</option>
                            <option value="nearlySorted">Nearly Sorted</option>
                            <option value="reversed">Reverse Sorted</option>
                            <option value="fewUnique">Few Unique Values</option>
                        </select>
                    </div>
                    <div>
                        <label className="block font-medium mb-1">
                            Array Size: {arraySize}
                        </label>
                        <input
                            type="range" min={4} max={10}
                            value={arraySize}
                            onChange={e => setArraySize(Number(e.target.value))}
                            className="w-full"
                        />
                    </div>
                    <button
                        onClick={regenerate}
                        className="w-full rounded-md border px-3 py-1.5 bg-gray-50 hover:bg-gray-100 font-medium"
                    >
                        Generate Array
                    </button>

                    <div className="border-t pt-3">
                        <label className="block font-medium mb-1">Custom Input:</label>
                        <input
                            type="text"
                            placeholder="e.g. 5, 3, 8, 1, 4 (max 10)"
                            value={customInput}
                            onChange={e => setCustomInput(e.target.value)}
                            className="w-full rounded-md border p-2 mb-2"
                        />
                        {customError && (
                            <p className="text-red-500 text-xs mb-2">{customError}</p>
                        )}
                        <button
                            onClick={applyCustom}
                            className="w-full rounded-md border px-3 py-1.5 bg-gray-50 hover:bg-gray-100"
                        >
                            Apply Custom
                        </button>
                    </div>
                </div>
            }

            visualisation={
                <ChallengeMode
                    steps={steps}
                    currentStepIndex={safeStepIndex}
                    onStepChange={setStepIndex}
                    isPlaying={isPlaying}
                    onPlayingChange={setIsPlaying}
                    questions={challengeQuestions}
                >
                    <HeapRenderer
                        array={currentStep?.array ?? array}
                        step={currentStep}
                    />
                </ChallengeMode>
            }

            metrics={
                <div className="text-sm text-gray-700 space-y-3">
                    <div>
                        <h3 className="font-medium mb-2">Live Counters</h3>
                        <ul className="space-y-1 text-gray-600">
                            <li>
                                Comparisons:{" "}
                                <span className="font-mono">
                                    {currentStep?.counters?.comparisons ?? 0}
                                </span>
                            </li>
                            <li>
                                Swaps:{" "}
                                <span className="font-mono">
                                    {currentStep?.counters?.swaps ?? 0}
                                </span>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-medium mb-2">Heap Size</h3>
                        <div className="rounded-md border bg-gray-50 p-2 text-gray-700">
                            {currentStep?.heapSize ?? array.length} / {array.length}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-medium mb-2">Current Phase</h3>
                        <div className="rounded-md border bg-gray-50 p-2 text-gray-700">
                            {currentStep?.phase ?? "—"}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-medium mb-2">Sorted Elements</h3>
                        <div className="rounded-md border bg-gray-50 p-2 text-gray-700">
                            {currentStep?.sortedIndices?.size ?? 0} / {array.length}
                        </div>
                    </div>
                </div>
            }

            whyThisStep={
                <div className="text-sm text-gray-700 space-y-3">
                    {currentStep?.explanationParts ? (
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
                            {currentStep?.explanation ?? "—"}
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
import { useState, useEffect } from "react";
import AlgorithmLayout from "../components/AlgorithmLayout";
import QuickRenderer from "../features/sorting/quick/QuickRenderer";
import { generateQuickSteps } from "../features/sorting/quick/logic/quickSteps";
import { defaultArray, presets } from "../features/sorting/data/arrays";

// ui icons for playback controls
import playIcon from "../assets/icons/play.png";
import pauseIcon from "../assets/icons/pause.png";
import stepForwardIcon from "../assets/icons/step_forward.png";
import stepBackwardIcon from "../assets/icons/step_backward.png";
import resetIcon from "../assets/icons/reset.png";

export default function Quick() {
    const [array, setArray] = useState(defaultArray);
    const [arraySize, setArraySize] = useState(defaultArray.length);
    const [preset, setPreset] = useState("random");
    const[customInput, setCustomInput] = useState("");
    const[customError, setCustomError] = useState("");
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
        if (parsed.length > 8) {
            setCustomError("Maximum 8 elements for Quick Sort.");
            return;
        }
        setCustomError("");
        applyNewArray(parsed);
    };

    const steps = generateQuickSteps(array);
    const safeStepIndex = Math.min(stepIndex, steps.length - 1);
    const currentStep = steps[safeStepIndex];

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
            title="Quick Sort Algorithm"
            editorLabel="Array Editor"

            algoInfo={
                <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                    <div>
                        <h3 className="font-medium mb-1">Description</h3>
                        <p className="text-gray-600">
                            Quick Sort picks a pivot element and partitions the array so that
                            all elements smaller than or equal to the pivot are on the left,
                            and all larger elements are on the right. The pivot is then in its
                            final sorted position, and the algorithm recurses on each half.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-medium mb-1">How it works</h3>
                        <ul className="list-disc ml-5 space-y-1 text-gray-600">
                            <li>Choose the last element as the pivot.</li>
                            <li>Partition: elements ≤ pivot go left, elements &gt; pivot go right.</li>
                            <li>Place the pivot between the two groups — its final position.</li>
                            <li>Recursively sort the left and right groups.</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-medium mb-1">Complexity</h3>
                        <ul className="list-disc ml-5 space-y-1 text-gray-600">
                            <li>
                                <span className="font-medium">Time (average):</span> O(n log n) 
                            </li>
                            <li>
                                <span className="font-medium">Time (worst):</span> O(n²) — already sorted
                            </li>
                            <li>
                                <span>Space:</span> O(n) — recursion stack
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
                            type="range" min={4} max={8}
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
                            placeholder="e.g. 5, 3, 8, 1, 4 (max size = 8)"
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
                <QuickRenderer
                    array={currentStep?.array ?? array}
                    step={currentStep}
                />
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
                                Partitions:{" "}
                                <span className="font-mono">
                                    {currentStep?.counters?.swaps ?? 0}
                                </span>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-medium mb-2">Current Phase</h3>
                        <div className="rounded-md border bg-gray-50 p-2 text-gray-700">
                            {currentStep?.phase ?? "—"}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-medium mb-2">Nodes Visible</h3>
                        <div className="rounded-md border bg-gray-50 p-2 text-gray-700">
                            {currentStep?.nodes?.length ?? 0}
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
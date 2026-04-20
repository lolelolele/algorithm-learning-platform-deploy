import { useState, useEffect, useMemo } from "react";
import AlgorithmLayout from "../../components/AlgorithmLayout";
import BubbleRenderer from "../../features/sorting/bubble/BubbleRenderer";
import { generateBubbleSteps } from "../../features/sorting/bubble/logic/bubbleSteps";
import { defaultArray, presets } from "../../features/sorting/data/arrays";
import ChallengeMode from "../../components/ChallengeMode";
import { generateBubbleChallengeQuestions } from "../../features/sorting/bubble/logic/bubbleChallengeQuestions";

// ui icons for playback controls
import playIcon from "../../assets/icons/play.png";
import pauseIcon from "../../assets/icons/pause.png";
import stepForwardIcon from "../../assets/icons/step_forward.png";
import stepBackwardIcon from "../../assets/icons/step_backward.png";
import resetIcon from "../../assets/icons/reset.png";

export default function Bubble() {
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
        setCustomError("");
        applyNewArray(parsed);
    };

    const steps = useMemo(() =>generateBubbleSteps(array), [array]);
    const safeStepIndex = Math.min(stepIndex, steps.length - 1);
    const currentStep = steps[safeStepIndex];
    const challengeQuestions = useMemo(() => generateBubbleChallengeQuestions(steps), [steps]);

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
            title="Bubble Sort Algorithm"
            editorLabel = "Array Editor"

            algoInfo={
                <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                    <div>
                        <h3 className="font-medium mb-1">Description</h3>
                        <p className="text-gray-600">
                            Bubble Sort repeatedly steps through the array, comparing adjacent
                            elements and swapping them if they are in the wrong order. After each full pass, the largest
                            unsorted element has "bubbled up" to its correct position at the end.
                            This continues until no swaps occur in a full pass, meaning the array
                            is sorted.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-medium mb-1">How it works</h3>
                        <ul className="list-disc ml-5 space-y-1 text-gray-600">
                        <li>Start at the beginning of the array.</li>
                <li>Compare each adjacent pair of elements from left to right.</li>
                <li>If the left element is larger than the right, swap them.</li>
                <li>After one full pass, the largest element is guaranteed to be in its correct final position.</li>
                <li>Repeat for the remaining unsorted portion.</li>
                <li>If a full pass completes with no swaps, the array is sorted, meaning that algorithm exits early.</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-medium mb-1">Complexity</h3>
                        <ul className="list-disc ml-5 space-y-1 text-gray-600">
                            <li>
                                <span className="font-medium">Time — Worst/Average case: O(n²)</span>
                                <p className="text-xs text-gray-500 mt-0.5">Every element must be compared with every other element. With n elements, this means roughly n × n comparisons in the worst case (e.g. a reversed array).</p>
                            </li>
                            <li>
                                <span className="font-medium">Time — Best case: O(n)</span>
                                <p className="text-xs text-gray-500 mt-0.5">If the array is already sorted, one pass confirms no swaps are needed and the algorithm exits early after just n comparisons.</p>
                            </li>
                            <li>
                                <span className="font-medium">Space (in-place): O(1) </span>
                                <p className="text-xs text-gray-500 mt-0.5">The amount of space needed for Bubble Sort does not grow with the size of the input array, meaning that it uses constant space regardless of the input size.</p>
                                <p className="text-xs text-gray-500 mt-0.5">In-place means that the algorithm sorts the data within the array without requiring additional memory</p>
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

                    <div className="flex gap-2">
                        <button
                            onClick={regenerate}
                            className="flex-1 rounded-md border px-3 py-1.5 bg-gray-50 hover:bg-gray-100 font-medium text-sm"
                        >
                            Generate Array
                        </button>
                        <button
                            onClick={() => applyNewArray(defaultArray)}
                            className="flex-1 rounded-md border px-3 py-1.5 bg-gray-50 hover:bg-gray-100 font-medium text-sm"
                        >
                            Reset
                        </button>
                    </div>

                    <div className="border-t pt-3">
                        <label className="block font-medium mb-1">Custom Input:</label>
                        <input
                            type="text"
                            placeholder="e.g. 5, 3, 8, 1, 4"
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
                    <BubbleRenderer
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
                        <h3 className="font-medium mb-2">Current Phase</h3>
                        <div className="rounded-md border bg-gray-50 p-2 text-gray-700">
                            {currentStep?.phase ?? "—"}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-medium mb-2">Pass Number</h3>
                        <div className="rounded-md border bg-gray-50 p-2 text-gray-700">
                            {currentStep?.passNumber ?? 0} / {array.length - 1}
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
export function generateQuickSteps(inputArray) {
    const steps = [];
    const arr = [...inputArray];
    const n = arr.length;
    const sortedIndices = new Set();
    let comparisons = 0;
    let swaps = 0;

    steps.push({
        array: [...arr],
        pivotIndex: null,
        leftPartition: [],
        rightPartition: [],
        activeRange: [0, n - 1],
        sortedIndices: new Set(sortedIndices),
        swapped: null,
        explanation: "Starting Quick Sort. We will select a pivot element and partition the array around it, then recursively sort each side.",
        explanationParts: {
            rule: "Quick Sort works by choosing a pivot and rearranging the array so smaller elements are on the left and larger elements are on the right.",
            reason: "After partitioning, the pivot is guaranteed to be in its correct final position, everything to its left is smaller and everything to its right is larger.",
            effect: "The last element of the array will be selected as the first pivot.",
        },
        counters: { comparisons, swaps },
        phase: "Start",
    });

    function quickSort(low, high) {
        if (low >= high) {
            if (low === high) {
                sortedIndices.add(low);
                steps.push({
                    array: [...arr],
                    pivotIndex: null,
                    leftPartition: [],
                    rightPartition: [],
                    activeRange: [low, high],
                    sortedIndices: new Set(sortedIndices),
                    swapped: null,
                    explanation: `Only one element (${arr[low]}) remains in this partition, it is already sorted.`,
                    explanationParts: {
                        rule: "A single element is always in sorted order, this is the base case.",
                        reason: `There is nothing to compare ${arr[low]} against, so no action is needed.`,
                        effect: `${arr[low]} is now locked in its final position.`,
                    },
                    counters: { comparisons, swaps },
                    phase: "Base case",
                });
            }
            return;
        }

        const pivotValue = arr[high];

        steps.push({
            array: [...arr],
            pivotIndex: high,
            leftPartition: [],
            rightPartition: [],
            activeRange: [low, high],
            sortedIndices: new Set(sortedIndices),
            swapped: null,
            explanation: `Pivot selected: ${pivotValue} (the last element of the current partition, indices ${low}–${high}).`,
            explanationParts: {
                rule: "We always pick the last element of the current range as the pivot.",
                reason: `The current partition covers indices ${low} to ${high}. The last element is ${pivotValue}.`,
                effect: `Every element will be compared to ${pivotValue}. Elements smaller or equal go left, elements larger go right.`,
            },
            counters: { comparisons, swaps },
            phase: "Select pivot",
        });

        let i = low - 1;
        const leftIndices = [];
        const rightIndices = [];

        for (let j = low; j < high; j++) {
            comparisons++;
            const isSmaller = arr[j] <= pivotValue;

            steps.push({
                array: [...arr],
                pivotIndex: high,
                leftPartition: [...leftIndices],
                rightPartition: [...rightIndices],
                activeRange: [low, high],
                sortedIndices: new Set(sortedIndices),
                swapped: null,
                explanation: isSmaller
                    ? `${arr[j]} ≤ ${pivotValue} (pivot) —> this element belongs in the left group.`
                    : `${arr[j]} > ${pivotValue} (pivot) —> this element belongs in the right group.`,
                explanationParts: {
                    rule: "Compare the current element to the pivot to decide which side it belongs on.",
                    reason: isSmaller
                        ? `${arr[j]} is less than or equal to the pivot (${pivotValue}), so it goes to the left partition.`
                        : `${arr[j]} is greater than the pivot (${pivotValue}), so it goes to the right partition.`,
                    effect: isSmaller
                        ? `${arr[j]} will be swapped into the left partition area.`
                        : `${arr[j]} stays in place, it is already on the correct side.`,
                },
                counters: { comparisons, swaps },
                phase: `Comparing element ${arr[j]} to pivot`,
            });

            if (isSmaller) {
                i++;
                leftIndices.push(j);
                if (i !== j) {
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                    swaps++;

                    steps.push({
                        array: [...arr],
                        pivotIndex: high,
                        leftPartition: [...leftIndices],
                        rightPartition: [...rightIndices],
                        activeRange: [low, high],
                        sortedIndices: new Set(sortedIndices),
                        swapped: [i, j],
                        explanation: `Swapped ${arr[j]} and ${arr[i]} to move ${arr[i]} into the left partition.`,
                        explanationParts: {
                            rule: "When an element belongs on the left, swap it into the left partition area.",
                            reason: `${arr[i]} ≤ ${pivotValue} so it must be to the left of the pivot.`,
                            effect: `${arr[i]} is now in the left partition. The left partition boundary moves one step right.`,
                        },
                        counters: { comparisons, swaps },
                        phase: `Swap into left partition`,
                    });
                }
            } else {
                rightIndices.push(j);
            }
        }

        // place pivot in final position
        const pivotFinalIndex = i + 1;
        if (pivotFinalIndex !== high) {
            [arr[pivotFinalIndex], arr[high]] = [arr[high], arr[pivotFinalIndex]];
            swaps++;
        }

        sortedIndices.add(pivotFinalIndex);

        steps.push({
            array: [...arr],
            pivotIndex: pivotFinalIndex,
            leftPartition: leftIndices,
            rightPartition: rightIndices,
            activeRange: [low, high],
            sortedIndices: new Set(sortedIndices),
            swapped: pivotFinalIndex !== high ? [pivotFinalIndex, high] : null,
            explanation: `Pivot ${pivotValue} is placed at index ${pivotFinalIndex} — this is its final sorted position.`,
            explanationParts: {
                rule: "After scanning all elements, the pivot is placed between the left and right groups.",
                reason: `All elements to the left of index ${pivotFinalIndex} are ≤ ${pivotValue} and all to the right are > ${pivotValue}.`,
                effect: `${pivotValue} is now permanently sorted. Quick Sort will now recursively sort the left group and the right group independently.`,
            },
            counters: { comparisons, swaps },
            phase: `Pivot ${pivotValue} placed`,
        });

        quickSort(low, pivotFinalIndex - 1);
        quickSort(pivotFinalIndex + 1, high);
    }

    quickSort(0, n - 1);

    steps.push({
        array: [...arr],
        pivotIndex: null,
        leftPartition: [],
        rightPartition: [],
        activeRange: null,
        sortedIndices: new Set(Array.from({ length: n }, (_, i) => i)),
        swapped: null,
        explanation: "Quick Sort complete! All elements are in their final sorted positions.",
        explanationParts: {
            rule: "When every partition has been reduced to a single element or is empty, the array is fully sorted.",
            reason: `Completed with ${comparisons} comparisons and ${swaps} swaps.`,
            effect: "The array is sorted in ascending order.",
        },
        counters: { comparisons, swaps },
        phase: "Complete",
    });

    return steps;
}
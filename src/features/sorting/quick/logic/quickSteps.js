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
        explanation: "Starting Quick Sort. We will select a pivot, partition the array around it, then recursively sort each side.",
        explanationParts: {
            rule: "Quick Sort selects a pivot and partitions the array so all smaller elements are left and all larger are right.",
            reason: "The pivot ends up in its exact final sorted position after each partition.",
            effect: "The last element of the full array will be selected as the first pivot.",
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
                    explanation: `Single element ${arr[low]} at index ${low} — already in its final sorted position.`,
                    explanationParts: {
                        rule: "A single element is always sorted — base case reached.",
                        reason: `Only one element remains in this partition.`,
                        effect: `${arr[low]} is locked at index ${low}.`,
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
            explanation: `Partitioning indices ${low}–${high}. Pivot selected: ${pivotValue} (index ${high}).`,
            explanationParts: {
                rule: "Lomuto scheme: pick the last element of the current range as pivot.",
                reason: `arr[${high}] = ${pivotValue} is the last element in range [${low}–${high}].`,
                effect: `Elements ≤ ${pivotValue} will move left, elements > ${pivotValue} will move right.`,
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
                    ? `${arr[j]} ≤ pivot (${pivotValue}): moves into the left (≤) partition.`
                    : `${arr[j]} > pivot (${pivotValue}): stays in the right (>) partition.`,
                explanationParts: {
                    rule: "Compare each element with the pivot.",
                    reason: isSmaller
                        ? `${arr[j]} ≤ ${pivotValue} so it belongs on the left.`
                        : `${arr[j]} > ${pivotValue} so it belongs on the right.`,
                    effect: isSmaller
                        ? `Increment boundary and swap ${arr[j]} into the left partition.`
                        : `No swap — ${arr[j]} stays where it is.`,
                },
                counters: { comparisons, swaps },
                phase: `Scan j=${j}`,
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
                        explanation: `Swapped ${arr[j]} and ${arr[i]}: ${arr[i]} is now in the left partition at index ${i}.`,
                        explanationParts: {
                            rule: "Swap the element into the growing left partition.",
                            reason: `${arr[i]} ≤ ${pivotValue} so it must be on the left side.`,
                            effect: `Left partition boundary is now at index ${i}.`,
                        },
                        counters: { comparisons, swaps },
                        phase: `Swap [${i}] ↔ [${j}]`,
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
            explanation: `Pivot ${pivotValue} placed at index ${pivotFinalIndex} — its final sorted position.`,
            explanationParts: {
                rule: "Place the pivot at i+1 — all elements to its left are ≤ pivot, all to its right are > pivot.",
                reason: `After scanning, the boundary i = ${i}, so pivot belongs at index ${pivotFinalIndex}.`,
                effect: `${pivotValue} is locked. Recursively sort [${low}–${pivotFinalIndex - 1}] and [${pivotFinalIndex + 1}–${high}].`,
            },
            counters: { comparisons, swaps },
            phase: `Pivot placed at ${pivotFinalIndex}`,
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
            rule: "When all partitions are size 0 or 1, every element is in its correct position.",
            reason: `Completed with ${comparisons} comparisons and ${swaps} swaps.`,
            effect: "The array is fully sorted in ascending order.",
        },
        counters: { comparisons, swaps },
        phase: "Complete",
    });

    return steps;
}
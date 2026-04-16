export function generateBubbleSteps(inputArray) {
    const steps = [];
    const arr = [...inputArray];
    const n = arr.length;
    const sortedIndices = new Set();
    let comparisons = 0;
    let swaps = 0;

    // initial state
    steps.push({
        array: [...arr],
        comparing: null,
        swapped: null,
        sortedIndices: new Set(sortedIndices),
        explanation: "Starting Bubble Sort. We will repeatedly compare adjacent elements and swap them if they are in the wrong order.",
        explanationParts: {
            rule: "Bubble Sort repeatedly scans the unsorted portion, comparing adjacent pairs.",
            reason: "Each pass guarantees the largest remaining element bubbles to its final position.",
            effect: "The array is unsorted — scanning begins from the left.",
        },
        counters: { comparisons: 0, swaps: 0 },
        phase: "Start",
        passNumber: 0,
    });

    for (let i = 0; i < n - 1; i++) {
        let swappedInPass = false;

        for (let j = 0; j < n - i - 1; j++) {
            comparisons++;

            const willSwap = arr[j] > arr[j + 1];

            // comparison step (before swap)
            steps.push({
                array: [...arr],
                comparing: [j, j + 1],
                swapped: null,
                sortedIndices: new Set(sortedIndices),
                explanation: willSwap
                    ? `Comparing ${arr[j]} and ${arr[j + 1]}: ${arr[j]} > ${arr[j + 1]}, so we swap them.`
                    : `Comparing ${arr[j]} and ${arr[j + 1]}: ${arr[j]} ≤ ${arr[j + 1]}, no swap needed.`,
                explanationParts: {
                    rule: "Compare the element at position " + j + " with the element at position " + (j + 1) + ".",
                    reason: willSwap
                        ? `${arr[j]} is greater than ${arr[j + 1]}, so they are in the wrong order.`
                        : `${arr[j]} is less than or equal to ${arr[j + 1]}, so they are already in order.`,
                    effect: willSwap
                        ? `Swap ${arr[j]} and ${arr[j + 1]} so the larger value moves right.`
                        : "No swap needed — move to the next pair.",
                },
                counters: { comparisons, swaps },
                phase: `Pass ${i + 1}`,
                passNumber: i + 1,
            });

            if (willSwap) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swaps++;
                swappedInPass = true;

                // step after swap
                steps.push({
                    array: [...arr],
                    comparing: null,
                    swapped: [j, j + 1],
                    sortedIndices: new Set(sortedIndices),
                    explanation: `Swapped: ${arr[j + 1]} and ${arr[j]} — the larger value has moved one position to the right.`,
                    explanationParts: {
                        rule: "After a swap, the larger value is now one step closer to its final sorted position.",
                        reason: `${arr[j + 1]} was greater than ${arr[j]}, so they were exchanged.`,
                        effect: `${arr[j + 1]} moved right; ${arr[j]} moved left. Continue scanning this pass.`,
                    },
                    counters: { comparisons, swaps },
                    phase: `Pass ${i + 1} — swapped`,
                    passNumber: i + 1,
                });
            }
        }

        // end of pass: last element is now sorted
        sortedIndices.add(n - 1 - i);

        steps.push({
            array: [...arr],
            comparing: null,
            swapped: null,
            sortedIndices: new Set(sortedIndices),
            explanation: `End of pass ${i + 1}. Element ${arr[n - 1 - i]} is now in its final sorted position.`,
            explanationParts: {
                rule: "After each full pass, the largest unsorted element has bubbled to its correct position.",
                reason: `During pass ${i + 1}, the largest unsorted value reached index ${n - 1 - i}.`,
                effect: `Position ${n - 1 - i} is now locked. Next pass covers indices 0–${n - i - 2}.`,
            },
            counters: { comparisons, swaps },
            phase: `End of pass ${i + 1}`,
            passNumber: i + 1,
        });

        // early exit if no swaps occurred
        if (!swappedInPass) {
            for (let k = 0; k < n - i - 1; k++) sortedIndices.add(k);
            steps.push({
                array: [...arr],
                comparing: null,
                swapped: null,
                sortedIndices: new Set(sortedIndices),
                explanation: "No swaps occurred in this pass — the array is already sorted! Early exit.",
                explanationParts: {
                    rule: "If a full pass completes with no swaps, the array is sorted — no further passes are needed.",
                    reason: "Every adjacent pair was already in order, confirming the array is sorted.",
                    effect: "Bubble Sort exits early, saving unnecessary comparisons.",
                },
                counters: { comparisons, swaps },
                phase: "Early exit — sorted",
                passNumber: i + 1,
            });
            return steps;
        }
    }

    // mark the first element as sorted
    sortedIndices.add(0);

    steps.push({
        array: [...arr],
        comparing: null,
        swapped: null,
        sortedIndices: new Set(sortedIndices),
        explanation: "Bubble Sort complete! All elements are in ascending order.",
        explanationParts: {
            rule: "When all passes complete, every element has reached its correct position.",
            reason: `Completed ${n - 1} passes with ${comparisons} comparisons and ${swaps} swaps.`,
            effect: "The array is fully sorted in ascending order.",
        },
        counters: { comparisons, swaps },
        phase: "Complete",
        passNumber: n - 1,
    });

    return steps;
}
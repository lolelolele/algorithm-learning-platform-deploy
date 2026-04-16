export function generateHeapSteps(inputArray) {
    const steps = [];
    const arr = [...inputArray];
    const n = arr.length;
    const sortedIndices = new Set();
    let comparisons = 0;
    let swaps = 0;

    steps.push({
        array: [...arr],
        heapSize: n,
        comparing: null,
        swapped: null,
        activeNode: null,
        sortedIndices: new Set(),
        explanation: "Starting Heap Sort. Phase 1: Build a max-heap so the largest element is always at the root (index 0).",
        explanationParts: {
            rule: "Heap Sort has two phases: (1) build a max-heap, (2) repeatedly extract the max and place it at the end.",
            reason: "A max-heap guarantees the largest element is always at the root, ready to be extracted.",
            effect: "We will heapify every internal node from the bottom up to the root.",
        },
        counters: { comparisons, swaps },
        phase: "Start",
    });

    function heapify(heapSize, rootIndex) {
        let largest = rootIndex;
        const left  = 2 * rootIndex + 1;
        const right = 2 * rootIndex + 2;

        steps.push({
            array: [...arr],
            heapSize,
            comparing: left < heapSize ? [rootIndex, left] : null,
            swapped: null,
            activeNode: rootIndex,
            sortedIndices: new Set(sortedIndices),
            explanation: `Heapifying at index ${rootIndex} (value ${arr[rootIndex]}). Checking children at indices ${left} and ${right}.`,
            explanationParts: {
                rule: "Sift-down: compare a node with its children to enforce the max-heap property.",
                reason: `Node ${arr[rootIndex]} at index ${rootIndex} may be smaller than one of its children.`,
                effect: `If a child is larger, swap and continue sifting down.`,
            },
            counters: { comparisons, swaps },
            phase: `Heapify at ${rootIndex}`,
        });

        if (left < heapSize) {
            comparisons++;
            if (arr[left] > arr[largest]) {
                largest = left;
            }

            steps.push({
                array: [...arr],
                heapSize,
                comparing: [rootIndex, left],
                swapped: null,
                activeNode: rootIndex,
                sortedIndices: new Set(sortedIndices),
                explanation: `Comparing ${arr[rootIndex]} (index ${rootIndex}) with left child ${arr[left]} (index ${left}): ${arr[left] > arr[rootIndex] ? `${arr[left]} is larger — left child becomes new largest.` : `${arr[rootIndex]} is larger or equal — no change.`}`,
                explanationParts: {
                    rule: "Compare parent with left child.",
                    reason: `${arr[left]} ${arr[left] > arr[rootIndex] ? ">" : "≤"} ${arr[rootIndex]}.`,
                    effect: arr[left] > arr[rootIndex]
                        ? `Left child ${arr[left]} is now the largest candidate.`
                        : `Parent ${arr[rootIndex]} remains the largest candidate.`,
                },
                counters: { comparisons, swaps },
                phase: `Compare with left child`,
            });
        }

        if (right < heapSize) {
            comparisons++;
            if (arr[right] > arr[largest]) {
                largest = right;
            }

            steps.push({
                array: [...arr],
                heapSize,
                comparing: [largest === right ? rootIndex : largest, right],
                swapped: null,
                activeNode: rootIndex,
                sortedIndices: new Set(sortedIndices),
                explanation: `Comparing current largest ${arr[largest === right ? rootIndex : largest]} with right child ${arr[right]} (index ${right}): ${arr[right] > arr[largest === right ? rootIndex : largest] ? `${arr[right]} is larger — right child becomes new largest.` : `right child is not larger.`}`,
                explanationParts: {
                    rule: "Compare current largest with right child.",
                    reason: `${arr[right]} ${arr[right] > arr[largest === right ? rootIndex : largest] ? ">" : "≤"} current largest.`,
                    effect: arr[right] > arr[largest === right ? rootIndex : largest]
                        ? `Right child ${arr[right]} is now the largest candidate.`
                        : `No change — current largest remains.`,
                },
                counters: { comparisons, swaps },
                phase: `Compare with right child`,
            });
        }

        if (largest !== rootIndex) {
            [arr[largest], arr[rootIndex]] = [arr[rootIndex], arr[largest]];
            swaps++;

            steps.push({
                array: [...arr],
                heapSize,
                comparing: null,
                swapped: [rootIndex, largest],
                activeNode: largest,
                sortedIndices: new Set(sortedIndices),
                explanation: `Swapping ${arr[largest]} (index ${rootIndex}) and ${arr[rootIndex]} (index ${largest}): larger value moves up to parent position.`,
                explanationParts: {
                    rule: "Swap the parent with its largest child to restore the max-heap property.",
                    reason: `The child at index ${largest} was larger than the parent at index ${rootIndex}.`,
                    effect: `${arr[largest]} is now at index ${rootIndex}. Continue sifting down from index ${largest}.`,
                },
                counters: { comparisons, swaps },
                phase: `Swap [${rootIndex}] ↔ [${largest}]`,
            });

            heapify(heapSize, largest);
        } else {
            steps.push({
                array: [...arr],
                heapSize,
                comparing: null,
                swapped: null,
                activeNode: rootIndex,
                sortedIndices: new Set(sortedIndices),
                explanation: `Node ${arr[rootIndex]} at index ${rootIndex} is already the largest among itself and its children — heap property satisfied.`,
                explanationParts: {
                    rule: "If the parent is already the largest, the heap property holds — no swap needed.",
                    reason: `${arr[rootIndex]} ≥ both children in this subtree.`,
                    effect: "Sift-down stops here.",
                },
                counters: { comparisons, swaps },
                phase: `Heap property satisfied`,
            });
        }
    }

    // Phase 1: build max-heap
    const lastInternal = Math.floor(n / 2) - 1;

    steps.push({
        array: [...arr],
        heapSize: n,
        comparing: null,
        swapped: null,
        activeNode: null,
        sortedIndices: new Set(),
        explanation: `Building max-heap. Starting from last internal node at index ${lastInternal}, heapifying up to the root.`,
        explanationParts: {
            rule: "Build the heap bottom-up: heapify each internal node from index ⌊n/2⌋−1 down to 0.",
            reason: "Leaf nodes are trivially valid heaps. Only internal nodes need heapifying.",
            effect: `Nodes ${lastInternal} down to 0 will each be sifted down.`,
        },
        counters: { comparisons, swaps },
        phase: "Build max-heap",
    });

    for (let i = lastInternal; i >= 0; i--) {
        heapify(n, i);
    }

    steps.push({
        array: [...arr],
        heapSize: n,
        comparing: null,
        swapped: null,
        activeNode: null,
        sortedIndices: new Set(),
        explanation: `Max-heap built! Largest element ${arr[0]} is at the root (index 0). Phase 2: extract elements one by one.`,
        explanationParts: {
            rule: "A valid max-heap always has the largest element at the root.",
            reason: "All internal nodes satisfy the max-heap property after Phase 1.",
            effect: `${arr[0]} will be extracted first. Heap size will shrink with each extraction.`,
        },
        counters: { comparisons, swaps },
        phase: "Max-heap built",
    });

    // Phase 2: extract elements
    for (let i = n - 1; i > 0; i--) {
        steps.push({
            array: [...arr],
            heapSize: i + 1,
            comparing: null,
            swapped: null,
            activeNode: 0,
            sortedIndices: new Set(sortedIndices),
            explanation: `Extracting max: swap root ${arr[0]} with last heap element ${arr[i]} at index ${i}, then shrink heap to size ${i}.`,
            explanationParts: {
                rule: "The root is always the maximum — swap it with the last heap element to place it in sorted position.",
                reason: `${arr[0]} is the largest remaining element and belongs at index ${i}.`,
                effect: `${arr[0]} moves to sorted position ${i}. Heap shrinks. Re-heapify from root.`,
            },
            counters: { comparisons, swaps },
            phase: `Extract max`,
        });

        [arr[0], arr[i]] = [arr[i], arr[0]];
        swaps++;
        sortedIndices.add(i);

        steps.push({
            array: [...arr],
            heapSize: i,
            comparing: null,
            swapped: [0, i],
            activeNode: null,
            sortedIndices: new Set(sortedIndices),
            explanation: `Swapped: ${arr[i]} is now at sorted position ${i}. Restoring max-heap for the reduced heap of size ${i}.`,
            explanationParts: {
                rule: "After extraction, the new root may violate the max-heap property — sift it down.",
                reason: `The new root ${arr[0]} may be smaller than its children.`,
                effect: `Heapify root to restore the max-heap for indices 0–${i - 1}.`,
            },
            counters: { comparisons, swaps },
            phase: `Heapify after extraction`,
        });

        heapify(i, 0);
    }

    sortedIndices.add(0);

    steps.push({
        array: [...arr],
        heapSize: 0,
        comparing: null,
        swapped: null,
        activeNode: null,
        sortedIndices: new Set(Array.from({ length: n }, (_, i) => i)),
        explanation: "Heap Sort complete! All elements are in ascending order.",
        explanationParts: {
            rule: "When the heap is reduced to size 1, all elements have been extracted in sorted order.",
            reason: `Completed with ${comparisons} comparisons and ${swaps} swaps.`,
            effect: "The array is fully sorted in ascending order.",
        },
        counters: { comparisons, swaps },
        phase: "Complete",
    });

    return steps;
}
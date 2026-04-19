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
            rule: "Heap Sort has two phases: (1) build a max-heap, (2) repeatedly extract the maximum element.",
            reason: "A max-heap guarantees the largest element is always at the root, making extraction simple and efficient.",
            effect: "We will heapify every internal node starting from the bottom of the tree up to the root.",
        },
        counters: { comparisons, swaps },
        phase: "Start",
    });

    function heapify(heapSize, rootIndex) {
        let largest = rootIndex;
        const left  = 2 * rootIndex + 1;
        const right = 2 * rootIndex + 2;

        const leftExists  = left  < heapSize;
        const rightExists = right < heapSize;

        steps.push({
            array: [...arr],
            heapSize,
            comparing: leftExists ? [rootIndex, left] : null,
            swapped: null,
            activeNode: rootIndex,
            sortedIndices: new Set(sortedIndices),
            explanation: `Checking node ${arr[rootIndex]} at index ${rootIndex}. ${leftExists ? `Left child: ${arr[left]} (index ${left})` : "No left child"}. ${rightExists ? `Right child: ${arr[right]} (index ${right}).` : "No right child."}`,
            explanationParts: {
                rule: "The max-heap property requires every parent to be greater than or equal to its children.",
                reason: `We are checking whether ${arr[rootIndex]} at index ${rootIndex} is the largest among itself and its children. If not, we swap it down.`,
                effect: leftExists || rightExists
                    ? `We will compare ${arr[rootIndex]} with its ${leftExists ? "left" : ""}${leftExists && rightExists ? " and " : ""}${rightExists ? "right" : ""} child${leftExists && rightExists ? "ren" : ""}.`
                    : `${arr[rootIndex]} is a leaf node meaning the heap property is automatically satisfied.`,
            },
            counters: { comparisons, swaps },
            phase: `Heapify at ${rootIndex}`,
        });

        if (leftExists) {
            comparisons++;
            const leftIsLarger = arr[left] > arr[largest];
            if (leftIsLarger) largest = left;

            steps.push({
                array: [...arr],
                heapSize,
                comparing: [rootIndex, left],
                swapped: null,
                activeNode: rootIndex,
                sortedIndices: new Set(sortedIndices),
                explanation: leftIsLarger
                    ? `Left child ${arr[left]} > parent ${arr[rootIndex]}. The left child is currently the largest candidate.`
                    : `Parent ${arr[rootIndex]} ≥ left child ${arr[left]}, the parent remains the largest candidate.`,
                explanationParts: {
                    rule: "Compare the parent with its left child to find the larger value.",
                    reason: leftIsLarger
                        ? `${arr[left]} is greater than ${arr[rootIndex]}, so the left child wins this comparison.`
                        : `${arr[rootIndex]} is greater than or equal to ${arr[left]}, so the parent wins.`,
                    effect: leftIsLarger
                        ? `The left child (${arr[left]}) is now the largest candidate. We still need to check the right child.`
                        : `The parent (${arr[rootIndex]}) remains the largest. We still need to check the right child.`,
                },
                counters: { comparisons, swaps },
                phase: `Compare with left child`,
            });
        }

        if (rightExists) {
            comparisons++;
            const currentLargestVal = arr[largest];
            const rightIsLarger = arr[right] > currentLargestVal;
            if (rightIsLarger) largest = right;

            steps.push({
                array: [...arr],
                heapSize,
                comparing: [largest === right ? rootIndex : largest, right],
                swapped: null,
                activeNode: rootIndex,
                sortedIndices: new Set(sortedIndices),
                explanation: rightIsLarger
                    ? `Right child ${arr[right]} > current largest ${currentLargestVal}, the right child is now the largest candidate.`
                    : `Right child ${arr[right]} ≤ current largest ${currentLargestVal}, the right child is not larger.`,
                explanationParts: {
                    rule: "Compare the current largest candidate with the right child.",
                    reason: rightIsLarger
                        ? `${arr[right]} is greater than the current largest (${currentLargestVal}), so the right child takes over.`
                        : `${arr[right]} is not greater than the current largest (${currentLargestVal}), so nothing changes.`,
                    effect: rightIsLarger
                        ? `The right child (${arr[right]}) is now the largest, it will be swapped with the parent.`
                        : `The current largest (${currentLargestVal}) remains. Now we decide whether a swap is needed.`,
                },
                counters: { comparisons, swaps },
                phase: `Compare with right child`,
            });
        }

        if (largest !== rootIndex) {
            const parentVal = arr[rootIndex];
            const childVal  = arr[largest];
            [arr[largest], arr[rootIndex]] = [arr[rootIndex], arr[largest]];
            swaps++;

            steps.push({
                array: [...arr],
                heapSize,
                comparing: null,
                swapped: [rootIndex, largest],
                activeNode: largest,
                sortedIndices: new Set(sortedIndices),
                explanation: `Swapped ${parentVal} (parent, index ${rootIndex}) with ${childVal} (child, index ${largest}). The larger value moves up.`,
                explanationParts: {
                    rule: "When a child is larger than its parent, swap them to restore the max-heap property.",
                    reason: `${childVal} > ${parentVal}, so ${childVal} must be the parent to satisfy the heap property.`,
                    effect: `${childVal} is now at index ${rootIndex}. We must continue sifting ${parentVal} down from index ${largest} as it may still violate the heap property lower in the tree.`,
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
                explanation: `${arr[rootIndex]} at index ${rootIndex} is already the largest. No swap needed. Heap property is satisfied here.`,
                explanationParts: {
                    rule: "If the parent is already the largest among itself and its children, no swap is needed.",
                    reason: `${arr[rootIndex]} ≥ all children in this subtree, so the max-heap property holds at this node.`,
                    effect: "Sift-down stops here. This subtree is a valid max-heap.",
                },
                counters: { comparisons, swaps },
                phase: `Heap property satisfied`,
            });
        }
    }

    const lastInternal = Math.floor(n / 2) - 1;

    steps.push({
        array: [...arr],
        heapSize: n,
        comparing: null,
        swapped: null,
        activeNode: null,
        sortedIndices: new Set(),
        explanation: `Building max-heap. Starting from the last internal node (index ${lastInternal}, value ${arr[lastInternal]}) and working up to the root.`,
        explanationParts: {
            rule: "Build the heap bottom-up: heapify each internal node from index ⌊n/2⌋−1 down to 0.",
            reason: `Leaf nodes (indices ${lastInternal + 1} to ${n - 1}) are already valid single-element heaps. Only internal nodes need checking.`,
            effect: `We start at index ${lastInternal} and work upward. Each heapify ensures the subtree rooted at that node satisfies the max-heap property.`,
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
        explanation: `Max-heap built. The largest element ${arr[0]} is now at the root (index 0). Starting Phase 2: extract elements one by one.`,
        explanationParts: {
            rule: "A valid max-heap always has the largest element at the root.",
            reason: "Every internal node is now greater than or equal to its children. The max-heap property holds throughout the tree.",
            effect: `Phase 2 begins. We will extract ${arr[0]} from the root and place it in its final sorted position at the end of the array.`,
        },
        counters: { comparisons, swaps },
        phase: "Max-heap built",
    });

    for (let i = n - 1; i > 0; i--) {
        const rootVal = arr[0];
        const lastVal = arr[i];

        steps.push({
            array: [...arr],
            heapSize: i + 1,
            comparing: null,
            swapped: null,
            activeNode: 0,
            sortedIndices: new Set(sortedIndices),
            explanation: `Extracting maximum: ${rootVal} is the root (largest in the heap). Swap it with the last heap element ${lastVal} at index ${i}.`,
            explanationParts: {
                rule: "The root of a max-heap is always the largest element. Extract it by swapping with the last heap element.",
                reason: `${rootVal} is the largest remaining unsorted element. After swapping, it will be placed at index ${i} which is its final sorted position.`,
                effect: `After the swap, the heap shrinks by one (new heap size: ${i}). The new root ${lastVal} likely violates the heap property and must be sifted down.`,
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
            explanation: `${rootVal} is now locked at index ${i} (sorted). ${arr[0]} is the new root. Re-heapifying to restore the max-heap.`,
            explanationParts: {
                rule: "After extraction, sift the new root down to restore the max-heap property.",
                reason: `${arr[0]} was previously the last heap element, it is unlikely to be the largest, so it needs to find its correct position.`,
                effect: `The heap now covers indices 0 to ${i - 1}. Heapify will push ${arr[0]} down until the max-heap property is restored.`,
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
            rule: "When the heap is reduced to size 1, all elements have been extracted and placed in sorted order.",
            reason: `Each extraction placed the current maximum at the end of the unsorted region. After ${n - 1} extractions, the array is fully sorted.`,
            effect: `Completed with ${comparisons} comparisons and ${swaps} swaps. The array is sorted in ascending order.`,
        },
        counters: { comparisons, swaps },
        phase: "Complete",
    });

    return steps;
}
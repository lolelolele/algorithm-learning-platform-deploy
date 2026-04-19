/*
    Heap Sort Challenge Question Generator
    Covers 4 different question types:
    1. Will a swap happen? (at heapify steps)
    2. Which child is larger? (during comparisons)
    3. Which node gets extracted next? (at extract max steps)
    4. After the swap, where does the larger value go? (after swap steps)
*/

export function generateHeapChallengeQuestions(steps) {
    const questions = [];

    steps.forEach((step, index) => {

        // --- Question type 1: Will a swap happen? ---
        // Ask at the "Heap property satisfied" or swap steps
        if (step.phase === "Heap property satisfied" && step.activeNode !== null) {
            const val = step.array[step.activeNode];
            const left  = 2 * step.activeNode + 1;
            const right = 2 * step.activeNode + 2;
            const leftVal  = left  < step.heapSize ? step.array[left]  : null;
            const rightVal = right < step.heapSize ? step.array[right] : null;

            if (leftVal !== null || rightVal !== null) {
                questions.push({
                    stepIndex: index,
                    question: `Node ${val} is at index ${step.activeNode}. Its children are ${leftVal !== null ? leftVal : "none"} (left) and ${rightVal !== null ? rightVal : "none"} (right). Does a swap need to happen?`,
                    options: ["Yes! swap with a child", "No! heap property is already satisfied"],
                    correctIndex: 1,
                    explanation: `${val} is already greater than or equal to both children, so the max-heap property holds here. No swap is needed.`,
                });
            }
            return;
        }

        // --- Question type 2: Which child is larger? ---
        if (step.phase === "Compare with left child" || step.phase === "Compare with right child") {
            if (!step.comparing) return;
            const [i, j] = step.comparing;
            const valI = step.array[i];
            const valJ = step.array[j];

            // only ask when the difference is non-trivial (within 30 of each other)
            if (Math.abs(valI - valJ) > 50) return;

            const parentIndex = Math.min(i, j);
            const childIndex  = Math.max(i, j);
            const parentVal   = step.array[parentIndex];
            const childVal    = step.array[childIndex];
            const swapNeeded  = childVal > parentVal;

            questions.push({
                stepIndex: index,
                question: `Parent is ${parentVal} (index ${parentIndex}), child is ${childVal} (index ${childIndex}). Should they be swapped to maintain the max-heap property?`,
                options: [
                    `Yes — swap ${parentVal} and ${childVal}`,
                    `No — ${parentVal} is already the larger value`,
                ],
                correctIndex: swapNeeded ? 0 : 1,
                explanation: swapNeeded
                    ? `${childVal} > ${parentVal} so the child is larger. They must swap to restore the max-heap property (parent must be ≥ children).`
                    : `${parentVal} ≥ ${childVal} so the parent is already the larger value. The max-heap property holds and no swap is needed.`,
            });
            return;
        }

        // --- Question type 3: Which node gets extracted next? ---
        if (step.phase === "Extract max") {
            const heapArr = step.array.slice(0, step.heapSize);
            if (heapArr.length < 3) return;

            // correct answer is the root (index 0)
            const rootVal = step.array[0];

            // build distractors from other heap nodes
            const distractors = heapArr
                .slice(1)
                .sort((a, b) => b - a)
                .slice(0, 3);

            const options = [rootVal, ...distractors]
                .sort(() => Math.random() - 0.5)
                .slice(0, 4)
                .map(String);

            // ensure root is in options
            if (!options.includes(String(rootVal))) {
                options[0] = String(rootVal);
            }

            const correctIndex = options.indexOf(String(rootVal));
            if (correctIndex === -1) return;

            questions.push({
                stepIndex: index,
                question: `The heap currently has ${step.heapSize} elements. Which value will be extracted next and placed in its sorted position?`,
                options,
                correctIndex,
                explanation: `${rootVal} is at the root (index 0) of the max-heap. The root is always the largest element, so it is always extracted next.`,
            });
            return;
        }

        // --- Question type 4: After extraction, what happens to the new root? ---
        if (step.phase === "Heapify after extraction" && step.swapped) {
            const newRoot = step.array[0];
            const heapSize = step.heapSize;
            if (heapSize < 2) return;

            questions.push({
                stepIndex: index,
                question: `After extraction, ${newRoot} becomes the new root. What must happen next?`,
                options: [
                    `Sift ${newRoot} down until the max-heap property is restored`,
                    `The heap is already valid, no action needed`,
                    `Extract ${newRoot} immediately as it is the next largest`,
                    `Rebuild the entire heap from scratch`,
                ],
                correctIndex: 0,
                explanation: `${newRoot} was previously the last heap element, it is unlikely to be the largest. It must be sifted down by swapping with larger children until the max-heap property is restored throughout the heap.`,
            });
        }
    });

    return questions;
}
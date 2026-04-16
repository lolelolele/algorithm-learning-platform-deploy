export function generateMergeSteps(inputArray) {
    const steps = [];
    const arr = [...inputArray];
    let comparisons = 0;
    let mergeWrites = 0;

    // all nodes built during execution, keyed by id
    const nodeMap = {};
    let nodeCounter = 0;

    function makeNode(array, level, position, parentId = null) {
        const id = `node_${nodeCounter++}`;
        nodeMap[id] = {
            id,
            array: [...array],
            level,
            position,
            state: "idle",
            leftChildId: null,
            rightChildId: null,
            parentId,
        };
        return id;
    }

    // snapshot of all nodes built so far
    function snapshot() {
        return Object.values(nodeMap).map(n => ({ ...n, array: [...n.array] }));
    }

    // root node — step 1: just the full array
    const rootId = makeNode(arr, 0, 0, null);
    nodeMap[rootId].state = "active";

    steps.push({
        nodes: snapshot(),
        activeNodeId: rootId,
        explanation: "Starting Merge Sort. The full array is our starting point. We will recursively split it in half until each piece has one element.",
        explanationParts: {
            rule: "Merge Sort uses divide-and-conquer: split the array in half, sort each half, then merge.",
            reason: "A single-element array is always sorted — that is the base case we are dividing towards.",
            effect: "The full array will be split into two halves in the next step.",
        },
        counters: { comparisons, mergeWrites },
        phase: "Start",
    });

    function mergeSort(nodeId, array, level, leftPos, rightPos) {
        if (array.length <= 1) {
            nodeMap[nodeId].state = "sorted";
            steps.push({
                nodes: snapshot(),
                activeNodeId: nodeId,
                explanation: `Base case reached: [${array.join(", ")}] has one element and is already sorted.`,
                explanationParts: {
                    rule: "A single-element array is always sorted — this is the base case.",
                    reason: `[${array.join(", ")}] cannot be divided further.`,
                    effect: "This element is ready to be merged back up.",
                },
                counters: { comparisons, mergeWrites },
                phase: "Base case",
            });
            return array;
        }

        const mid = Math.floor(array.length / 2);
        const leftArray  = array.slice(0, mid);
        const rightArray = array.slice(mid);

        const midPos = (leftPos + rightPos) / 2;
        const leftChildPos  = (leftPos + midPos) / 2;
        const rightChildPos = (midPos + rightPos) / 2;

        // create child nodes
        const leftId  = makeNode(leftArray,  level + 1, leftChildPos,  nodeId);
        const rightId = makeNode(rightArray, level + 1, rightChildPos, nodeId);

        nodeMap[nodeId].leftChildId  = leftId;
        nodeMap[nodeId].rightChildId = rightId;
        nodeMap[nodeId].state = "idle";
        nodeMap[leftId].state  = "active";
        nodeMap[rightId].state = "active";

        // divide step
        steps.push({
            nodes: snapshot(),
            activeNodeId: nodeId,
            explanation: `Dividing [${array.join(", ")}] into [${leftArray.join(", ")}] and [${rightArray.join(", ")}].`,
            explanationParts: {
                rule: "Split the array at the midpoint to create two smaller sub-problems.",
                reason: `[${array.join(", ")}] has ${array.length} elements — it needs to be divided further.`,
                effect: `Left half: [${leftArray.join(", ")}], Right half: [${rightArray.join(", ")}]. Each will be sorted independently.`,
            },
            counters: { comparisons, mergeWrites },
            phase: `Divide`,
        });

        // recurse
        const sortedLeft  = mergeSort(leftId,  leftArray,  level + 1, leftPos,  midPos);
        const sortedRight = mergeSort(rightId, rightArray, level + 1, midPos, rightPos);

        // merge step
        nodeMap[leftId].state  = "merging";
        nodeMap[rightId].state = "merging";
        nodeMap[nodeId].state  = "active";

        steps.push({
            nodes: snapshot(),
            activeNodeId: nodeId,
            explanation: `Merging [${sortedLeft.join(", ")}] and [${sortedRight.join(", ")}].`,
            explanationParts: {
                rule: "Merge two sorted halves by repeatedly taking the smaller front element.",
                reason: "Both halves are already sorted so we can merge them in one linear scan.",
                effect: `A new sorted array will be built from [${sortedLeft.join(", ")}] and [${sortedRight.join(", ")}].`,
            },
            counters: { comparisons, mergeWrites },
            phase: `Merge`,
        });

        // perform merge
        const merged = [];
        let i = 0, j = 0;

        while (i < sortedLeft.length && j < sortedRight.length) {
            comparisons++;
            if (sortedLeft[i] <= sortedRight[j]) {
                merged.push(sortedLeft[i++]);
            } else {
                merged.push(sortedRight[j++]);
            }
            mergeWrites++;

            steps.push({
                nodes: snapshot(),
                activeNodeId: nodeId,
                explanation: `Comparing ${sortedLeft[i - 1] ?? sortedLeft[i]} and ${sortedRight[j - 1] ?? sortedRight[j]}: placing ${merged[merged.length - 1]} into merged array.`,
                explanationParts: {
                    rule: "Compare the front elements of both halves and take the smaller one.",
                    reason: `${merged[merged.length - 1]} was the smaller of the two front elements.`,
                    effect: `Merged so far: [${merged.join(", ")}].`,
                },
                counters: { comparisons, mergeWrites },
                phase: `Merging`,
            });
        }

        while (i < sortedLeft.length) {
            merged.push(sortedLeft[i++]);
            mergeWrites++;
        }

        while (j < sortedRight.length) {
            merged.push(sortedRight[j++]);
            mergeWrites++;
        }

        // update this node with the merged result
        nodeMap[nodeId].array = [...merged];
        nodeMap[nodeId].state = "sorted";
        nodeMap[leftId].state  = "idle";
        nodeMap[rightId].state = "idle";

        steps.push({
            nodes: snapshot(),
            activeNodeId: nodeId,
            explanation: `Merge complete: [${merged.join(", ")}] is now sorted.`,
            explanationParts: {
                rule: "After merging, the combined array is fully sorted.",
                reason: "Both halves were sorted and we always picked the smaller front element.",
                effect: `[${merged.join(", ")}] is locked and ready to be merged into its parent.`,
            },
            counters: { comparisons, mergeWrites },
            phase: `Merged`,
        });

        return merged;
    }

    mergeSort(rootId, arr, 0, 0, 1);

    steps.push({
        nodes: snapshot(),
        activeNodeId: null,
        explanation: "Merge Sort complete! The array is fully sorted.",
        explanationParts: {
            rule: "When all merges are complete, the root node holds the fully sorted array.",
            reason: `Completed with ${comparisons} comparisons and ${mergeWrites} merge writes.`,
            effect: "The array is sorted in ascending order.",
        },
        counters: { comparisons, mergeWrites },
        phase: "Complete",
    });

    return steps;
}
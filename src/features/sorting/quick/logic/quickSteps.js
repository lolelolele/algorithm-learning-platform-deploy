export function generateQuickSteps(inputArray) {
    const steps = [];
    const arr = [...inputArray];
    let comparisons = 0;
    let swaps = 0;

    const nodeMap = {};
    let nodeCounter = 0;

    function makeNode(array, level, position, type = "partition", parentId = null, pivotValue = null) {
        const id = `node_${nodeCounter++}`;
        nodeMap[id] = {
            id,
            array: [...array],
            pivotValue,
            type,
            level,
            position,
            state: "idle",
            leftChildId:  null,
            midChildId:   null,
            rightChildId: null,
            parentId,
            leftLabel:  null,
            rightLabel: null,
        };
        return id;
    }

    function snapshot() {
        return Object.values(nodeMap).map(n => ({ ...n, array: [...n.array] }));
    }

    // root node
    const rootId = makeNode(arr, 0, 0.5, "partition", null, null);
    nodeMap[rootId].state = "active";

    steps.push({
        nodes: snapshot(),
        activeNodeId: rootId,
        explanation: "Starting Quick Sort. The full array is our starting point. We will pick a pivot and partition the array around it.",
        explanationParts: {
            rule: "Quick Sort selects a pivot element and partitions the array so all smaller elements are on the left and all larger are on the right.",
            reason: "The pivot will end up in its exact final sorted position after each partition step.",
            effect: "The last element will be selected as the pivot using the Lomuto partition scheme.",
        },
        counters: { comparisons, swaps },
        phase: "Start",
    });

    function quickSort(nodeId, array, level, leftPos, rightPos) {
        if (array.length === 0) return;

        if (array.length === 1) {
            nodeMap[nodeId].state = "sorted";
            nodeMap[nodeId].type  = "sorted";
            steps.push({
                nodes: snapshot(),
                activeNodeId: nodeId,
                explanation: `[${array[0]}] is a single element — already sorted and in its final position.`,
                explanationParts: {
                    rule: "A single element array is already sorted — this is the base case.",
                    reason: `[${array[0]}] cannot be divided further.`,
                    effect: `${array[0]} is locked in its final sorted position.`,
                },
                counters: { comparisons, swaps },
                phase: "Base case",
            });
            return;
        }

        // select pivot — last element (Lomuto)
        const pivotValue = array[array.length - 1];
        const pivotIndex = array.length - 1;

        nodeMap[nodeId].pivotValue = pivotValue;
        nodeMap[nodeId].state      = "active";

        steps.push({
            nodes: snapshot(),
            activeNodeId: nodeId,
            explanation: `Selecting pivot: ${pivotValue} (last element at index ${pivotIndex} of this partition).`,
            explanationParts: {
                rule: "Lomuto partition scheme always picks the last element as the pivot.",
                reason: `The last element of [${array.join(", ")}] is ${pivotValue}.`,
                effect: `${pivotValue} will be placed in its final sorted position. Elements ≤ ${pivotValue} go left, elements > ${pivotValue} go right.`,
            },
            counters: { comparisons, swaps },
            phase: `Select pivot`,
        });

        // partition into left and right
        const leftArray  = [];
        const rightArray = [];

        for (let i = 0; i < array.length - 1; i++) {
            comparisons++;
            if (array[i] <= pivotValue) {
                leftArray.push(array[i]);
            } else {
                rightArray.push(array[i]);
            }
        }

        swaps++;

        steps.push({
            nodes: snapshot(),
            activeNodeId: nodeId,
            explanation: `Partitioning around pivot ${pivotValue}: left [${leftArray.join(", ") || "empty"}] | pivot [${pivotValue}] | right [${rightArray.join(", ") || "empty"}].`,
            explanationParts: {
                rule: "Scan all elements except the pivot and place them into left (≤ pivot) or right (> pivot) groups.",
                reason: `Elements ≤ ${pivotValue}: [${leftArray.join(", ") || "none"}]. Elements > ${pivotValue}: [${rightArray.join(", ") || "none"}].`,
                effect: `${pivotValue} is now in its final sorted position. Recursively sort left and right groups.`,
            },
            counters: { comparisons, swaps },
            phase: `Partition`,
        });

        // calculate positions for children
        const midPos   = (leftPos + rightPos) / 2;
        const leftSpan  = midPos - leftPos;
        const rightSpan = rightPos - midPos;

        const leftChildPos  = leftArray.length  > 0 ? leftPos  + leftSpan  * 0.3 : leftPos;
        const rightChildPos = rightArray.length > 0 ? rightPos - rightSpan * 0.3 : rightPos;
        const pivotChildPos = midPos;

        // create pivot node (always)
        const pivotNodeId = makeNode([pivotValue], level + 1, pivotChildPos, "pivot", nodeId, pivotValue);
        nodeMap[pivotNodeId].state = "sorted";
        nodeMap[nodeId].midChildId = pivotNodeId;
        nodeMap[nodeId].leftLabel  = leftArray.length  > 0 ? `≤ ${pivotValue}` : null;
        nodeMap[nodeId].rightLabel = rightArray.length > 0 ? `> ${pivotValue}`  : null;

        // create left child node if needed
        let leftId = null;
        if (leftArray.length > 0) {
            leftId = makeNode(leftArray, level + 1, leftChildPos, "partition", nodeId);
            nodeMap[leftId].state = "active";
            nodeMap[nodeId].leftChildId = leftId;
        }

        // create right child node if needed
        let rightId = null;
        if (rightArray.length > 0) {
            rightId = makeNode(rightArray, level + 1, rightChildPos, "partition", nodeId);
            nodeMap[rightId].state = "active";
            nodeMap[nodeId].rightChildId = rightId;
        }

        nodeMap[nodeId].state = "idle";

        steps.push({
            nodes: snapshot(),
            activeNodeId: pivotNodeId,
            explanation: `Pivot ${pivotValue} is placed in its final position. Left group: [${leftArray.join(", ") || "empty"}], Right group: [${rightArray.join(", ") || "empty"}].`,
            explanationParts: {
                rule: "After partitioning, the pivot is in its correct sorted position.",
                reason: `All elements to the left are ≤ ${pivotValue} and all to the right are > ${pivotValue}.`,
                effect: `Recursively applying Quick Sort to left [${leftArray.join(", ") || "empty"}] and right [${rightArray.join(", ") || "empty"}].`,
            },
            counters: { comparisons, swaps },
            phase: `Pivot placed`,
        });

        // recurse on left
        if (leftId !== null) {
            quickSort(leftId, leftArray, level + 1, leftPos, midPos);
        }

        // recurse on right
        if (rightId !== null) {
            quickSort(rightId, rightArray, level + 1, midPos, rightPos);
        }
    }

    quickSort(rootId, arr, 0, 0.05, 0.95);

    // mark everything sorted
    Object.values(nodeMap).forEach(n => {
        n.state = "sorted";
    });

    steps.push({
        nodes: snapshot(),
        activeNodeId: null,
        explanation: "Quick Sort complete! All elements are in their final sorted positions.",
        explanationParts: {
            rule: "When all partitions are size 1 or empty, every element is in its correct final position.",
            reason: `Completed with ${comparisons} comparisons and ${swaps} partition operations.`,
            effect: "The array is fully sorted in ascending order.",
        },
        counters: { comparisons, swaps },
        phase: "Complete",
    });

    return steps;
}
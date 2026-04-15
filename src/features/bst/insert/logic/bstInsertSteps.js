import { flattenTree, insertNode } from "../../trees.js";

export function generateBSTInsertSteps(root, value) {
    const steps = [];

    /* deep clone so we don't mutate the original tree */
    function cloneTree(node) {
        if (!node) return null;
        return {
            value: node.value,
            left: cloneTree(node.left),
            right: cloneTree(node.right),
        };
    }

    const workingRoot = cloneTree(root);
    const visited = [];

    /* initial state */
    steps.push({
        treeSnapshot: flattenTree(workingRoot),
        currentNode: null,
        visitedNodes: [],
        foundNode: null,
        highlightNodes: [],
        explanation: `Inserting value ${value}. Starting at the root.`,
        whyThisStep: `BST insertion begins at the root and traverses down to find the correct position for the new value.`,
    });

    /* if tree is empty */
    if (!workingRoot) {
        const newRoot = insertNode(null, value);
        steps.push({
            treeSnapshot: flattenTree(newRoot),
            currentNode: null,
            visitedNodes: [],
            foundNode: flattenTree(newRoot)[0]?.id ?? null,
            highlightNodes: [],
            explanation: `Tree was empty. ${value} is now the root.`,
            whyThisStep: `When a tree is empty, the new value becomes the root node.`,
        });
        return steps;
    }

    let current = workingRoot;

    while (current !== null) {
        const flatTree = flattenTree(workingRoot);
        const currentId = flatTree.find(n => n.value === current.value && !visited.includes(n.id))?.id
            ?? flatTree.find(n => n.value === current.value)?.id;

        visited.push(currentId);

        if (value === current.value) {
            /* duplicate — BST does not allow duplicates */
            steps.push({
                treeSnapshot: flattenTree(workingRoot),
                currentNode: currentId,
                visitedNodes: [...visited],
                foundNode: null,
                highlightNodes: [],
                explanation: `${value} already exists in the tree. Duplicates are not allowed in a BST.`,
                whyThisStep: `A BST does not store duplicate values. The insertion is rejected.`,
            });
            return steps;
        }

        if (value < current.value) {
            steps.push({
                treeSnapshot: flattenTree(workingRoot),
                currentNode: currentId,
                visitedNodes: [...visited],
                foundNode: null,
                highlightNodes: [],
                explanation: `${value} < ${current.value} — go left.`,
                whyThisStep: `${value} is less than ${current.value} so it belongs in the left subtree. We move left to find the correct position.`,
            });

            if (current.left === null) {
                /* insert here */
                current.left = { value, left: null, right: null };
                const newFlat = flattenTree(workingRoot);
                const newNodeId = newFlat.find(n => n.value === value)?.id;
                steps.push({
                    treeSnapshot: newFlat,
                    currentNode: null,
                    visitedNodes: [...visited],
                    foundNode: newNodeId,
                    highlightNodes: [],
                    explanation: `Inserted ${value} as the left child of ${current.value}.`,
                    whyThisStep: `The left child position is empty, so ${value} is placed here. The BST property is maintained because ${value} < ${current.value}.`,
                });
                return steps;
            }
            current = current.left;
        } else {
            steps.push({
                treeSnapshot: flattenTree(workingRoot),
                currentNode: currentId,
                visitedNodes: [...visited],
                foundNode: null,
                highlightNodes: [],
                explanation: `${value} > ${current.value} — go right.`,
                whyThisStep: `${value} is greater than ${current.value} so it belongs in the right subtree. We move right to find the correct position.`,
            });

            if (current.right === null) {
                /* insert here */
                current.right = { value, left: null, right: null };
                const newFlat = flattenTree(workingRoot);
                const newNodeId = newFlat.find(n => n.value === value)?.id;
                steps.push({
                    treeSnapshot: newFlat,
                    currentNode: null,
                    visitedNodes: [...visited],
                    foundNode: newNodeId,
                    highlightNodes: [],
                    explanation: `Inserted ${value} as the right child of ${current.value}.`,
                    whyThisStep: `The right child position is empty, so ${value} is placed here. The BST property is maintained because ${value} > ${current.value}.`,
                });
                return steps;
            }
            current = current.right;
        }
    }

    return steps;
}
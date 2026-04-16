/* Generates step-by-step BST search execution trace.
   At each step we compare the target value to the current node
   and go left or right accordingly. */

   import { flattenTree } from "../../data/trees.js";

export function generateBSTSearchSteps(root, target) {
    const steps = [];

    if (!root) {
        steps.push({
            treeSnapshot: [],
            currentNode: null,
            visitedNodes: [],
            foundNode: null,
            explanation: "Tree is empty. Nothing to search.",
            whyThisStep: "An empty tree has no nodes to compare against.",
        });
        return steps;
    }

    const visited = [];

    /* initial state */
    steps.push({
        treeSnapshot: flattenTree(root),
        currentNode: null,
        visitedNodes: [],
        foundNode: null,
        explanation: `Searching for value ${target}. Starting at the root.`,
        whyThisStep: `BST search always starts at the root. We compare the target value to the current node and move left if smaller, right if larger.`,
    });

    let current = root;

    while (current !== null) {
        const flatTree = flattenTree(root);
        const currentId = flatTree.find(n => n.value === current.value && !visited.includes(n.id))?.id
            ?? flatTree.find(n => n.value === current.value)?.id;

        visited.push(currentId);

        if (current.value === target) {
            /* found */
            steps.push({
                treeSnapshot: flattenTree(root),
                currentNode: currentId,
                visitedNodes: [...visited],
                foundNode: currentId,
                explanation: `Found ${target} at this node.`,
                whyThisStep: `The current node's value matches the target. BST search is complete.`,
            });
            return steps;
        }

        if (target < current.value) {
            steps.push({
                treeSnapshot: flattenTree(root),
                currentNode: currentId,
                visitedNodes: [...visited],
                foundNode: null,
                explanation: `${target} < ${current.value} — go left.`,
                whyThisStep: `In a BST, all values smaller than the current node are in the left subtree. Since ${target} < ${current.value}, we move left.`,
            });
            current = current.left;
        } else {
            steps.push({
                treeSnapshot: flattenTree(root),
                currentNode: currentId,
                visitedNodes: [...visited],
                foundNode: null,
                explanation: `${target} > ${current.value} — go right.`,
                whyThisStep: `In a BST, all values larger than the current node are in the right subtree. Since ${target} > ${current.value}, we move right.`,
            });
            current = current.right;
        }
    }

    /* not found */
    steps.push({
        treeSnapshot: flattenTree(root),
        currentNode: null,
        visitedNodes: [...visited],
        foundNode: null,
        explanation: `${target} not found in the tree.`,
        whyThisStep: `We reached a null position where the value should be, but it isn't there. The value does not exist in this BST.`,
    });

    return steps;
}
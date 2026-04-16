/* Generates step-by-step BST deletion execution trace.
   Handles all three deletion cases:
   1. Leaf node (no children)
   2. One child
   3. Two children (replace with in-order successor) */

   import { flattenTree } from "../../data/trees.js";

/* finds the in-order successor (smallest value in right subtree) */
function findMinNode(node) {
    let current = node;
    while (current.left !== null) {
        current = current.left;
    }
    return current;
}

/* deep clone tree */
function cloneTree(node) {
    if (!node) return null;
    return {
        value: node.value,
        left: cloneTree(node.left),
        right: cloneTree(node.right),
    };
}

export function generateBSTDeleteSteps(root, target) {
    const steps = [];

    if (!root) {
        steps.push({
            treeSnapshot: [],
            currentNode: null,
            visitedNodes: [],
            foundNode: null,
            deletedNode: null,
            highlightNodes: [],
            explanation: "Tree is empty. Nothing to delete.",
            whyThisStep: "An empty tree has no nodes to delete.",
        });
        return steps;
    }

    const workingRoot = cloneTree(root);
    const visited = [];

    /* initial step */
    steps.push({
        treeSnapshot: flattenTree(workingRoot),
        currentNode: null,
        visitedNodes: [],
        foundNode: null,
        deletedNode: null,
        highlightNodes: [],
        explanation: `Searching for ${target} to delete. Starting at the root.`,
        whyThisStep: `Deletion starts by finding the node. We traverse the tree the same way as search.`,
    });

    /* search phase */
    function deleteNode(node, value, steps, visited) {
        if (node === null) {
            steps.push({
                treeSnapshot: flattenTree(workingRoot),
                currentNode: null,
                visitedNodes: [...visited],
                foundNode: null,
                deletedNode: null,
                highlightNodes: [],
                explanation: `${value} not found in the tree.`,
                whyThisStep: `We reached a null position. The value does not exist in this BST.`,
            });
            return null;
        }

        const flatTree = flattenTree(workingRoot);
        const currentId = flatTree.find(n => n.value === node.value && !visited.includes(n.id))?.id
            ?? flatTree.find(n => n.value === node.value)?.id;

        if (value < node.value) {
            visited.push(currentId);
            steps.push({
                treeSnapshot: flattenTree(workingRoot),
                currentNode: currentId,
                visitedNodes: [...visited],
                foundNode: null,
                deletedNode: null,
                highlightNodes: [],
                explanation: `${value} < ${node.value} — go left.`,
                whyThisStep: `${value} is less than ${node.value}, so it must be in the left subtree.`,
            });
            node.left = deleteNode(node.left, value, steps, visited);
            return node;
        }

        if (value > node.value) {
            visited.push(currentId);
            steps.push({
                treeSnapshot: flattenTree(workingRoot),
                currentNode: currentId,
                visitedNodes: [...visited],
                foundNode: null,
                deletedNode: null,
                highlightNodes: [],
                explanation: `${value} > ${node.value} — go right.`,
                whyThisStep: `${value} is greater than ${node.value}, so it must be in the right subtree.`,
            });
            node.right = deleteNode(node.right, value, steps, visited);
            return node;
        }

        /* found the node to delete */
        visited.push(currentId);

        /* case 1: leaf node */
        if (node.left === null && node.right === null) {
            steps.push({
                treeSnapshot: flattenTree(workingRoot),
                currentNode: currentId,
                visitedNodes: [...visited],
                foundNode: currentId,
                deletedNode: currentId,
                highlightNodes: [],
                explanation: `Found ${value}. It is a leaf node — simply remove it.`,
                whyThisStep: `Case 1: The node has no children. We can safely remove it without affecting any other nodes.`,
            });
            return null;
        }

        /* case 2: one child */
        if (node.left === null) {
            steps.push({
                treeSnapshot: flattenTree(workingRoot),
                currentNode: currentId,
                visitedNodes: [...visited],
                foundNode: currentId,
                deletedNode: currentId,
                highlightNodes: [],
                explanation: `Found ${value}. It has only a right child — replace it with its right child.`,
                whyThisStep: `Case 2: The node has one child. We replace the node with its only child, preserving the BST structure.`,
            });
            return node.right;
        }

        if (node.right === null) {
            steps.push({
                treeSnapshot: flattenTree(workingRoot),
                currentNode: currentId,
                visitedNodes: [...visited],
                foundNode: currentId,
                deletedNode: currentId,
                highlightNodes: [],
                explanation: `Found ${value}. It has only a left child — replace it with its left child.`,
                whyThisStep: `Case 2: The node has one child. We replace the node with its only child, preserving the BST structure.`,
            });
            return node.left;
        }

        /* case 3: two children — find in-order successor */
        const successor = findMinNode(node.right);
        const flatTree2 = flattenTree(workingRoot);
        const successorId = flatTree2.find(n => n.value === successor.value)?.id;

        steps.push({
            treeSnapshot: flattenTree(workingRoot),
            currentNode: currentId,
            visitedNodes: [...visited],
            foundNode: currentId,
            deletedNode: currentId,
            highlightNodes: [successorId],
            explanation: `Found ${value}. It has two children. In-order successor is ${successor.value}.`,
            whyThisStep: `Case 3: The node has two children. We find the in-order successor — the smallest value in the right subtree. We replace the deleted node's value with the successor's value, then delete the successor.`,
        });

        /* replace value with successor */
        node.value = successor.value;

        steps.push({
            treeSnapshot: flattenTree(workingRoot),
            currentNode: null,
            visitedNodes: [...visited],
            foundNode: null,
            deletedNode: null,
            highlightNodes: [successorId],
            explanation: `Replaced ${value} with successor ${successor.value}. Now deleting ${successor.value} from right subtree.`,
            whyThisStep: `The node's value is replaced with the successor. Now we delete the successor from the right subtree — it has at most one child so it is easy to remove.`,
        });

        node.right = deleteNode(node.right, successor.value, steps, visited);
        return node;
    }

    deleteNode(workingRoot, target, steps, visited);

    /* final state */
    steps.push({
        treeSnapshot: flattenTree(workingRoot),
        currentNode: null,
        visitedNodes: [],
        foundNode: null,
        deletedNode: null,
        highlightNodes: [],
        explanation: `Deletion of ${target} complete.`,
        whyThisStep: `The BST property is maintained after deletion. All values in the left subtree are smaller than their parent, and all values in the right subtree are larger.`,
    });

    return steps;
}
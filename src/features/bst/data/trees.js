/* builds a BST node */
export function createNode(value) {
    return { value, left: null, right: null };
}

/* inserts a value into a BST and returns the root */
export function insertNode(root, value) {
    if (root === null) return createNode(value);
    if (value < root.value) {
        root.left = insertNode(root.left, value);
    } else if (value > root.value) {
        root.right = insertNode(root.right, value);
    }
    return root;
}

/* builds a BST from an array of values */
export function buildBST(values) {
    let root = null;
    values.forEach(v => { root = insertNode(root, v); });
    return root;
}

/* parses a comma-separated string of numbers into a BST
   returns null if input is invalid */
export function buildBSTFromString(input) {
    const parts = input.split(",").map(s => s.trim()).filter(s => s !== "");
    const values = parts.map(Number);
    if (values.some(isNaN)) return null;
    if (values.length === 0) return null;
    return buildBST(values);
}

export function flattenTree(root) {
    if (!root) return [];

    const nodes = [];
    let counter = 0;

    /* first pass: assign in-order index to each node for x positioning */
    function assignIndex(node) {
        if (!node) return;
        assignIndex(node.left);
        node._index = counter++;
        assignIndex(node.right);
    }

    assignIndex(root);

    const totalNodes = counter;
    const spacingX = 70;
    const svgWidth = 900;

    const treeWidth = (totalNodes - 1) * spacingX;

    const startX = (svgWidth - treeWidth) / 2

    /* second pass: build flat array with positions */
    function buildFlat(node, depth, parentId) {
        if (!node) return;

        const id = `${node.value}-${depth}-${node._index}`;
        const x = startX + node._index * spacingX;
        const y = 50 + depth * 80;

        nodes.push({ id, value: node.value, x, y, parentId, depth });

        buildFlat(node.left, depth + 1, id);
        buildFlat(node.right, depth + 1, id);
    }
    
    buildFlat(root, 0, null);
    return nodes;
}

/* preset trees */
export const presetTrees = [
    {
        id: "balanced-small",
        name: "Balanced (Small)",
        values: [5, 3, 7, 1, 4, 6, 8],
    },
    {
        id: "balanced-medium",
        name: "Balanced (Medium)",
        values: [10, 5, 15, 3, 7, 12, 18, 1, 4, 6, 9],
    },
    {
        id: "left-skewed",
        name: "Left Skewed",
        values: [9, 7, 5, 3, 1],
    },
    {
        id: "right-skewed",
        name: "Right Skewed",
        values: [1, 3, 5, 7, 9],
    },
    {
        id: "mixed",
        name: "Mixed",
        values: [8, 3, 10, 1, 6, 14, 4, 7, 13],
    },
];

/* default tree used on page load */
export const defaultValues = [5, 3, 7, 1, 4, 6, 8];
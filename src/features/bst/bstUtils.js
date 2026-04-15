/* builds a BST node */
function makeNode(value, id, parentId = null) {
    return { id, value, parentId, leftId: null, rightId: null };
}

/* inserts a value into the tree and returns the updated node list */
export function insertValue(nodes, value) {
    const newId = Date.now() + Math.random();
    const newNode = makeNode(value, newId, null);

    if (nodes.length === 0) {
        return [...nodes, newNode];
    }

    const updated = nodes.map(n => ({ ...n }));
    let current = updated.find(n => n.parentId === null);

    while (current) {
        if (value < current.value) {
            if (current.leftId === null) {
                newNode.parentId = current.id;
                current.leftId = newId;
                break;
            }
            current = updated.find(n => n.id === current.leftId);
        } else {
            if (current.rightId === null) {
                newNode.parentId = current.id;
                current.rightId = newId;
                break;
            }
            current = updated.find(n => n.id === current.rightId);
        }
    }

    return [...updated, newNode];
}

/* builds a full BST from an array of values */
export function buildTree(values) {
    let nodes = [];
    values.forEach(v => {
        nodes = insertValue(nodes, v);
    });
    return assignPositions(nodes);
}

/* calculates x/y positions for each node using in-order traversal
   so the tree renders correctly with no overlapping nodes */
export function assignPositions(nodes) {
    if (nodes.length === 0) return [];

    const root = nodes.find(n => n.parentId === null);
    if (!root) return nodes;

    const positioned = nodes.map(n => ({ ...n }));
    const canvasWidth = 860;
    const startY = 50;
    const levelHeight = 80;

    /* assigns x positions using in-order traversal */
    let inOrderIndex = 0;
    const xPositions = {};

    function inOrder(nodeId) {
        if (nodeId === null) return;
        const node = positioned.find(n => n.id === nodeId);
        if (!node) return;
        inOrder(node.leftId);
        xPositions[nodeId] = inOrderIndex++;
        inOrder(node.rightId);
    }

    inOrder(root.id);

    const totalNodes = Object.keys(xPositions).length;
    const spacing = canvasWidth / (totalNodes + 1);

    /* assigns y positions based on depth */
    const depths = {};
    function assignDepth(nodeId, depth) {
        if (nodeId === null) return;
        const node = positioned.find(n => n.id === nodeId);
        if (!node) return;
        depths[nodeId] = depth;
        assignDepth(node.leftId, depth + 1);
        assignDepth(node.rightId, depth + 1);
    }
    assignDepth(root.id, 0);

    return positioned.map(n => ({
        ...n,
        x: (xPositions[n.id] + 1) * spacing,
        y: startY + depths[n.id] * levelHeight,
    }));
}
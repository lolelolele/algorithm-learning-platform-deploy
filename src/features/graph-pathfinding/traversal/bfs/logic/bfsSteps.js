// Generates step-by-step BFS traversal for rendering visualisation
export function generateBFSSteps(graph, startId) {
    const steps = []

    // build an adjacency list from the edge list
    const adjacency = {};
    graph.nodes.forEach(n => {
        adjacency[n.id] = [];
    });
    graph.edges.forEach(e => {
        adjacency[e.from].push(e.to);
        adjacency[e.to].push(e.from);
    });

    /* Set up BFS structures:
        - visited nodes
        - queue (FIFO)
        - visit order
    */
    const enqueued = new Set();
    const visited = new Set();
    const queue = [startId];
    const visitedOrder = [];
    enqueued.add(startId);

    //initial state before traversal begins
    steps.push({
        visitedNodes: new Set(),
        currentNode: null,
        queue: [startId],
        visitedOrder: [],
        highlightEdges: new Set(),
        explanation: `Starting BFS from node ${startId}. Initialising queue with the start node.`,
        whyThisStep: `BFS always begins by placing the start node in the queue and marking it as visited so we don't revisit it.`,
        operationCount: 0,
    });

    let operationCount = 0;

    // process nodes in FIFO order until queue is emptry
    while (queue.length > 0) {

        //remove the first node from the queue
        const current = queue.shift();

        visited.add(current);
        visitedOrder.push(current);
        operationCount++;

        //get neighbours of the current node
        const neighbours = adjacency[current];
        const newHighlightEdges = new Set();

        //explore each neighbour of the current node
        neighbours.forEach(neighbour => {
            //find the edge id for highlighting 
            const edge = graph.edges.find(
                e => (e.from === current && e.to === neighbour) ||
                (e.to === current && e.from === neighbour)
            );
            if (edge) newHighlightEdges.add(edge.id);

            //if neighbour not enqueued, mark and add to queue
            if (!enqueued.has(neighbour)) {
                enqueued.add(neighbour);
                queue.push(neighbour);
            }
        });
        
        // record current BFS state for visualisation
        steps.push({
            visitedNodes: new Set(visited),
            currentNode: current,
            queue: [...queue],
            visitedOrder: [...visitedOrder],
            highlightEdges: newHighlightEdges,
            explanation: queue.length > 0
                ? `Visiting node ${current}. Exploring its neighbours. Queue: [${queue.join(", ")}]`
                : `Visiting node ${current}. Queue is now empty – BFS complete.`,
            whyThisStep: `Node ${current} was dequeued because it was added to the queue first (FIFO). BFS explores nodes layer by layer, guaranteeing the shortest path in an unweighted graph.`,
            operationCount,
        });
    }

    //return all BFS steps
    return steps;
}
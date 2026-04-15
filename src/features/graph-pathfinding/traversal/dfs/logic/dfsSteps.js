// Generates step-by-step DFS traversal for rendering visualisation
export function generateDFSSteps(graph, startId) {
    const steps = []

    // build an adjacency list from the edge list
    const adjacency = {};
    graph.nodes.forEach(n => {
        adjacency[n.id] = [];
    });
    graph.edges.forEach(e => {
        adjacency[e.from].push(e.to);
        adjacency[e.to].push(e.from);  //undirected graph
    });

    /* Set up DFS structures:
        pushed: tracks nodes already added to the stack (prevents duplicates)
        visited: tracks nodes already processed
    */
    const pushed = new Set();
    const visited = new Set();
    const stack = [startId];
    const visitedOrder = [];
    pushed.add(startId);

    //initial state before traversal begins
    steps.push({
        visitedNodes: new Set(),
        currentNode: null,
        stack: [startId],
        visitedOrder: [],
        highlightEdges: new Set(),
        explanation: `Starting DFS from node ${startId}. Adding it to the stack.`,
        whyThisStep: `DFS begins by pushing the start node onto the stack. Unlike BFS which uses a queue, DFS uses a stack so the most recently discovered node is explored first.`,
        operationCount: 0,
    });

    let operationCount = 0;

    while (stack.length > 0) {

        // Remove the top node (LIFO behaviour)
        const current = stack.pop();

        //Skip if already visited (can happen in undirected graphs)
        if (visited.has(current)) continue;

        visited.add(current);
        visitedOrder.push(current);
        operationCount++;

        //get neighbours of the current node
        const neighbours = adjacency[current];
        const newHighlightEdges = new Set();

        /* 
            Push unvisited neighbours onto the stack.
            Reverse order ensures left-to-right traversal in the visualisation.
        */
        const unvisitedNeighbours = neighbours.filter(n => !pushed.has(n));
        [...unvisitedNeighbours].reverse().forEach(neighbour => {
            const edge = graph.edges.find(
                e => (e.from === current && e.to === neighbour) ||
                     (e.to === current && e.from === neighbour)
            );
            if (edge) newHighlightEdges.add(edge.id);

            pushed.add(neighbour);
            stack.push(neighbour);
        });

        // Highlight edges to already visited nodes to visualise backtracking
        neighbours.filter(n => visited.has(n)).forEach(neighbour => {
            const edge = graph.edges.find(
                e => (e.from === current && e.to === neighbour) ||
                     (e.to === current && e.from === neighbour)
            );
            if (edge) newHighlightEdges.add(edge.id);
        });
        
        // record current DFS state for visualisation
        steps.push({
            visitedNodes: new Set(visited),
            currentNode: current,
            stack: [...stack],
            visitedOrder: [...visitedOrder],
            highlightEdges: newHighlightEdges,
            explanation: stack.length > 0
                ? `Visiting node ${current}. Exploring its neighbours. Stack: [${stack.join(", ")}]`
                : `Visiting node ${current}. Stack is now empty — DFS complete.`,
            whyThisStep: `Node ${current} was popped from the top of the stack (LIFO). DFS goes as deep as possible along each branch before backtracking, which is why it explores one full path before trying another.`,
            operationCount,
        });
    }

    //return all DFS steps
    return steps;
}
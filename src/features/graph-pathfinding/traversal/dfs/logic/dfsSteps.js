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
        const isComplete = stack.length === 0;
        const newlyPushed = unvisitedNeighbours.filter(n => stack.includes(n));

        steps.push({
            visitedNodes: new Set(visited),
            currentNode: isComplete ? null : current,
            stack: [...stack],
            visitedOrder: [...visitedOrder],
            highlightEdges: newHighlightEdges,
            explanation: isComplete
                ? `Node ${current} visited. Stack is now empty, DFS complete. All reachable nodes have been visited.`
                : `Visiting node ${current}. Exploring its neighbours. Stack: [${stack.join(", ")}]`,
            whyThisStep: isComplete
                ? `DFS is complete. Every reachable node has been visited by always going as deep as possible before backtracking. The full visited order was: ${visitedOrder.join(" → ")}.`
                : `${current} was at the top of the stack. DFS always pops the most recently added node (LIFO). ${newlyPushed.length > 0 ? `Its unvisited neighbours (${newlyPushed.join(", ")}) have been pushed onto the stack and will be explored next.` : "All of its neighbours have already been visited or are already on the stack."}`,
            operationCount,
        });
    }

    //return all DFS steps
    return steps;
}
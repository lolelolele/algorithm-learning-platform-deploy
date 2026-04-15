/* reconstructs the shortest path as a list of node ids by following the prev pointers */
function reconstructPathNodes(prev, startId, endId) {
    /* return empty path if the end is unreachable */
    if (endId !== startId && prev[endId] == null) return [];

    const path = [];
    let current = endId;

    /* walk backwards from end to start using previous pointers */
    while (current != null) {
        path.push(current);
        if (current === startId) break;
        current = prev[current];
    }

    /* if we never reached the start it is unreachable */
    if (path[path.length - 1] !== startId) return [];

    return path.reverse();
}

/* converts a path expressed as nodes into a list of edge ids for highlighting */
/* assumes undirected edges */
function pathNodesToEdgeIds(pathNodes, edges) {
    const edgeIds = [];

    for (let i = 0; i < pathNodes.length - 1; i++) {
        const a = pathNodes[i];
        const b = pathNodes[i + 1];

        /* locate the matching edge for this node pair */
        const e = edges.find(
            (edge) =>
                (edge.from === a && edge.to === b) || (edge.from === b && edge.to === a)
        );

        if (e) edgeIds.push(e.id);
    }
    return edgeIds;
}

/* formats a readable frontier string for UI display (id(dist), id(dist)...) */
function formatFrontier(pq) {
    if (!pq || pq.length === 0) return "∅";
    
    const copy = [...pq].sort((a, b) => a.dist - b.dist);
    return copy.map((n) => `${n.id}(${n.dist})`).join(", ");
}

/* produces a stable snapshot of the queue for the metrics panel */
function snapshotPQ(pq) {
    return[...pq]
        .sort((a, b) => a.dist - b.dist)
        .map((x) => ({ id: x.id, dist:x.dist }));
}

/* generates a full step-by-step trace of dijkstra's algorithm for visual playback */
export function generateDijkstraSteps(graph, startId, endId) {
    const steps = [];

    /* extract node ids and edges from the graph model */
    const nodes = graph.nodes.map((n) => n.id);
    const edges = graph.edges;

    /* dist -> best known distances from the start
       prev -> predecessor pointers for path reconstruction */
    const dist = {};
    const prev = {};

    /* visited -> finalised nodes */
    const visited = new Set();

    /* counters provide observable complexity signals in the UI */
    const counters = {
        nodeVisits: 0,
        relaxAttempts: 0,
        successfulRelaxations: 0,
    };

    /* initialise all distances fto infinity, except start at 0 */
    nodes.forEach((id) => {
        dist[id] = Infinity;
        prev[id] = null;
    });
    dist[startId] = 0;

    /* priority queue */
    /* this prototype uses a simple array and sorts it each iteration */
    let pq = [{ id: startId, dist: 0}];

    /* initial UI step
        - shows the starting state before any node is processed */
    steps.push({
        phase: "init",
        currentNode: null,
        visited: [],
        frontier: pq.map((n) => n.id),
        frontierWithDist: formatFrontier(pq),
        dist: { ...dist },
        prev: { ...prev },
        activeEdge: null,
        explanationParts:{
            rule: "Initialise tentative distances",
            reason: "At the start, we assume all nodes are unreachable (∞) until proven otherwise.",
            effect: `Set dist [${startId}] = 0 because the start node is distance 0 from itself.`, 
        },
        counters: { ...counters },
        pq: snapshotPQ(pq),
    });

    while (pq.length > 0) {
        /* sorts by distance and removes the smallest element */
        pq.sort((a, b) => a.dist - b.dist);
        const { id: current } = pq.shift();

        if (visited.has(current)) continue;

        visited.add(current);
        counters.nodeVisits++;

        steps.push({
            phase: "select-node",
            currentNode: current,
            visited: Array.from(visited),
            frontier: pq.map((n) => n.id),
            frontierWithDist: formatFrontier(pq),
            dist: { ...dist },
            prev: { ...prev },
            activeEdge: null,
            explanationParts:{
                rule: "Pick the frontier node with the smallest tentative distance",
                reason: "With non-negative weights, the smallest tentative distance is guaranteed to be final (greedy choice).",
                effect: `Node ${current} becomes 'visited' (finalised). We now relax its outgoing edges.`, 
            },
            counters: { ...counters },
            pq: snapshotPQ(pq),
        });

        //early exit once target node is finalised
        if (current === endId) break;

        const outgoing = edges.filter(
            (e) => e.from === current || e.to === current
        );

        for(const edge of outgoing) {
            const neighbour = edge.from === current ? edge.to : edge.from;
            
            /* skip neighbouts already finalised */
            if (visited.has(neighbour)) continue;
        
            counters.relaxAttempts++;

            const oldDist = dist[neighbour];
            const newDist = dist[current] + edge.weight;

            /* steps to show the relaxation calculation before the final processing*/
            steps.push({
                phase: "relax-edge",
                currentNode: current,
                visited: Array.from(visited),
                frontier: pq.map((n) => n.id),
                frontierWithDist: formatFrontier(pq),
                dist: { ...dist },
                prev: { ...prev },
                activeEdge: edge.id,
                explanationParts:{
                    rule: "Relaxation check",
                    reason: "Try to improve the best known distance to a neighbour using the current node.",
                    effect: `Try ${current} -> ${neighbour}: ${dist[current]} + ${edge.weight} = ${newDist} (current best: ${oldDist === Infinity ? "∞" : oldDist}).`, 
                },
                counters: { ...counters },
                pq: snapshotPQ(pq),
            });

            /* if a shorter path is found:
                - update dist and prev 
                - add the neighbour to the frontier */
            if (newDist < dist[neighbour]) {

                //successful relaxation
                dist[neighbour] = newDist;
                prev[neighbour] = current;
                pq.push({ id: neighbour, dist: newDist});
                counters.successfulRelaxations++;

                steps.push({
                    phase: "update-distance",
                    currentNode: current,
                    visited: Array.from(visited),
                    frontier: pq.map((n) => n.id),
                    frontierWithDist: formatFrontier(pq),
                    dist: { ...dist },
                    prev: { ...prev },
                    activeEdge: edge.id,
                    explanationParts:{
                        rule: "Update distance (successful relaxation)",
                        reason: "We found a shorter path to the neighbour through the current node.",
                        effect: `Accept the new path. ${neighbour} now has distance ${newDist} via ${current}.`, 
                    },
                    counters: { ...counters },
                    pq: snapshotPQ(pq),
                });
            } else {
                //explicit step for failed relaxation
                steps.push({
                    phase: "no-update",
                    currentNode: current,
                    visited: Array.from(visited),
                    frontier: pq.map((n) => n.id),
                    frontierWithDist: formatFrontier(pq),
                    dist: { ...dist },
                    prev: { ...prev },
                    activeEdge: edge.id,
                    explanationParts:{
                        rule: "No update (failed relaxation)",
                        reason: "The alternative path is not better than the best-known distance.",
                        effect: `Reject the new path.  ${newDist} is not better than the current distance ${oldDist}.`, 
                    },
                    counters: { ...counters },
                    pq: snapshotPQ(pq),
                });
            }
        }
    }

    /* once loop has ended the final shortest path is reconstructed  (if reachable) */
    const shortestPathNodes = reconstructPathNodes(prev, startId, endId);
    const shortestPathEdges = pathNodesToEdgeIds(shortestPathNodes, edges);

    /* final step that highlights result path or explicity indicates no path */
    steps.push({
        phase: "final",
        currentNode: endId,
        visited: Array.from(visited),
        frontier: [],
        frontierWithDist: "∅",
        dist: { ...dist },
        prev: { ...prev },
        activeEdge: null, shortestPathNodes, shortestPathEdges,
        explanationParts: 
            shortestPathNodes.length > 0
                ? {
                    rule: "Reconstruct the shortest path",
                    reason: "We stored predecessors (prev during relaxations, so we can backtrack from the end  node.",
                    effect: `Highlight path ${shortestPathNodes.join("->")}.`,
                }
                : {
                    rule: "Terminate",
                    reason: "All reachable nodes have been finalised, but the end node was not reachable.",
                    effect: `No path exists from ${startId} to ${endId}.`,
                },
        counters: { ...counters },
        pq: snapshotPQ(pq),
    });

    return steps;
}
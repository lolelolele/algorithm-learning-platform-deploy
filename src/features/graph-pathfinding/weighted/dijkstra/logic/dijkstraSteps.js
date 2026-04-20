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
            rule: "Set all distances to infinity except the start node which gets distance 0.",
            reason: "We don't know the cost to reach any node yet. Infinity means unreachable until proven otherwise.",
            effect: `${startId} is added to the frontier with distance 0. All other nodes start at ∞.`,
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
                rule: "Select the frontier node with the smallest tentative distance",
                reason: `${current} has the smallest tentative distance (${dist[current]}). With non-negative weights this distance is now guaranteed to be final.`,
                effect: `${current} is marked as visited. Its shortest distance of ${dist[current]} is locked. We now check all edges leaving ${current}.`,
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
                    rule: "Relaxation check: Check if travelling through the current node gives a shorter path to the neighbour.",
                    reason: `Current distance to ${neighbour}: ${oldDist === Infinity ? "∞" : oldDist}. New path via ${current}: ${dist[current]} + ${edge.weight} = ${newDist}.`,
                    effect: newDist < oldDist
                        ? `${newDist} is better than ${oldDist === Infinity ? "∞" : oldDist}, this path will be accepted.`
                        : `${newDist} is not better than ${oldDist === Infinity ? "∞" : oldDist}, this path will be rejected.`,
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
                    explanationParts: {
                        rule: "Accept the shorter path: update the distance and add the neighbour to the frontier.",
                        reason: `The path ${startId} → ... → ${current} → ${neighbour} costs ${newDist}, which is less than the previous best of ${oldDist === Infinity ? "∞" : oldDist}.`,
                        effect: `${neighbour} now has distance ${newDist} via ${current}. It is added to the frontier to be explored.`,
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
                        effect: `${neighbour} keeps its current distance of ${oldDist}. No changes made.`, 
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
                    rule: "Trace back the shortest path using the predecessor pointers stored during relaxation.",
                    reason: `Every time we found a shorter path to a node, we recorded which node we came from. Following these pointers from ${endId} back to ${startId} gives the shortest path.`,
                    effect: `Shortest path: ${shortestPathNodes.join(" → ")} with total cost ${dist[endId]}.`,
                }
                : {
                    rule: "Algorithm complete: no path found.",
                    reason: `All reachable nodes from ${startId} have been visited but ${endId} was never reached.`,
                    effect: `No path exists from ${startId} to ${endId}.`,
                },
        counters: { ...counters },
        pq: snapshotPQ(pq),
    });

    return steps;
}
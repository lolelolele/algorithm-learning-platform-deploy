//Generates a step-by-step A* execution trace

//calculates straight-line distance between two nodes (used as heuristic)
function heuristic(nodeA, nodeB) {
    const dx = nodeA.x - nodeB.x;
    const dy = nodeA.y - nodeB.y;
    return Math.round(Math.sqrt(dx * dx + dy * dy) / 40);
}

// reconstructs the final path by following prev pointers from end to start
function reconstructPath(prev, startId, endId) {
    if (endId !== startId && prev[endId] == null) return [];
    const path = [];
    let current = endId;
    while (current != null) {
        path.push(current);
        if (current === startId) break;
        current = prev[current];
    }
    if (path[path.length - 1] !== startId) return [];
    return path.reverse();
}

// converts a path of node ids into edge ids for highlighting
function pathToEdgeIds(pathNodes, edges) {
    const edgeIds = [];
    for (let i = 0; i < pathNodes.length - 1; i++) {
        const a = pathNodes[i];
        const b = pathNodes[i + 1];
        const e = edges.find(
            edge => (edge.from === a && edge.to === b) ||
                    (edge.from === b && edge.to === a)
        );
        if (e) edgeIds.push(e.id);
    }
    return edgeIds;
}

export function generateAStarSteps(graph, startId, endId) {
    const steps = [];
    const { nodes, edges } = graph;

    const nodeMap = {};
    nodes.forEach(n => { nodeMap[n.id] = n; });

    const endNode = nodeMap[endId];

    //g -> actual cost from start to each node
    const g = {};
    //f -> g + heuristic estimate to goal
    const f = {};
    const prev = {};
    const visited = new Set();

    nodes.forEach(n => {
        g[n.id] = Infinity;
        f[n.id] = Infinity;
        prev[n.id] = null;
    });

    g[startId] = 0;
    f[startId] = heuristic(nodeMap[startId], endNode);

    // open list — nodes discovered but not yet visited
    let openList = [{ id: startId, f: f[startId] }];

    // counters for metrics panel
    const counters = {
        nodeVisits: 0,
        relaxAttempts: 0,
        successfulRelaxations: 0,
    };

    // initial step 
    steps.push({
        phase: "init",
        currentNode: null,
        visited: [],
        openList: [startId],
        activeEdge: null,
        g: { ...g },
        f: { ...f },
        shortestPathNodes: [],
        shortestPathEdges: [],
        explanation: `Initialise. Set g(${startId}) = 0, h(${startId}) = ${heuristic(nodeMap[startId], endNode)}, f(${startId}) = ${f[startId]}.`,
        whyThisStep: `A* starts by setting the cost to reach the start node as 0. The heuristic h estimates the remaining distance to the goal using straight-line (Euclidean) distance. f = g + h is the priority used to decide which node to explore next.`,
        counters: { ...counters },
    });

    while (openList.length > 0) {
        //pick node with lowest f score
        openList.sort((a, b) => a.f - b.f);
        const { id: current } = openList.shift();

        if (visited.has(current)) continue;
        visited.add(current);
        counters.nodeVisits++;

        steps.push({
            phase: "select-node",
            currentNode: current,
            visited: Array.from(visited),
            openList: openList.map(n => n.id),
            activeEdge: null,
            g: { ...g },
            f: { ...f },
            shortestPathNodes: [],
            shortestPathEdges: [],
            explanation: `Select node ${current} — lowest f score of ${f[current]} (g=${g[current]}, h=${heuristic(nodeMap[current], endNode)}).`,
            whyThisStep: `A* always expands the node with the lowest f = g + h. Node ${current} has the most promising combination of actual cost so far and estimated remaining distance to the goal.`,
            counters: { ...counters },
        });

        //reached the goal
        if (current === endId) break;

        const outgoing = edges.filter(
            e => e.from === current || e.to === current
        );

        for (const edge of outgoing) {
            const neighbour = edge.from === current ? edge.to : edge.from;
            if (visited.has(neighbour)) continue;

            counters.relaxAttempts++;
            const tentativeG = g[current] + edge.weight;
            const h = heuristic(nodeMap[neighbour], endNode);

            steps.push({
                phase: "relax-edge",
                currentNode: current,
                visited: Array.from(visited),
                openList: openList.map(n => n.id),
                activeEdge: edge.id,
                g: { ...g },
                f: { ...f },
                shortestPathNodes: [],
                shortestPathEdges: [],
                explanation: `Check ${current} → ${neighbour}: g=${g[current]} + weight=${edge.weight} = ${tentativeG}. h(${neighbour})=${h}. f would be ${tentativeG + h}.`,
                whyThisStep: `For each neighbour, A* calculates the cost to reach it through the current node. It then adds the heuristic estimate to get f. If this f is lower than the current best, we update.`,
                counters: { ...counters },
            });

            if (tentativeG < g[neighbour]) {
                g[neighbour] = tentativeG;
                f[neighbour] = tentativeG + h;
                prev[neighbour] = current;
                openList.push({ id: neighbour, f: f[neighbour] });
                counters.successfulRelaxations++;

                steps.push({
                    phase: "update",
                    currentNode: current,
                    visited: Array.from(visited),
                    openList: openList.map(n => n.id),
                    activeEdge: edge.id,
                    g: { ...g },
                    f: { ...f },
                    shortestPathNodes: [],
                    shortestPathEdges: [],
                    explanation: `Update ${neighbour}: g=${tentativeG}, h=${h}, f=${f[neighbour]}. Added to open list.`,
                    whyThisStep: `We found a cheaper path to ${neighbour} through ${current}. We update its g and f scores and add it to the open list to be explored.`,
                    counters: { ...counters },
                });
            } else {
                steps.push({
                    phase: "no-update",
                    currentNode: current,
                    visited: Array.from(visited),
                    openList: openList.map(n => n.id),
                    activeEdge: edge.id,
                    g: { ...g },
                    f: { ...f },
                    shortestPathNodes: [],
                    shortestPathEdges: [],
                    explanation: `No update for ${neighbour}: new g=${tentativeG} is not better than current g=${g[neighbour]}.`,
                    whyThisStep: `The path to ${neighbour} through ${current} is not cheaper than what we already know. We discard it.`,
                    counters: { ...counters },
                });
            }
        }
    }

    //reconstruct final path
    const pathNodes = reconstructPath(prev, startId, endId);
    const pathEdges = pathToEdgeIds(pathNodes, edges);

    steps.push({
        phase: "final",
        currentNode: endId,
        visited: Array.from(visited),
        openList: [],
        activeEdge: null,
        g: { ...g },
        f: { ...f },
        shortestPathNodes: pathNodes,
        shortestPathEdges: pathEdges,
        explanation: pathNodes.length > 0
            ? `Done. Shortest path: ${pathNodes.join(" → ")} with total cost ${g[endId]}.`
            : `Done. No path found from ${startId} to ${endId}.`,
        whyThisStep: pathNodes.length > 0
            ? `A* has found the optimal path. Because the heuristic never overestimates (admissible), the first time A* reaches the goal is guaranteed to be the shortest path.`
            : `The goal node was unreachable from the start node.`,
        counters: { ...counters },
    });

    return steps;
}
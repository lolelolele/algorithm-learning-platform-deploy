function heuristic(nodeA, nodeB) {
    const dx = nodeA.x - nodeB.x;
    const dy = nodeA.y - nodeB.y;
    return Math.round(Math.sqrt(dx * dx + dy * dy) / 40);
}

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

    const g = {};
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

    let openList = [{ id: startId, f: f[startId] }];

    const counters = {
        nodeVisits: 0,
        relaxAttempts: 0,
        successfulRelaxations: 0,
    };

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
        explanationParts: {
            rule: "Set g(start) = 0 and calculate f(start) = g + h. Add the start node to the open list.",
            reason: `The cost to reach ${startId} from itself is 0. The heuristic h(${startId}) = ${heuristic(nodeMap[startId], endNode)} estimates the straight-line distance to the goal ${endId}. So f(${startId}) = 0 + ${heuristic(nodeMap[startId], endNode)} = ${f[startId]}.`,
            effect: `${startId} is placed in the open list with f = ${f[startId]}. All other nodes start with g = ∞ and f = ∞ — they are unreachable until discovered.`,
        },
        counters: { ...counters },
    });

    while (openList.length > 0) {
        openList.sort((a, b) => a.f - b.f);
        const { id: current } = openList.shift();

        if (visited.has(current)) continue;
        visited.add(current);
        counters.nodeVisits++;

        const hCurrent = heuristic(nodeMap[current], endNode);

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
            explanation: `Select node ${current} — lowest f score of ${f[current]} (g=${g[current]}, h=${hCurrent}).`,
            explanationParts: {
                rule: "Select the node with the lowest f score from the open list, this is A*'s core decision.",
                reason: `${current} has f = g + h = ${g[current]} + ${hCurrent} = ${f[current]}, which is the lowest f score in the open list. A* always expands the node with the best estimated total cost.`,
                effect: `${current} is moved to the closed list (visited). Its shortest distance of g = ${g[current]} is now finalised. We will now check all edges leaving ${current}.`,
            },
            counters: { ...counters },
        });

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
            const tentativeF = tentativeG + h;

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
                explanation: `Check ${current} → ${neighbour}: g=${g[current]} + weight=${edge.weight} = ${tentativeG}. h(${neighbour})=${h}. f would be ${tentativeF}.`,
                explanationParts: {
                    rule: "Calculate the cost to reach the neighbour through the current node and compare it to the best known cost.",
                    reason: `Path via ${current}: g(${neighbour}) would be ${g[current]} + ${edge.weight} = ${tentativeG}. Adding h(${neighbour}) = ${h} gives f = ${tentativeF}. Current best g(${neighbour}) = ${g[neighbour] === Infinity ? "∞" : g[neighbour]}.`,
                    effect: tentativeG < g[neighbour]
                        ? `${tentativeG} is better than ${g[neighbour] === Infinity ? "∞" : g[neighbour]}, this path will be accepted and ${neighbour} updated.`
                        : `${tentativeG} is not better than ${g[neighbour]} — this path will be rejected.`,
                },
                counters: { ...counters },
            });

            if (tentativeG < g[neighbour]) {
                g[neighbour] = tentativeG;
                f[neighbour] = tentativeF;
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
                    explanationParts: {
                        rule: "Accept the shorter path: update g, f and the predecessor pointer, then add to the open list.",
                        reason: `The path ${startId} → ... → ${current} → ${neighbour} costs ${tentativeG}, which is cheaper than the previous best of ${g[neighbour] === Infinity ? "∞" : g[neighbour]}. The heuristic h(${neighbour}) = ${h} gives f = ${f[neighbour]}.`,
                        effect: `${neighbour} now has g = ${tentativeG} and f = ${f[neighbour]} via ${current}. It is added to the open list and will be considered for expansion.`,
                    },
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
                    explanationParts: {
                        rule: "Reject the new path: the existing route to this neighbour is already as good or better.",
                        reason: `The path via ${current} gives g(${neighbour}) = ${tentativeG}, but ${neighbour} already has g = ${g[neighbour]}. No improvement found.`,
                        effect: `${neighbour} keeps its current values. No changes are made to its g, f or predecessor.`,
                    },
                    counters: { ...counters },
                });
            }
        }
    }

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
        explanationParts: pathNodes.length > 0
            ? {
                rule: "Trace back the shortest path using the predecessor pointers recorded during relaxation.",
                reason: `Every time a shorter path to a node was found, its predecessor was recorded. Following these pointers from ${endId} back to ${startId} reconstructs the optimal path.`,
                effect: `Shortest path: ${pathNodes.join(" → ")} with total cost ${g[endId]}. Because the heuristic is admissible (never overestimates), this is guaranteed to be the optimal path.`,
            }
            : {
                rule: "Algorithm complete: no path found.",
                reason: `The open list is empty and ${endId} was never reached. All nodes reachable from ${startId} have been visited.`,
                effect: `No path exists from ${startId} to ${endId}.`,
            },
        counters: { ...counters },
    });

    return steps;
}
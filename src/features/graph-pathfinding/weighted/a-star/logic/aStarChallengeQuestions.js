export function generateAStarChallengeQuestions(steps) {
    const questions = [];
    const usedStepIndices = new Set();

    function addQuestion(q) {
        if (usedStepIndices.has(q.stepIndex)) return;
        usedStepIndices.add(q.stepIndex);
        questions.push(q);
    }

    steps.forEach((step, index) => {

        // --- Question type 1: Which node gets selected next? ---
        // Ask at the step BEFORE select-node so the open list still contains the answer
        if (step.phase === "select-node" && step.currentNode) {
            const correct = step.currentNode;
            const fScores = step.f ?? {};

            // build open list from current step (before removal) by adding correct back
            const openNodes = [...new Set([correct, ...step.openList])];
            if (openNodes.length < 2) return;

            const sorted = openNodes
                .map(id => ({ id, f: fScores[id] ?? Infinity }))
                .sort((a, b) => a.f - b.f)
                .slice(0, 4);

            const correctIndex = sorted.findIndex(item => item.id === correct);
            if (correctIndex === -1) return;

            const options = sorted.map(item =>
                `${item.id} (f: ${item.f === Infinity ? "∞" : item.f})`
            );

            addQuestion({
                stepIndex: index,
                question: `The open list contains nodes with these f scores. Which node will A* select next?`,
                options,
                correctIndex,
                explanation: `${correct} has the lowest f = g + h = ${sorted[correctIndex].f} — A* always expands the node with the smallest estimated total cost.`,
            });
        }

        // --- Question type 2: Will this edge update the neighbour? ---
        if (step.phase === "relax-edge" && step.activeEdge && step.currentNode) {
            const current = step.currentNode;
            const gScores = step.g ?? {};
            const fScores = step.f ?? {};

            // find the neighbour from the edge
            const graph = { edges: steps[0]?.nodes ?? [] };
            // get neighbour by looking at next step
            const nextStep = steps[index + 1];
            if (!nextStep) return;

            const neighbour = nextStep.phase === "update" || nextStep.phase === "no-update"
                ? nextStep.currentNode === current
                    ? null
                    : null
                : null;

            // simpler: use the explanation which contains "current → neighbour"
            const edgeMatch = step.explanation?.match(/Check (\w+) → (\w+):/);
            if (!edgeMatch) return;

            const nbr = edgeMatch[2];
            const currentG = gScores[current] ?? Infinity;
            const edgeWeight = step.explanation?.match(/weight=(\d+)/)?.[1];
            if (!edgeWeight) return;

            const newG = currentG + Number(edgeWeight);
            const currentBest = gScores[nbr] ?? Infinity;
            const willUpdate = newG < currentBest;

            addQuestion({
                stepIndex: index,
                question: `Checking edge ${current} → ${nbr}. The new path cost would be g(${current}) + weight = ${currentG} + ${edgeWeight} = ${newG}. Current best g(${nbr}) = ${currentBest === Infinity ? "∞" : currentBest}. Will this update ${nbr}'s distance?`,
                options: [
                    `Yes — ${newG} is better than ${currentBest === Infinity ? "∞" : currentBest}`,
                    `No — ${newG} is not better than ${currentBest === Infinity ? "∞" : currentBest}`,
                ],
                correctIndex: willUpdate ? 0 : 1,
                explanation: willUpdate
                    ? `${newG} < ${currentBest === Infinity ? "∞" : currentBest} so we found a shorter path to ${nbr}. Its g and f scores are updated and it is added to the open list.`
                    : `${newG} ≥ ${currentBest} so the existing path to ${nbr} is already as good or better. No update is made.`,
            });
        }

        // --- Question type 3: What is the f score after update? ---
        if (step.phase === "update" && step.currentNode) {
            const current = step.currentNode;
            const fScores = step.f ?? {};
            const gScores = step.g ?? {};

            const updateMatch = step.explanation?.match(/Update (\w+): g=(\d+), h=(\d+), f=(\d+)/);
            if (!updateMatch) return;

            const nbr = updateMatch[1];
            const newG = Number(updateMatch[2]);
            const h    = Number(updateMatch[3]);
            const newF = Number(updateMatch[4]);

            // generate plausible wrong answers
            const wrong1 = newF + 2;
            const wrong2 = newF - 2 > 0 ? newF - 2 : newF + 4;
            const wrong3 = newG + h + 1;

            const allOptions = [String(newF), String(wrong1), String(wrong2), String(wrong3)];
            const shuffled = [...new Set(allOptions)].sort(() => Math.random() - 0.5).slice(0, 4);
            const correctIndex = shuffled.indexOf(String(newF));
            if (correctIndex === -1) return;

            addQuestion({
                stepIndex: index,
                question: `${nbr} is being updated via ${current}. Its new g = ${newG} and h = ${h}. What is the new f score for ${nbr}?`,
                options: shuffled,
                correctIndex,
                explanation: `f = g + h = ${newG} + ${h} = ${newF}. This is the total estimated cost of the path through ${nbr} — A* uses f to prioritise which node to expand next.`,
            });
        }
    });

    return questions;
}
export function generateDijkstraChallengeQuestions(steps) {
    const questions = [];

    steps.forEach((step, index) => {
        if (step.phase !== "select-node") return;
        if (!step.currentNode) return;

        const correct = step.currentNode;

        // find the pq snapshot from the previous step
        // (before the current node was removed)
        const prevStep = steps[index - 1];
        if (!prevStep) return;

        // get pq from previous step — deduplicate by node id keeping lowest dist
        const rawPQ = prevStep.pq ?? [];
        const seen = new Map();
        for (const item of rawPQ) {
            if (!seen.has(item.id) || item.dist < seen.get(item.id).dist) {
                seen.set(item.id, item);
            }
        }

        // the correct node may have been removed from prevStep.pq already
        // add it back using dist from the current step
        if (!seen.has(correct)) {
            const correctDist = step.dist?.[correct];
            seen.set(correct, { id: correct, dist: correctDist ?? 0 });
        }

        // build options — sort by dist so lowest is first, take up to 4
        const frontier = [...seen.values()]
            .sort((a, b) => a.dist - b.dist)
            .slice(0, 4);

        if (frontier.length < 2) return;

        const options = frontier.map(item =>
            `${item.id} (dist: ${item.dist === Infinity ? "∞" : item.dist})`
        );

        const correctIndex = frontier.findIndex(item => item.id === correct);
        if (correctIndex === -1) return;

        // ask the question at the previous step so the frontier is visible
        const questionStepIndex = index - 1;
        if (questions.some(q => q.stepIndex === questionStepIndex)) return;

        questions.push({
            stepIndex: questionStepIndex,
            question: `The frontier contains these nodes. Which one will Dijkstra visit next?`,
            options,
            correctIndex,
            explanation: `Node ${correct} has the smallest tentative distance (${frontier[correctIndex].dist === Infinity ? "∞" : frontier[correctIndex].dist}) — Dijkstra always selects the unvisited node with the lowest known distance.`,
        });
    });

    return questions;
}
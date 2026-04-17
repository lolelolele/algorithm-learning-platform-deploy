export function generateAStarChallengeQuestions(steps) {
    const questions = [];

    steps.forEach((step, index) => {
        if (step.phase !== "select-node") return;
        if (!step.currentNode) return;

        const correct = step.currentNode;

        const prevStep = steps[index - 1];
        if (!prevStep || !prevStep.openList || prevStep.openList.length < 2) return;

        // deduplicate by node id keeping lowest f score
        const seen = new Map();
        for (const item of prevStep.openList) {
            if (!seen.has(item.id) || item.f < seen.get(item.id).f) {
                seen.set(item.id, item);
            }
        }
        const frontier = [...seen.values()].slice(0, 4);
        const options = frontier.map(item =>
            `${item.id} (f: ${item.f !== undefined ? item.f : "?"})`
        );
        const correctIndex = frontier.findIndex(item => item.id === correct);
        if (correctIndex === -1) return;

        questions.push({
            stepIndex: index,
            question: `Which node gets selected next from the open list?`,
            options,
            correctIndex,
            explanation: `Node ${correct} has the lowest f(n) = g(n) + h(n) score — A* always expands the node with the lowest estimated total cost.`,
        });
    });

    return questions;
}
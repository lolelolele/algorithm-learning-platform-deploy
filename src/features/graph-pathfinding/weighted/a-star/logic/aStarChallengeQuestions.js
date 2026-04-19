export function generateAStarChallengeQuestions(steps) {
    const questions = [];

    steps.forEach((step, index) => {
        if (step.phase !== "select-node") return;
        if (!step.currentNode) return;

        const correct = step.currentNode;

        // find the previous step that has a non-empty openList
        let prevStep = null;
        for (let i = index - 1; i >= 0; i--) {
            if (steps[i].openList && steps[i].openList.length > 0) {
                prevStep = steps[i];
                break;
            }
        }

        if (!prevStep) return;

        const openNodes = prevStep.openList; // array of node id strings
        if (openNodes.length < 2) return;

        // use f scores from the current step's f object
        const fScores = step.f ?? {};

        const options = openNodes.slice(0, 4).map(nodeId =>
            `${nodeId} (f: ${fScores[nodeId] !== undefined && fScores[nodeId] !== Infinity
                ? fScores[nodeId]
                : "∞"})`
        );

        const correctIndex = openNodes.slice(0, 4).indexOf(correct);
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
export function generateAStarChallengeQuestions(steps) {
    const questions = [];

    steps.forEach((step, index) => {
        if (step.phase !== "select-node") return;
        if (!step.currentNode) return;

        const correct = step.currentNode;

        // find previous step with a non-empty openList
        let prevStep = null;
        for (let i = index - 1; i >= 0; i--) {
            if (steps[i].openList && steps[i].openList.length > 0) {
                prevStep = steps[i];
                break;
            }
        }

        // build open list from previous step
        // openList is array of node id strings
        let openNodes = prevStep ? [...prevStep.openList] : [];

        // ensure the correct node is included
        if (!openNodes.includes(correct)) {
            openNodes.unshift(correct);
        }

        // deduplicate
        openNodes = [...new Set(openNodes)];

        if (openNodes.length < 2) return;

        // use f scores from the current step
        const fScores = step.f ?? {};

        // sort by f score and take up to 4
        const sorted = openNodes
            .map(nodeId => ({ id: nodeId, f: fScores[nodeId] ?? Infinity }))
            .sort((a, b) => a.f - b.f)
            .slice(0, 4);

        const options = sorted.map(item =>
            `${item.id} (f: ${item.f === Infinity ? "∞" : item.f})`
        );

        const correctIndex = sorted.findIndex(item => item.id === correct);
        if (correctIndex === -1) return;

        // ask at the previous step so the open list is still visible
        const questionStepIndex = index - 1;
        if (questions.some(q => q.stepIndex === questionStepIndex)) return;

        questions.push({
            stepIndex: questionStepIndex,
            question: `The open list contains these nodes. Which one will A* select next?`,
            options,
            correctIndex,
            explanation: `Node ${correct} has the lowest f score (f = g + h = ${sorted[correctIndex].f === Infinity ? "∞" : sorted[correctIndex].f}) — A* always expands the node with the lowest estimated total cost.`,
        });
    });

    return questions;
}
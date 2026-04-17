export function generateDijkstraChallengeQuestions(steps) {
    const questions = [];

    steps.forEach((step, index) => {
        if (step.phase !== "Visit node") return;
        if (!step.currentNode) return;
        if (!step.pq || step.pq.length === 0) return;

        // the correct answer is the node being visited this step
        const correct = step.currentNode;

        // build options from the frontier at the previous step
        const prevStep = steps[index - 1];
        if (!prevStep || !prevStep.pq || prevStep.pq.length < 2) return;

        // take up to 4 options from the previous frontier
        const frontier = [...prevStep.pq].slice(0, 4);
        const options = frontier.map(item =>
            `${item.id} (dist: ${item.dist === Infinity ? "∞" : item.dist})`
        );
        const correctIndex = frontier.findIndex(item => item.id === correct);
        if (correctIndex === -1) return;

        questions.push({
            stepIndex: index,
            question: `Which node gets visited next from the frontier?`,
            options,
            correctIndex,
            explanation: `Node ${correct} has the smallest tentative distance in the frontier — Dijkstra always visits the lowest-cost node next.`,
        });
    });

    return questions;
}
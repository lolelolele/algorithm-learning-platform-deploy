export function generateBFSChallengeQuestions(steps) {
    const questions = [];

    steps.forEach((step, index) => {
        if (!step.explanation) return;

        // match "Visiting node X"
        const visitMatch = step.explanation.match(/^Visiting node (\w+)\./);
        if (!visitMatch) return;

        const visited = visitMatch[1];

        // get queue from previous step to build options
        const prevStep = steps[index - 1];
        if (!prevStep) return;

        // extract queue from previous step explanation
        // format: "Queue: [A, B, C]" or "Initialising queue with the start node."
        const queueMatch = prevStep.explanation.match(/Queue: \[([^\]]+)\]/);
        if (!queueMatch) return;

        const queueNodes = queueMatch[1].split(",").map(s => s.trim());
        if (queueNodes.length < 2) return;

        // options are first 4 nodes in the queue
        const options = queueNodes.slice(0, 4);
        const correctIndex = options.indexOf(visited);
        if (correctIndex === -1) return;

        questions.push({
            stepIndex: index,
            question: `The queue is [${queueNodes.join(", ")}]. Which node gets visited next?`,
            options,
            correctIndex,
            explanation: `${visited} is at the front of the queue — BFS always visits the node that has been waiting longest (FIFO).`,
        });
    });

    return questions;
}
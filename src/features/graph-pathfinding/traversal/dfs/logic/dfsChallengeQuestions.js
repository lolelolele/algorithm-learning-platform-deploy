export function generateDFSChallengeQuestions(steps) {
    const questions = [];

    steps.forEach((step, index) => {
        if (!step.explanation) return;

        // match "Visiting node X"
        const visitMatch = step.explanation.match(/^Visiting node (\w+)\./);
        if (!visitMatch) return;

        const visited = visitMatch[1];

        // get stack from previous step to build options
        const prevStep = steps[index - 1];
        if (!prevStep) return;

        // extract stack from previous step explanation
        // format: "Stack: [A, B, C]"
        const stackMatch = prevStep.explanation.match(/Stack: \[([^\]]+)\]/);
        if (!stackMatch) return;

        const stackNodes = stackMatch[1].split(",").map(s => s.trim());
        if (stackNodes.length < 2) return;

        // options are last 4 nodes in the stack (top of stack is last)
        const options = [...new Set(stackNodes)].slice(-4).reverse();
        const correctIndex = options.indexOf(visited);
        if (correctIndex === -1) return;

        questions.push({
            stepIndex: index,
            question: `The stack is [${stackNodes.join(", ")}]. Which node gets visited next?`,
            options,
            correctIndex,
            explanation: `${visited} is at the top of the stack — DFS always visits the most recently added node (LIFO).`,
        });
    });

    return questions;
}
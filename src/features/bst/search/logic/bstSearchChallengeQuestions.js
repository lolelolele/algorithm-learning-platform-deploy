export function generateBSTSearchChallengeQuestions(steps) {
    const questions = [];

    steps.forEach((step, index) => {
        if (!step.explanation) return;

        // matches "X < Y — go left." or "X > Y — go right."
        const match = step.explanation.match(
            /^(\d+) ([<>]) (\d+) — go (left|right)\./
        );
        if (!match) return;

        const target   = Number(match[1]);
        const current  = Number(match[3]);
        const goesLeft = match[4] === "left";

        questions.push({
            stepIndex: index,
            question: `Searching for ${target}. Current node is ${current}. Which direction?`,
            options: ["Go left", "Go right"],
            correctIndex: goesLeft ? 0 : 1,
            explanation: goesLeft
                ? `${target} < ${current} so we go left down the tree.`
                : `${target} > ${current} so we go right down the tree.`,
        });
    });

    return questions;
}
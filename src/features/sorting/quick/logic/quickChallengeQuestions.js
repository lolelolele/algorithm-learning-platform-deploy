export function generateQuickChallengeQuestions(steps) {
    const questions = [];

    steps.forEach((step, index) => {
        if (!step.phase?.startsWith("Scan")) return;
        if (!step.explanation) return;

        // explanation format: "X ≤ pivot (Y): moves into the left (≤) partition."
        // or: "X > pivot (Y): stays in the right (>) partition."
        const match = step.explanation.match(
            /^(\d+) [≤>] pivot \((\d+)\)/
        );
        if (!match) return;

        const element   = Number(match[1]);
        const pivot     = Number(match[2]);
        const goesLeft  = element <= pivot;

        questions.push({
            stepIndex: index,
            question: `The pivot is ${pivot}. Which partition does ${element} go into?`,
            options: [`Left (≤ ${pivot})`, `Right (> ${pivot})`],
            correctIndex: goesLeft ? 0 : 1,
            explanation: goesLeft
                ? `${element} ≤ ${pivot} so it belongs in the left partition.`
                : `${element} > ${pivot} so it belongs in the right partition.`,
        });
    });

    return questions;
}
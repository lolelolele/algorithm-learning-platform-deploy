export function generateMergeChallengeQuestions(steps) {
    const questions = [];
    const usedStepIndices = new Set();

    steps.forEach((step, index) => {
        if (step.phase !== "Merging") return;
        if (!step.explanation) return;

        // explanation format: "Comparing X and Y: placing Z into merged array."
        const match = step.explanation.match(
            /Comparing (\d+) and (\d+): placing (\d+)/
        );
        if (!match) return;

        if (usedStepIndices.has(index)) return;
        usedStepIndices.add(index);

        const leftVal  = Number(match[1]);
        const rightVal = Number(match[2]);
        const placed   = Number(match[3]);

        // placed === leftVal means left was smaller or equal
        const leftWins = placed === leftVal;
        const correctIndex = leftWins ? 0 : 1;

        questions.push({
            stepIndex: index,
            question: `Comparing ${leftVal} (left half) and ${rightVal} (right half). Which gets placed into the merged array next?`,
            options: [
                `${leftVal} — from left half`,
                `${rightVal} — from right half`,
            ],
            correctIndex,
            explanation: leftWins
                ? `${leftVal} ≤ ${rightVal} so ${leftVal} is taken from the left half first.`
                : `${rightVal} < ${leftVal} so ${rightVal} is taken from the right half first.`,
        });
    });

    return questions;
}
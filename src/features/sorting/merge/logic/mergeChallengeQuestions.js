export function generateMergeChallengeQuestions(steps) {
    const questions = [];

    steps.forEach((step, index) => {
        if (step.phase !== "Merging") return;
        if (!step.explanation) return;

        // extract the two values being compared from the explanation
        // explanation format: "Comparing X and Y: placing Z into merged array."
        const match = step.explanation.match(
            /Comparing (\d+) and (\d+): placing (\d+)/
        );
        if (!match) return;

        const leftVal   = Number(match[1]);
        const rightVal  = Number(match[2]);
        const placed    = Number(match[3]);
        const correctIndex = placed === leftVal ? 0 : 1;

        questions.push({
            stepIndex: index,
            question: `Which element gets placed into the merged array next — ${leftVal} (left) or ${rightVal} (right)?`,
            options: [`${leftVal} — from left half`, `${rightVal} — from right half`],
            correctIndex,
            explanation: correctIndex === 0
                ? `${leftVal} ≤ ${rightVal} so it is taken from the left half first.`
                : `${rightVal} < ${leftVal} so it is taken from the right half first.`,
        });
    });

    return questions;
}
export function generateBubbleChallengeQuestions(steps) {
    const questions = [];

    steps.forEach((step, index) => {
        // only ask at comparison steps, not swap or end-of-pass steps
        if (!step.comparing) return;

        const [left, right] = step.comparing;
        const leftVal  = step.array[left];
        const rightVal = step.array[right];
        const willSwap = leftVal > rightVal;

        questions.push({
            stepIndex: index,
            question: `${leftVal} is at index ${left} and ${rightVal} is at index ${right}. Will they be swapped?`,
            options: ["Yes — swap them", "No — keep order"],
            correctIndex: willSwap ? 0 : 1,
            explanation: willSwap
                ? `Correct — ${leftVal} > ${rightVal} so they must be swapped to move the larger value right.`
                : `Correct — ${leftVal} ≤ ${rightVal} so they are already in order and no swap is needed.`,
        });
    });

    return questions;
}
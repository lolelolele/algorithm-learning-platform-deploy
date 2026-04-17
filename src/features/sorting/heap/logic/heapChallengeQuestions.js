export function generateHeapChallengeQuestions(steps) {
    const questions = [];

    steps.forEach((step, index) => {
        if (step.phase !== "Compare with left child" &&
            step.phase !== "Compare with right child") return;
        if (!step.comparing) return;

        const [i, j] = step.comparing;
        const valI = step.array[i];
        const valJ = step.array[j];
        const largerIndex = valI >= valJ ? 0 : 1;

        questions.push({
            stepIndex: index,
            question: `Which is larger — ${valI} (index ${i}) or ${valJ} (index ${j})?`,
            options: [`${valI} at index ${i}`, `${valJ} at index ${j}`],
            correctIndex: largerIndex,
            explanation: largerIndex === 0
                ? `${valI} ≥ ${valJ} so the parent at index ${i} is already larger — no swap needed here.`
                : `${valJ} > ${valI} so the child at index ${j} is larger and may need to swap with its parent.`,
        });
    });

    return questions;
}
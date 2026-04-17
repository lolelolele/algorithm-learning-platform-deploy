import { useState, useEffect, useRef } from "react";

export default function ChallengeMode({
    steps,
    currentStepIndex,
    onStepChange,
    isPlaying,
    onPlayingChange,
    questions,
    children,
}) {
    const [enabled, setEnabled] = useState(false);
    const [answered, setAnswered] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [correct, setCorrect] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [showSummary, setShowSummary] = useState(false);
    const usedSteps = useRef(new Set());

    // reset when steps change (new array/algorithm run)
    useEffect(() => {
        setAnswered(false);
        setShowFeedback(false);
        setCorrectCount(0);
        setShowSummary(false);
        usedSteps.current = new Set();
    }, [steps]);

    const currentQuestion = enabled
        ? questions.find(q => q.stepIndex === currentStepIndex)
        : null;

    const isLastStep = currentStepIndex >= steps.length - 1;

    // when challenge mode is on and we hit a question step,
    // pause autoplay automatically
    useEffect(() => {
        if (enabled && currentQuestion && isPlaying) {
            onPlayingChange(false);
        }
    }, [currentQuestion, enabled]);

    // show summary when last step is reached in challenge mode
    useEffect(() => {
        if (enabled && isLastStep && correctCount > 0) {
            setShowSummary(true);
        }
    }, [isLastStep, enabled]);

    function handleAnswer(optionIndex) {
        if (answered) return;
        if (usedSteps.current.has(currentStepIndex)) return;

        const isCorrect = optionIndex === currentQuestion.correctIndex;
        usedSteps.current.add(currentStepIndex);

        setAnswered(true);
        setCorrect(isCorrect);
        setShowFeedback(true);

        if (isCorrect) {
            setCorrectCount(c => c + 1);
        }
    }

    function handleNext() {
        setShowFeedback(false);
        setAnswered(false);
        onStepChange(i => Math.min(i + 1, steps.length - 1));
        onPlayingChange(true);
    }

    function handleToggle() {
        if (currentStepIndex > 0) return; // can't toggle mid-execution
        setEnabled(e => !e);
        setCorrectCount(0);
        usedSteps.current = new Set();
        setShowSummary(false);
    }

    function handleReset() {
        setShowSummary(false);
        setCorrectCount(0);
        usedSteps.current = new Set();
        setAnswered(false);
        setShowFeedback(false);
        onStepChange(0);
        onPlayingChange(false);
    }

    const percentage = questions.length > 0
        ? Math.round((correctCount / questions.length) * 100)
        : 0;

    return (
        <div className="flex flex-col h-full gap-3">

            {/* toggle row */}
            <div className="flex items-center justify-between px-1">
                <button
                    onClick={handleToggle}
                    disabled={currentStepIndex > 0}
                    className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors
                        ${enabled
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }
                        disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                    <span>{enabled ? "Challenge Mode: ON" : "Challenge Mode: OFF"}</span>
                </button>

                {/* score badge */}
                {enabled && (
                    <div className="text-sm font-medium text-gray-600">
                        Score:{" "}
                        <span className={`font-bold ${percentage >= 70 ? "text-green-600" : "text-red-500"}`}>
                            {correctCount}/{questions.length} ({percentage}%)
                        </span>
                    </div>
                )}
            </div>
            
            {/* summary modal */}
            {showSummary && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 rounded-xl">
                    <div className="bg-white rounded-xl border shadow-lg p-8 max-w-sm w-full mx-4 text-center">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                            Challenge Complete!
                        </h3>
                        <p className="text-gray-500 text-sm mb-4">
                            You answered {correctCount} out of {questions.length} questions correctly.
                        </p>
                        <div className={`text-3xl font-bold mb-1 ${percentage >= 70 ? "text-green-600" : "text-red-500"}`}>
                            {percentage}%
                        </div>
                        <p className="text-xs text-gray-400 mb-6">
                            {percentage >= 80
                                ? "Excellent understanding!"
                                : percentage >= 50
                                ? "Good effort — keep practising!"
                                : "Review the algorithm steps and try again."}
                        </p>
                        <button
                            onClick={handleReset}
                            className="w-full bg-gray-900 text-white py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            )}

            {/* question prompt */}
            {enabled && currentQuestion && !answered && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-amber-800 mb-3">
                        {currentQuestion.question}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {currentQuestion.options.map((opt, i) => (
                            <button
                                key={i}
                                onClick={() => handleAnswer(i)}
                                className="px-4 py-2 rounded-lg border text-sm font-medium bg-white hover:bg-amber-100 border-amber-300 text-gray-800 transition-colors"
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* feedback */}
            {enabled && showFeedback && answered && (
                <div className={`rounded-xl border p-4 ${correct ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className={`text-sm font-semibold mb-1 ${correct ? "text-green-700" : "text-red-700"}`}>
                                {correct ? "✓ Correct!" : "✗ Incorrect"}
                            </p>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                {currentQuestion.explanation}
                            </p>
                        </div>
                        <button
                            onClick={handleNext}
                            className="flex-shrink-0 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}

            {/* visualisation */}
            <div className="flex-1 min-h-0">
                {children}
            </div>
        </div>
    );
}
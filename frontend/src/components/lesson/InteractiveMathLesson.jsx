import React, { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import { AnimatePresence } from 'framer-motion';
import { LessonEngineProvider, useLessonEngine, STEP_PHASES } from './LessonStepEngine';
import AnimatedStep from './AnimatedStep';
import MathAnimation from './MathAnimation';
import ReasoningHighlight from './ReasoningHighlight';
import StudentInteractionMode from './StudentInteractionMode';
import ProgressiveHints from './ProgressiveHints';
import MistakeDetector from './MistakeDetector';
import GamifiedFeedback, { XPPopup, StreakBadge, LessonCompleteOverlay } from './GamifiedFeedback';
import LessonProgressBar from './LessonProgressBar';
import './lesson-animations.css';

/**
 * المكوّن المنسّق الرئيسي — يجمع كل مكوّنات الدرس التفاعلي
 */
export default function InteractiveMathLesson({ lessonData, onComplete, onQuiz }) {
    if (!lessonData?.interactive_steps) return null;

    return (
        <LessonEngineProvider steps={lessonData.interactive_steps}>
            <LessonContent lessonData={lessonData} onComplete={onComplete} onQuiz={onQuiz} />
        </LessonEngineProvider>
    );
}

function LessonContent({ lessonData, onComplete, onQuiz }) {
    const {
        state,
        nextStep,
        submitAnswer,
        requestHint,
        retryStep,
        addXP,
        addAchievement,
        getProgress,
        setPhase,
    } = useLessonEngine();

    const [xpPopups, setXpPopups] = useState([]);
    const [showComplete, setShowComplete] = useState(false);
    const [interactionState, setInteractionState] = useState({}); // per-step interaction state
    const { lessonId } = useParams();

    const steps = lessonData.interactive_steps;

    // التحقق من الإنجازات
    useEffect(() => {
        if (state.streak === 3) addAchievement('streak_3');
        if (state.streak === 5) addAchievement('streak_5');
    }, [state.streak, addAchievement]);

    useEffect(() => {
        if (state.isComplete) {
            const timer = setTimeout(() => setShowComplete(true), 800);
            return () => clearTimeout(timer);
        }
    }, [state.isComplete]);

    // عرض XP عائم
    const showXP = useCallback((amount) => {
        const id = Date.now();
        setXpPopups(prev => [...prev, { id, amount }]);
        setTimeout(() => setXpPopups(prev => prev.filter(p => p.id !== id)), 1600);
    }, []);

    // تقديم إجابة
    const handleSubmit = useCallback((stepIndex, answer, isCorrect) => {
        submitAnswer(stepIndex, answer, isCorrect);

        // Broadcast activity
        if (lessonId) {
            api.post(`/student/lessons/${lessonId}/activity`, {
                type: isCorrect ? 'correct_answer' : 'mistake',
                payload: { answer: String(answer), step: stepIndex }
            }).catch(err => console.error('Failed to broadcast activity', err));
        }

        if (isCorrect) {
            showXP(10);
            // +10 إضافية من المحاولة الأولى
            if (state.stepStates[stepIndex]?.attempts === 0) {
                setTimeout(() => {
                    addXP(10);
                    showXP(10);
                    addAchievement('first_try');
                }, 500);
            }
        }
        setInteractionState(prev => ({
            ...prev,
            [stepIndex]: { answer, isCorrect, attempts: (prev[stepIndex]?.attempts || 0) + 1 },
        }));
    }, [submitAnswer, showXP, addXP, addAchievement, state.stepStates, lessonId]);

    // طلب تلميح
    const handleRequestHint = useCallback((stepIndex, cost) => {
        requestHint(stepIndex, cost);
        if (lessonId) {
            api.post(`/student/lessons/${lessonId}/activity`, {
                type: 'requested_hint',
                payload: { step: stepIndex, cost }
            }).catch(err => console.error('Failed to broadcast activity', err));
        }
    }, [requestHint, lessonId]);

    // الانتقال للخطوة التالية
    const handleNextStep = useCallback(() => {
        nextStep();
    }, [nextStep]);

    // إحصائيات الإكمال
    const completionStats = {
        xpEarned: state.xpEarned,
        accuracy: state.totalSteps > 0
            ? Math.round(((state.totalSteps - state.mistakeCount) / state.totalSteps) * 100)
            : 100,
        maxStreak: state.maxStreak,
        hintsUsed: state.hintsUsed,
        duration: getProgress().duration,
    };

    const completedStepIndices = state.stepStates
        .map((s, i) => s.completed ? i : null)
        .filter(i => i !== null);

    return (
        <div className="relative">
            {/* شريط التقدم الثابت */}
            <LessonProgressBar
                currentStep={state.currentStepIndex}
                totalSteps={state.totalSteps}
                completedSteps={completedStepIndices}
                xpEarned={state.xpEarned}
                streak={state.streak}
            />

            {/* XP العائمة */}
            <AnimatePresence>
                {xpPopups.map(p => <XPPopup key={p.id} amount={p.amount} />)}
            </AnimatePresence>

            {/* الخطوات */}
            <div className="max-w-4xl mx-auto px-4 md:px-4 py-2 space-y-5">
                <AnimatePresence mode="sync">
                    {steps.map((step, index) => {
                        // إظهار فقط الخطوات حتى الحالية + 1
                        if (index > state.currentStepIndex) return null;

                        const isActive = index === state.currentStepIndex;
                        const isCompleted = state.stepStates[index]?.completed;
                        const stepInteraction = interactionState[index];

                        return (
                            <AnimatedStep
                                key={`step-${index}`}
                                step={step}
                                stepIndex={index}
                                isActive={isActive}
                                isCompleted={isCompleted}
                                delay={index * 150}
                            >
                                {/* حركة المعادلات (إذا وجدت) */}
                                {step.mathSteps && isActive && (
                                    <div className="mt-4">
                                        <MathAnimation
                                            steps={step.mathSteps}
                                            autoPlay={false}
                                        />
                                    </div>
                                )}

                                {/* تبرير / قاعدة (إذا وجدت) */}
                                {step.reasoning && (
                                    <div className="mt-4">
                                        <ReasoningHighlight
                                            type={step.reasoning.type || 'rule'}
                                            text={step.reasoning.text}
                                            learnMore={step.reasoning.learnMore}
                                        />
                                    </div>
                                )}

                                {/* تفاعل الطالب (إذا كانت الخطوة تفاعلية) */}
                                {step.interaction && isActive && !isCompleted && (
                                    <div className="mt-4">
                                        <StudentInteractionMode
                                            type={step.interaction.type || 'text'}
                                            question={step.interaction.question}
                                            correctAnswer={step.interaction.correctAnswer}
                                            options={step.interaction.options}
                                            placeholder={step.interaction.placeholder}
                                            onSubmit={(answer, correct) => handleSubmit(index, answer, correct)}
                                            onCorrect={() => {
                                                // انتقال تلقائي بعد ثانيتين
                                                setTimeout(handleNextStep, 2000);
                                            }}
                                            mistakeDetector={
                                                stepInteraction && !stepInteraction.isCorrect ? (
                                                    <MistakeDetector
                                                        userAnswer={stepInteraction.answer}
                                                        correctAnswer={step.interaction.correctAnswer}
                                                        mistakeType={step.interaction.mistakeType}
                                                        attempts={stepInteraction.attempts}
                                                        showCorrection={stepInteraction.attempts >= 3}
                                                    />
                                                ) : null
                                            }
                                        >
                                            {/* تلميحات تدريجية */}
                                            {step.interaction.hints && (
                                                <ProgressiveHints
                                                    hints={step.interaction.hints}
                                                    currentXP={state.xpEarned}
                                                    maxRevealed={state.stepStates[index]?.hintsRevealed || 0}
                                                    onRequestHint={(level, cost) => handleRequestHint(index, cost)}
                                                />
                                            )}
                                        </StudentInteractionMode>
                                    </div>
                                )}

                                {/* زر الخطوة التالية (للخطوات غير التفاعلية) */}
                                {isActive && !step.interaction && !state.isComplete && (
                                    <div className="mt-3 flex justify-start">
                                        <button
                                            onClick={handleNextStep}
                                            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold transition-all shadow-lg shadow-sky-500/20 flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
                                        >
                                            <span>الخطوة التالية</span>
                                            <span className="text-sky-200">←</span>
                                        </button>
                                    </div>
                                )}
                            </AnimatedStep>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* شاشة الإكمال */}
            <LessonCompleteOverlay
                show={showComplete}
                stats={completionStats}
                onContinue={() => {
                    setShowComplete(false);
                    onComplete?.();
                }}
                onQuiz={onQuiz ? () => {
                    setShowComplete(false);
                    onQuiz();
                } : null}
            />
        </div>
    );
}

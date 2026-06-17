import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';

const LessonEngineContext = createContext(null);

// --- أنواع الأفعال ---
const ACTIONS = {
    NEXT_STEP: 'NEXT_STEP',
    PREV_STEP: 'PREV_STEP',
    SET_PHASE: 'SET_PHASE',
    SUBMIT_ANSWER: 'SUBMIT_ANSWER',
    REQUEST_HINT: 'REQUEST_HINT',
    RETRY_STEP: 'RETRY_STEP',
    ADD_XP: 'ADD_XP',
    INCREMENT_STREAK: 'INCREMENT_STREAK',
    RESET_STREAK: 'RESET_STREAK',
    ADD_ACHIEVEMENT: 'ADD_ACHIEVEMENT',
    COMPLETE_LESSON: 'COMPLETE_LESSON',
    SET_STEP_STATE: 'SET_STEP_STATE',
};

// --- مراحل كل خطوة ---
export const STEP_PHASES = {
    REVEAL: 'reveal',
    EXPLAIN: 'explain',
    INTERACT: 'interact',
    FEEDBACK: 'feedback',
};

// --- الحالة الأولية ---
function createInitialState(steps) {
    return {
        steps: steps || [],
        currentStepIndex: 0,
        currentPhase: STEP_PHASES.REVEAL,
        totalSteps: steps?.length || 0,
        xpEarned: 0,
        hintsUsed: 0,
        mistakeCount: 0,
        streak: 0,
        maxStreak: 0,
        achievements: [],
        stepStates: (steps || []).map(() => ({
            completed: false,
            attempts: 0,
            hintsRevealed: 0,
            correct: null,
            userAnswer: null,
        })),
        isComplete: false,
        startTime: Date.now(),
    };
}

// --- المخفّض ---
function lessonReducer(state, action) {
    switch (action.type) {
        case ACTIONS.NEXT_STEP: {
            const nextIndex = state.currentStepIndex + 1;
            if (nextIndex >= state.totalSteps) {
                return { ...state, isComplete: true, currentPhase: STEP_PHASES.FEEDBACK };
            }
            return {
                ...state,
                currentStepIndex: nextIndex,
                currentPhase: STEP_PHASES.REVEAL,
            };
        }

        case ACTIONS.PREV_STEP: {
            const prevIndex = Math.max(0, state.currentStepIndex - 1);
            return {
                ...state,
                currentStepIndex: prevIndex,
                currentPhase: STEP_PHASES.REVEAL,
            };
        }

        case ACTIONS.SET_PHASE:
            return { ...state, currentPhase: action.payload };

        case ACTIONS.SUBMIT_ANSWER: {
            const { stepIndex, answer, isCorrect } = action.payload;
            const newStepStates = [...state.stepStates];
            newStepStates[stepIndex] = {
                ...newStepStates[stepIndex],
                attempts: newStepStates[stepIndex].attempts + 1,
                correct: isCorrect,
                userAnswer: answer,
                completed: isCorrect,
            };
            return {
                ...state,
                stepStates: newStepStates,
                mistakeCount: isCorrect ? state.mistakeCount : state.mistakeCount + 1,
            };
        }

        case ACTIONS.REQUEST_HINT: {
            const { stepIndex, cost } = action.payload;
            const newStepStates = [...state.stepStates];
            newStepStates[stepIndex] = {
                ...newStepStates[stepIndex],
                hintsRevealed: newStepStates[stepIndex].hintsRevealed + 1,
            };
            return {
                ...state,
                stepStates: newStepStates,
                hintsUsed: state.hintsUsed + 1,
                xpEarned: Math.max(0, state.xpEarned - (cost || 0)),
            };
        }

        case ACTIONS.RETRY_STEP: {
            const newStepStates = [...state.stepStates];
            newStepStates[action.payload] = {
                ...newStepStates[action.payload],
                correct: null,
                userAnswer: null,
            };
            return { ...state, stepStates: newStepStates };
        }

        case ACTIONS.ADD_XP:
            return { ...state, xpEarned: state.xpEarned + action.payload };

        case ACTIONS.INCREMENT_STREAK: {
            const newStreak = state.streak + 1;
            return {
                ...state,
                streak: newStreak,
                maxStreak: Math.max(state.maxStreak, newStreak),
            };
        }

        case ACTIONS.RESET_STREAK:
            return { ...state, streak: 0 };

        case ACTIONS.ADD_ACHIEVEMENT:
            if (state.achievements.includes(action.payload)) return state;
            return { ...state, achievements: [...state.achievements, action.payload] };

        case ACTIONS.COMPLETE_LESSON:
            return { ...state, isComplete: true };

        case ACTIONS.SET_STEP_STATE: {
            const { index, data } = action.payload;
            const newStepStates = [...state.stepStates];
            newStepStates[index] = { ...newStepStates[index], ...data };
            return { ...state, stepStates: newStepStates };
        }

        default:
            return state;
    }
}

// --- المزوّد ---
export function LessonEngineProvider({ steps, children }) {
    const [state, dispatch] = useReducer(lessonReducer, steps, createInitialState);

    const nextStep = useCallback(() => {
        dispatch({ type: ACTIONS.NEXT_STEP });
    }, []);

    const prevStep = useCallback(() => {
        dispatch({ type: ACTIONS.PREV_STEP });
    }, []);

    const setPhase = useCallback((phase) => {
        dispatch({ type: ACTIONS.SET_PHASE, payload: phase });
    }, []);

    const submitAnswer = useCallback((stepIndex, answer, isCorrect) => {
        dispatch({
            type: ACTIONS.SUBMIT_ANSWER,
            payload: { stepIndex, answer, isCorrect },
        });
        if (isCorrect) {
            dispatch({ type: ACTIONS.ADD_XP, payload: 10 });
            dispatch({ type: ACTIONS.INCREMENT_STREAK });
        } else {
            dispatch({ type: ACTIONS.RESET_STREAK });
        }
    }, []);

    const requestHint = useCallback((stepIndex, cost = 5) => {
        dispatch({
            type: ACTIONS.REQUEST_HINT,
            payload: { stepIndex, cost },
        });
    }, []);

    const retryStep = useCallback((stepIndex) => {
        dispatch({ type: ACTIONS.RETRY_STEP, payload: stepIndex });
    }, []);

    const addXP = useCallback((amount) => {
        dispatch({ type: ACTIONS.ADD_XP, payload: amount });
    }, []);

    const addAchievement = useCallback((id) => {
        dispatch({ type: ACTIONS.ADD_ACHIEVEMENT, payload: id });
    }, []);

    const completeLesson = useCallback(() => {
        dispatch({ type: ACTIONS.COMPLETE_LESSON });
    }, []);

    const getProgress = useCallback(() => {
        const completed = state.stepStates.filter(s => s.completed).length;
        return {
            percentage: state.totalSteps > 0 ? (completed / state.totalSteps) * 100 : 0,
            completed,
            total: state.totalSteps,
            duration: Math.floor((Date.now() - state.startTime) / 1000),
        };
    }, [state.stepStates, state.totalSteps, state.startTime]);

    const value = useMemo(() => ({
        state,
        nextStep,
        prevStep,
        setPhase,
        submitAnswer,
        requestHint,
        retryStep,
        addXP,
        addAchievement,
        completeLesson,
        getProgress,
    }), [state, nextStep, prevStep, setPhase, submitAnswer, requestHint, retryStep, addXP, addAchievement, completeLesson, getProgress]);

    return (
        <LessonEngineContext.Provider value={value}>
            {children}
        </LessonEngineContext.Provider>
    );
}

// --- الخطاف المخصص ---
export function useLessonEngine() {
    const context = useContext(LessonEngineContext);
    if (!context) {
        throw new Error('useLessonEngine must be used within a LessonEngineProvider');
    }
    return context;
}

export default LessonEngineProvider;

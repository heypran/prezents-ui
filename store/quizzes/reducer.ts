import { quizzesActionTypes } from './actions';

export interface IQuestionAnswer {
  correct: boolean;
  correct_answer: string;
  id: number;
}

export interface QuizzesState {
  userId: number | undefined;
  name: string | undefined;
  surname: number | undefined;
  answers:
    | {
        [key: string]: IQuestionAnswer[];
      }
    | {};
  isWaitingTxConfirmation: boolean;
}

const initialState: QuizzesState = {
  userId: undefined,
  name: undefined,
  surname: undefined,
  answers: {},
  isWaitingTxConfirmation: false,
};

export default function reducer(
  state = initialState,
  action: { type: quizzesActionTypes; payload: any }
) {
  switch (action.type) {
    case quizzesActionTypes.CREATE_PLAYER:
      return {
        ...state,
        name: action.payload.name,
        surname: action.payload.surname,
        userId: action.payload.id,
      };
    case quizzesActionTypes.ADD_QUIZ_QUESTION:
      const { quizId, answer } = action.payload;
      const { answers } = state;
      const previousQuizAnswers = answers[quizId] ?? [];
      return {
        ...state,
        answers: { ...answers, [quizId]: [...previousQuizAnswers, answer] },
      };
    case quizzesActionTypes.TX_WAITING_CONFIRMATION:
      const { isWaitingTxConfirmation } = action.payload;

      return {
        ...state,
        isWaitingTxConfirmation,
      };
    case quizzesActionTypes.TX_CONFIRMED: {
      const { isWaitingTxConfirmation } = action.payload;

      return {
        ...state,
        isWaitingTxConfirmation,
      };
    }

    default:
      return state;
  }
}

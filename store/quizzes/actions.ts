import { IQuestionAnswer } from './reducer';

export enum quizzesActionTypes {
  CREATE_PLAYER = 'CREATE_PLAYER',
  ADD_QUIZ_QUESTION = 'ADD_QUIZ_QUESTION',
  TX_WAITING_CONFIRMATION = 'TX_WAITING_CONFIRMATION',
  TX_CONFIRMED = 'TX_CONFIRMED',
}

export const createPlayer =
  (player: { surname: number; name: string }) => async (dispatch) => {
    return dispatch({
      type: quizzesActionTypes.CREATE_PLAYER,
      payload: player,
    });
  };

export interface IAddQuizQuestionAnswerActionPayload {
  quizId: number;
  answer: IQuestionAnswer;
}

export const addQuizQuestionAnswerAction =
  (response: IAddQuizQuestionAnswerActionPayload) => async (dispatch) => {
    return dispatch({
      type: quizzesActionTypes.ADD_QUIZ_QUESTION,
      payload: response,
    });
  };

export interface ITxWaitingConfirmationActionPayload {
  isWaitingTxConfirmation: boolean;
}

export const txWaitingConfirmationAction =
  (response: ITxWaitingConfirmationActionPayload) => async (dispatch) => {
    return dispatch({
      type: quizzesActionTypes.TX_WAITING_CONFIRMATION,
      payload: response,
    });
  };

export interface ITxWaitingConfirmedActionPayload {
  isWaitingTxConfirmation: boolean;
}

export const txConfirmedAction =
  (response: ITxWaitingConfirmationActionPayload) => async (dispatch) => {
    return dispatch({
      type: quizzesActionTypes.TX_CONFIRMED,
      payload: response,
    });
  };

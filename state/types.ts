import { BigNumber } from 'ethers';

export interface IQuestionAnswer {
  correct: boolean;
  correct_answer: string;
  id: number;
}

export enum QuizDappStatus {
  INITIAL = 'initial',
  LIVE = 'live',
  PAUSED = 'paused',
  ERROR = 'error',
}

export type ActiveQuizzes = { [key: string]: DappQuizType };
export interface QuizzesState {
  status: QuizDappStatus.INITIAL | QuizDappStatus.LIVE | QuizDappStatus.PAUSED;
  userId: number | undefined;
  name: string | undefined;
  surname: number | undefined;
  answers:
    | {
        [key: string]: IQuestionAnswer[];
      }
    | {};
  isWaitingTxConfirmation: boolean;
  activeQuizzes: ActiveQuizzes;
  leaderboard?: any;
  isFetchingStats: boolean;
  dappStats: any;
}

export interface IContractQuiz {
  quizId: string;
  creator: string;
  quizCid: string;
  title: string;
  attemptedCount: number;
  rewards: string; // total rewards available for the correct answers
  created: number;
  startTime: number;
  endTime: number;
  isActive: boolean;
  isEnded: boolean;
  answers: number[];
}
// response of contract
export interface IContractQuizResponse {
  quizId: BigNumber;
  creator: string;
  cid: string;
  title: string;
  attemptedCount: BigNumber;
  rewards: string; // total rewards available for the correct answers
  created: BigNumber;
  startTime: BigNumber;
  endTime: BigNumber;
  isActive: boolean;
  isEnded: boolean;
  answers: number[];
}

export interface IQuestion {
  id: number;
  question: string;
  answers: string[];
  answered_correctly?: boolean;
  submitted_answer?: string;
  correct_answer?: string;
}

export type DappQuizType = IContractQuiz & {
  id?: number;
  questions_count?: number;
  questions?: IQuestion[];
};

export interface State {
  quizDapp: QuizzesState;
}

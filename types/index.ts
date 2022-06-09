/**
 * The app has few simple interfaces/types that does not require splitting it over multiple files
 */

export interface IQuiz {
  id?: number;
  title: string;
  questions_count?: number;
  questions?: IQuestion[];
  creator: string;
  attemptedCount: number;
  rewards: number;
  quizCid: string;
  quizId: string;
  created?: number;
  startTime: number;
  endTime: number;
  isActive: boolean;
  isEnded?: boolean;
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

export interface IQuizAnswer {
  quizId: number;
  user: string;
  redeemedRewards: number;
  submissionTime: number;
  answers: number[];
}

export interface IQuestionReq {
  answers: string[];
  question: string;
  correct_answer?: string;
}
export interface IQuestionFrom {
  answer1: string;
  answer2: string;
  answer3: string;
  answer4: string;
  question: string;
  correct_answer: string;
}

export interface IQuestionApiResponse {
  id: number;
  title: string;
  questions: IQuestion[];
}

export interface ISubmitQuestionBody {
  data: {
    question_id: number;
    answer: string;
    user_id: number;
  };
}

export type ISubmitQuestionResponse =
  | {
      id: number;
      correct_answer: string;
      correct: boolean;
    }
  | {
      error: string;
    };

export interface IUser {
  id: number;
  name: string;
  surname: string;
}

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
  dappStats: {
    totalCreated?: number;
    totalRewardsRedeemed?: number;
    totalParticipants?: number;
  };
  userTxHistory?: UserTxHistoryResponseType;
  isFetchingUserHistory: boolean;
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

export type UserTxHistoryItemType = {
  block_signed_at: string;
  block_height: number;
  tx_hash: string;
  tx_offset: number;
  successful: boolean;
  from_address: string;
  from_address_label?: null;
  to_address: string;
  to_address_label?: null;
  value: string;
  value_quote: number;
  gas_offered: number;
  gas_spent: number;
  gas_price: number;
  fees_paid: string;
  gas_quote: number;
  gas_quote_rate: number;
  log_events?: LogEventsEntity[] | null;
};
export interface LogEventsEntity {
  block_signed_at: string;
  block_height: number;
  tx_offset: number;
  log_offset: number;
  tx_hash: string;
  raw_log_topics?: string[] | null;
  sender_contract_decimals: number;
  sender_name?: string | null;
  sender_contract_ticker_symbol?: string | null;
  sender_address: string;
  sender_address_label?: null;
  sender_logo_url: string;
  raw_log_data?: string | null;
  decoded?: null;
}

export type UserTxHistoryResponseType = {
  address: string;
  chain_id: string;
  items: UserTxHistoryItemType[];
  pagination: {
    has_more: boolean;
    page_number: number;
    page_size: number;
    total_count?: number;
  };
  updated_at: string;
};

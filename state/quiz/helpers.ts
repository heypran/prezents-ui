import { ethers } from 'ethers';
import {
  ActiveQuizzes,
  DappQuizType,
  IContractQuiz,
  IContractQuizResponse,
  QuizDappStatus,
  QuizzesState,
} from '../types';

export const getQuizDappGameState = async (chainId: number): Promise<any> => {
  // const contract = getSevenUpDownContract(chainId);

  // const gameState = await contract.getGameState();

  // try {
  //   const gameStateTransformed = {status: gameState.gamePause ? SevenUpDownGameStatus.PAUSED : SevenUpDownGameStatus.LIVE,
  //     lastRoundId: ethers.BigNumber.from(gameState.lastRound).toNumber(),
  //     roundDuration: ethers.BigNumber.from(gameState.roundDuration).toNumber(),
  //     totalBids: ethers.BigNumber.from(gameState.totalBids).toNumber(),
  //     totalRounds: ethers.BigNumber.from(gameState.totalRounds).toNumber(),
  //     minBid:  ethers.utils.parseEther("2")};

  // }catch(e){
  //   console.log('err',e);
  // }

  return {
    status: QuizDappStatus.LIVE,
    userId: undefined,
    name: undefined,
    surname: undefined,
    answers: {},
    isWaitingTxConfirmation: false,
  };
};

export const serializeContractQuizResponse = (
  quiz: IContractQuizResponse
): IContractQuiz => {
  const rewards =
    ethers.BigNumber.from(quiz.rewards).toString() == '0'
      ? 0
      : Number(ethers.utils.formatEther(quiz.rewards));

  return {
    title: quiz.title,
    creator: quiz.creator,
    attemptedCount: ethers.BigNumber.from(quiz.attemptedCount).toNumber(),
    rewards: rewards.toString(),
    quizCid: quiz.cid,
    quizId: ethers.BigNumber.from(quiz.quizId).toString(),
    created: ethers.BigNumber.from(quiz.created).toNumber(),
    startTime: ethers.BigNumber.from(quiz.startTime).toNumber(),
    endTime: ethers.BigNumber.from(quiz.endTime).toNumber(),
    isActive: quiz.isActive,
    isEnded: quiz.isEnded,
    answers: quiz.answers,
  };
};

export type QuizDappGameStateType = Pick<QuizzesState, 'status'>;

// export const getQuizDappGameState = async (
//   chainId: number
// ): Promise<QuizDappGameStateType> => {
//   return {
//     status: QuizDappStatus.LIVE,
//   };
// };

export const makeDappActiveQuizData = (
  rounds: DappQuizType[]
): ActiveQuizzes => {
  return rounds.reduce((accum, quiz) => {
    return {
      ...accum,
      [quiz.quizId.toString()]: quiz,
    };
  }, {});
};

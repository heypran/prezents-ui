import { ethers } from 'ethers';
import { CHAIN_ID } from '../../config/constants';
import { eventTopics } from '../../store/quizzes/helper';
import {
  ActiveQuizzes,
  DappQuizType,
  IContractQuiz,
  IContractQuizResponse,
  QuizDappStatus,
  QuizzesState,
  UserTxHistoryResponseType,
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

export const getEventsByTopicUrl = (
  topic: string,
  blockStart?: number,
  blockEnd?: number
): string => {
  const start = blockStart ?? 26220000;
  const end = blockEnd ?? 26878294;
  let url = `https://api.covalenthq.com/v1/${CHAIN_ID}/events/topics/${topic}/?format=JSON`;
  return `${url}&starting-block=${start}&ending-block=${end}&key=${process.env.NEXT_PUBLIC_COV_KEY}`;
};

export const getEventCount = async (topic: string): Promise<number> => {
  const quizCreatedURL = getEventsByTopicUrl(topic);
  const reponse = await fetch(quizCreatedURL).catch((e) =>
    console.log('err:', e)
  );
  let total = 0;
  if (reponse && reponse.ok) {
    const jsonData = await reponse.json();
    const { data } = jsonData;
    console.log(`jsonData URL 2 --->`, jsonData.data);
    total = data.pagination.hasMore
      ? data.pagination.page_size * data.pagination.total_count
      : data.items.length;
  }

  //const iface = new ethers.utils.Interface(QuizAbi.abi);
  //iface.getEvent(data.items[2].raw_log_topics[0]),
  //data.items.map((i) => iface.getEvent(i.raw_log_topics[0]))
  // iface.parseLog({ topics: data.items[2].raw_log_topics, data: '0x' })
  return total;
};

export const getTxHistory = async (
  account: string,
  chainId: number
): Promise<UserTxHistoryResponseType | undefined> => {
  const txUrl = `https://api.covalenthq.com/v1/${chainId}/address/${account}/transactions_v2/?&key=${process.env.NEXT_PUBLIC_COV_KEY}`;
  const reponse = await fetch(txUrl).catch((e) => console.log('err:', e));

  if (reponse && reponse.ok) {
    const jsonData = await reponse.json();

    console.log(`jsonData URL 2 --->`, jsonData.data);
    return jsonData.data;
  }
};

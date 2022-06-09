import { IQuestionApiResponse, IQuiz, IQuizAnswer } from '../types';
import { Web3Storage } from 'web3.storage';
import { message } from 'antd';
import { getQuizAppContract } from '../hooks/contractHelpers';
import { CHAIN_ID } from '../config/constants';
import { ethers } from 'ethers';
import { DappQuizType } from '../state/types';

export default class QuizApiService {
  private static instance: QuizApiService;

  private constructor() {}

  public static getInstance(): QuizApiService {
    if (!QuizApiService.instance) {
      QuizApiService.instance = new QuizApiService();
    }
    return QuizApiService.instance;
  }

  public getAllQuizzesByCid = async (): Promise<IQuiz[]> => {
    const quizAppContract = getQuizAppContract(CHAIN_ID);
    const allQuizzes = await quizAppContract.getAllQuizzes();
    const formattedQuizzes = allQuizzes.map((quiz) => this.formatQuiz(quiz));
    return formattedQuizzes;
  };

  public getActiveQuizzes = async (): Promise<DappQuizType[]> => {
    const quizAppContract = getQuizAppContract(CHAIN_ID);
    const allQuizzes = await quizAppContract.getAllQuizzes();
    const formattedQuizzes = allQuizzes.map((quiz) => this.formatQuiz(quiz));
    return formattedQuizzes;
  };

  public getAllQuizzesByUser = async (
    userAddress: string
  ): Promise<IQuiz[]> => {
    const quizAppContract = getQuizAppContract(CHAIN_ID);
    const quizzes = await quizAppContract.getQuizByUser(userAddress);

    const spred = quizzes.map((quiz) => {
      return this.formatQuiz(quiz);
    });

    return spred;
  };

  public getUserQuizIds = async (userAddress: string): Promise<number[]> => {
    const quizAppContract = getQuizAppContract(CHAIN_ID);

    try {
      const quizIds = await quizAppContract.getUserQuizIds(userAddress);

      return quizIds.map((n) => ethers.BigNumber.from(n).toNumber());
    } catch (e) {
      console.log('err:', e);
    }

    return [];
  };

  public getUserAttemptedQuizIds = async (
    userAddress: string
  ): Promise<number[]> => {
    const quizAppContract = getQuizAppContract(CHAIN_ID);

    try {
      const quizIds = await quizAppContract.getUserAttemptedQuizIds(
        userAddress
      );

      return quizIds.map((n) => ethers.BigNumber.from(n).toNumber());
    } catch (e) {
      console.log('err:', e);
    }

    return [];
  };

  public getContractQuizById = async (quizId: string): Promise<IQuiz> => {
    const quizAppContract = getQuizAppContract(CHAIN_ID);
    const quizzes = await quizAppContract.getQuizDetails(quizId);

    return this.formatQuiz(quizzes);
  };

  // deprecate
  public getSubmittedAnswer = async (
    userAddress: string,
    quizId: string
  ): Promise<number[]> => {
    const quizAppContract = getQuizAppContract(CHAIN_ID);
    try {
      const answersArray = await quizAppContract.getSubmittedAnswer(
        userAddress,
        quizId
      );

      return answersArray;
    } catch (e) {}

    return [];
  };

  public getSubmittedQuizAnswer = async (
    userAddress: string,
    quizId: string
  ): Promise<IQuizAnswer | undefined> => {
    const quizAppContract = getQuizAppContract(CHAIN_ID);
    try {
      const quizAnswer = await quizAppContract.getSubmittedQuizAnswer(
        userAddress,
        quizId
      );

      const rewards =
        ethers.BigNumber.from(quizAnswer.redeemedRewards).toString() == '0'
          ? 0
          : Number(ethers.utils.formatEther(quizAnswer.redeemedRewards));
      return {
        quizId: ethers.BigNumber.from(quizAnswer.quizId).toNumber(),
        user: quizAnswer.user,
        redeemedRewards: rewards,
        submissionTime: quizAnswer.submissionTime,
        answers: quizAnswer.answers,
      };
    } catch (e) {
      console.log('Error: ', e);
    }
  };

  public getQuizByCid = async (
    quizCid: string
  ): Promise<IQuestionApiResponse> => {
    const client = this.makeStorageClient();
    const resp = await client.get(quizCid);
    if (!resp?.ok) {
      throw new Error(`Falied to get ${quizCid}`);
    }
    const files = await resp.files();
    return JSON.parse(await files[0].text())?.['data'];
  };

  public createQuiz = async (payload: any): Promise<string> => {
    const client = this.makeStorageClient();

    const cid = await client.put(this.makeFileObject(payload), {
      onRootCidReady: (localCid) => {
        message.info(`> 🔑 locally calculated Content ID: ${localCid} `);
        message.info('> 📡 sending files to web3.storage ');
      },
      onStoredChunk: (bytes) =>
        message.info(
          `> 🛰 sent ${bytes.toLocaleString()} bytes to web3.storage`
        ),
    });

    message.info(`https://dweb.link/ipfs/${cid}`);

    return cid;
  };

  private makeFileObject = (payload: any, filename?: string): File[] => {
    const obj = payload;
    const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' });

    const files = [new File([blob], filename ?? 'qap1.json')];
    return files;
  };
  private makeStorageClient = (): Web3Storage => {
    return new Web3Storage({ token: this.getStorageToken() });
  };
  private getStorageToken = (): string => {
    // TODO move to env
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEFGMDlGZTAzMUM5RTZiNmEyNUIzYjE1RkMxOEZFODY1ZGQ1MjgxZjQiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NTE5NTYwMTYxNTUsIm5hbWUiOiJxYXAxIn0.KvoSD_WJOtO1IHg-CA32IEL3ZEpssiM3UV9GsK3KPcE';
  };

  private formatQuiz = (quiz): IQuiz => {
    const rewards =
      ethers.BigNumber.from(quiz.rewards).toString() == '0'
        ? 0
        : Number(ethers.utils.formatEther(quiz.rewards));

    return {
      title: quiz.title,
      creator: quiz.creator,
      attemptedCount: ethers.BigNumber.from(quiz.attemptedCount).toNumber(),
      rewards: rewards,
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
}

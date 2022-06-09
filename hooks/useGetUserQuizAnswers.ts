import { useEffect, useState } from 'react';
import QuizApiService from '../services/quizApi';
import { IQuizAnswer } from '../types';

export const useGetUserQuizAnswers = (
  user: string,
  quizContractId: string,
  chainId: number
): { userQuizAnswer: IQuizAnswer | undefined } => {
  const [userQuizAnswer, setUserQuizAnswer] = useState<
    IQuizAnswer | undefined
  >();

  useEffect(() => {
    if (user == null || quizContractId == null || chainId == null) {
      return;
    }

    (async () => {
      try {
        const userQuizAnswer =
          await QuizApiService.getInstance().getSubmittedQuizAnswer(
            user,
            quizContractId
          );

        setUserQuizAnswer(userQuizAnswer);
      } catch (e) {
        console.log('error', e);
      }
    })();
  }, [user, quizContractId, chainId]);

  return { userQuizAnswer };
};

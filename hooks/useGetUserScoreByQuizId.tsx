import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { getQuizAppContract } from './contractHelpers';

export const useGetUserScoreByQuizId = (
  user: string,
  quizId: string,
  chainId: number
): { score: number | undefined; rewards: string | undefined } => {
  const [score, setScore] = useState<number | undefined>();
  const [rewards, setRewards] = useState<string | undefined>();

  useEffect(() => {
    if (user == null || chainId == null || quizId == null) {
      return;
    }

    (async () => {
      try {
        const quizAppContract = getQuizAppContract(chainId);
        const rewards = await quizAppContract.calculateRewards(user, quizId);
        const score = await quizAppContract.calculateScore(user, quizId);

        setScore(ethers.BigNumber.from(score).toNumber());
        setRewards(ethers.utils.formatUnits(rewards));
      } catch (e) {}
    })();
  }, [user, quizId, chainId]);

  return { score, rewards };
};

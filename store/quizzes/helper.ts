import { ethers } from 'ethers';

export const eventTopics = {
  quizCreated: ethers.utils.id('QuizCreated(uint256,address,string)'),
  quizUpdated: ethers.utils.id('QuizUpdated(uint256,address,string)'),
  quizStarted: ethers.utils.id('QuizStarted(uint256,address,string)'),
  quizEnded: ethers.utils.id('QuizEnded(uint256,address,string)'),
  quizSubmitted: ethers.utils.id('QuizAnswerSubmitted(uint256,address)'),
  rewardRedemption: ethers.utils.id(
    'RewardRedemption(address,uint256,uint256)'
  ),
};

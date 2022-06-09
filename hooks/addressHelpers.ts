import { contractAddresses } from '../config/constants';

export const getQuizAppContractAddress = (selectedChainId: number): string => {
  return (
    (contractAddresses.quizApp?.[selectedChainId.toString()] as string) ??
    '0xF2ead98fE64c78aCe842B8E5BE8691444910f151'
  );
};

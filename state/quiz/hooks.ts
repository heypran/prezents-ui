import { useSelector } from 'react-redux';
import { State } from '../types';

export const useGetQuizDappStatus = () => {
  return useSelector((state: State) => state);
};

export const useGetUserAccount = (): string | undefined => {
  return useSelector((state: State) => state.quizDapp.name);
};

export const useGetTxWaitingConfirmation = (): boolean => {
  return useSelector((state: State) => state.quizDapp.isWaitingTxConfirmation);
};

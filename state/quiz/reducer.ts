import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import merge from 'lodash/merge';
import pickBy from 'lodash/pickBy';
import QuizAbi from '../../abi/QiuzApp.json';
import { DappQuizType, QuizDappStatus, QuizzesState } from '../types';
import { CHAIN_ID } from '../../config/constants';
import { getQuizAppContract } from '../../hooks/contractHelpers';
import {
  getEventCount,
  getEventsByTopicUrl,
  getQuizDappGameState,
  getTxHistory,
  makeDappActiveQuizData,
  serializeContractQuizResponse,
} from './helpers';
import QuizApiService from '../../services/quizApi';
import { getQuizAppContractAddress } from '../../hooks/addressHelpers';
import { ethers } from 'ethers';
import { eventTopics } from '../../store/quizzes/helper';

const initialState: QuizzesState = {
  status: QuizDappStatus.INITIAL,
  userId: undefined,
  name: undefined,
  surname: undefined,
  isFetchingStats: false,
  dappStats: {},
  answers: {},
  isWaitingTxConfirmation: false,
  activeQuizzes: {},
  userTxHistory: undefined,
  isFetchingUserHistory: false,
  leaderboard: {
    selectedAddress: null,
    loadingState: false,
    filters: {
      address: null,
      orderBy: '',
      timePeriod: 'all',
    },
    skip: 0,
    hasMoreResults: true,
    addressResults: {},
    results: [],
  },
};

// Thunks
type QuizDappInitialization = QuizzesState;

enum QuizDappReducer {
  Initialize = 'initialize',
  FetchQuizDappState = 'fetchQuizDappState',
  FetchQuiz = 'fetchquiz',
  FetchActiveQuizzes = 'fetchActiveQuzzez',
}

export const initializeQuizDapp = createAsyncThunk<
  QuizDappInitialization,
  string | undefined
>(QuizDappReducer.Initialize, async (account) => {
  const quizDappState = await getQuizDappGameState(Number(CHAIN_ID));

  if (!account) {
    return quizDappState;
  }

  return quizDappState;
});

export const fetchQuiz = createAsyncThunk<DappQuizType, number>(
  QuizDappReducer.FetchQuiz,
  async (quizId) => {
    const quizAppContract = getQuizAppContract(CHAIN_ID);
    const quiz = await quizAppContract.getQuizDetails(quizId);
    return serializeContractQuizResponse(quiz);
  }
);

export const fetchActiveQuizzes = createAsyncThunk<{
  [key: string]: DappQuizType;
}>(QuizDappReducer.FetchActiveQuizzes, async () => {
  const quizzes = await QuizApiService.getInstance().getActiveQuizzes();

  return quizzes.reduce((accum, quiz: DappQuizType) => {
    if (!quiz) {
      return accum;
    }

    return {
      ...accum,
      [quiz.quizId.toString()]: quiz,
    };
  }, {});
});

export const fetchStats = createAsyncThunk<any>(
  'quizdapp/fetchStats',
  async () => {
    let totalCreated = 0;
    let totalRewardsRedeemed = 0;
    let totalParticipants = 0;
    //https://api.covalenthq.com/v1/80001/events/address/0xbCC444a2dA43278333A071d6De0480EB065f4173/?starting-block=26560000&ending-block=26678294&key=ckey_b1aa2527c82c4e8faca53c01c65
    // const url = `https://api.covalenthq.com/v1/${CHAIN_ID}/events/address/${`0xbCC444a2dA43278333A071d6De0480EB065f4173`}/?starting-block=26440000&ending-block=${26678294}&key=${
    //   process.env.NEXT_PUBLIC_COV_KEY
    // }`;
    totalCreated = await getEventCount(eventTopics.quizCreated);
    totalRewardsRedeemed = await getEventCount(eventTopics.rewardRedemption);
    totalParticipants = await getEventCount(eventTopics.quizSubmitted);
    // const response = await fetch(url).catch((e) => console.log('err:', e));
    // const response2 = await fetch(url2).catch((e) => console.log('err:', e));

    // if (response2 && response2.ok) {
    //   const jsonData = await response2.json();
    //   const { data } = jsonData;
    //   console.log(`jsonData URL 2 --->`, jsonData.data);
    //   totalCreated = data.pagination.hasMore
    //     ? data.pagination.page_size * data.pagination.total_count
    //     : data.items.legth;
    // }
    //console.log('fetchStats----->', response?.json());
    // const events = response.data.items.map(i=>i.raw_log_tpics)

    // if (response && response.ok) {
    //   const jsonData = await response.json();
    //   const { data } = jsonData;

    //   const parsedItems = data.items.map((item) => {
    //     console.log(`item--->`, item);
    //     const topic = item.raw_log_topics.map((i) => {
    //       console.log('i----_>', i);
    //       return ethers.utils.toUtf8String(i);
    //     });
    //     console.log('topic------->', topic);
    //     return topic;
    //   });

    //   return parsedItems;
    // }
    return { totalCreated, totalParticipants, totalRewardsRedeemed };
  }
);

export const fetchUserTxHistory = createAsyncThunk<any, { account: string }>(
  'quizdapp/fetchUserTxHistory',
  async ({ account }) => {
    const txHistory = await getTxHistory(account, CHAIN_ID);
    console.log('txHistroy', txHistory);

    return txHistory;
  }
);

export const fetchQuizDappState = createAsyncThunk<QuizzesState>(
  QuizDappReducer.FetchQuizDappState,
  async () => {
    const remoteGameState = await getQuizDappGameState(
      Number(process.env.NEXT_PUBLIC_CHAIN_ID_HARMONY)
    );
    return remoteGameState;
  }
);

export const quizDappSlice = createSlice({
  name: 'quizDapp',
  initialState,
  reducers: {
    setUserAccount: (
      state,
      action: PayloadAction<{ account: string; chainId: number }>
    ) => {
      state.name = action.payload.account;
      state.surname = action.payload.chainId;
    },
    setTxWaiting: (state, action: PayloadAction<boolean>) => {
      state.isWaitingTxConfirmation = action.payload;
    },

    setSelectedAddress: (state, action: PayloadAction<string>) => {
      state.leaderboard.selectedAddress = action.payload;
    },
  },
  extraReducers: (builder) => {
    // builder.addCase(resetUserState, (state) => {
    //   state.userId = '';
    //   state.surname = '';
    //   state.name = '';
    // });

    // Claimable statuses
    // builder.addCase(fetchClaimableStatuses.fulfilled, (state, action) => {
    //   state.claimableStatuses = merge(
    //     {},
    //     state.claimableStatuses,
    //     action.payload
    //   );
    // });

    // Get static game state
    builder.addCase(fetchQuizDappState.fulfilled, (state, action) => {
      const {
        status,
        userId,
        surname,
        name,
        isWaitingTxConfirmation,
        activeQuizzes,
      } = action.payload;

      state.status = status;
      state.userId = userId;
      state.surname = surname;
      state.name = name;
      state.isWaitingTxConfirmation = isWaitingTxConfirmation;
      state.activeQuizzes = activeQuizzes;
    });

    // Initialize sevenupdown
    builder.addCase(initializeQuizDapp.fulfilled, (state, action) => {
      const activeQuizzes = [];

      // for (let i = lastRoundId; i <= lastRoundId + FUTURE_ROUND_COUNT; i++) {
      //   futureRounds.push(makeFutureRoundResponse(lastRoundId+1))
      // }

      return {
        ...state,
        ...action.payload,
        activeQuizzes: merge({}, makeDappActiveQuizData(activeQuizzes)),
      };
    });

    // Get single round
    builder.addCase(fetchQuiz.fulfilled, (state, action) => {
      state.activeQuizzes = merge({}, state.activeQuizzes, {
        [action.payload.quizId.toString()]: action.payload,
      });
    });

    // Get multiple rounds
    builder.addCase(fetchActiveQuizzes.fulfilled, (state, action) => {
      const allRoundData = merge({}, state.activeQuizzes, action.payload);

      // Take always last PAST_ROUND_COUNT items
      //   const newRoundsData = pickby(allRoundData, (value, key) => {
      //     return Number(key) > state.currentEpoch - PAST_ROUND_COUNT;
      //   });
      //   console.log(`newRoundsData==>`, newRoundsData);
      state.activeQuizzes = allRoundData;
    });

    builder.addCase(fetchUserTxHistory.pending, (state) => {
      state.isFetchingStats = true;
    });
    builder.addCase(fetchUserTxHistory.rejected, (state) => {
      state.isFetchingStats = false;
    });
    builder.addCase(fetchUserTxHistory.fulfilled, (state, action) => {
      const dataReceived = action.payload;
      console.log('datareceived', dataReceived);
      state.isFetchingUserHistory = false;
      state.userTxHistory = dataReceived;
    });

    builder.addCase(fetchStats.pending, (state) => {
      state.isFetchingStats = true;
    });
    builder.addCase(fetchStats.rejected, (state) => {
      state.isFetchingStats = false;
    });
    builder.addCase(fetchStats.fulfilled, (state, action) => {
      const respnse = action.payload;

      state.dappStats = respnse;
    });
  },
});

// Actions
export const { setSelectedAddress, setTxWaiting, setUserAccount } =
  quizDappSlice.actions;

export default quizDappSlice.reducer;

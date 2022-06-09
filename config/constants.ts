export const nextServerAPI = process.env.NEXT_PUBLIC_SERVER_BASE_URL;

export const contractAddresses: Record<string, Record<string, string>> = {
  quizApp: {
    '137': '0xe69DdAeb729E011669060cF80bdA130FEC511bc7', // replace with mainnet addr
    '80001': '0xbCC444a2dA43278333A071d6De0480EB065f4173',
    '83': '0x7bf7CE971c97Af16A38C8429575b289BCd81A7E8',
  },
};

export const CHAIN_ID = 80001;
export const QUIZ_LENGTH = 4;

export const link = 'https://www.prezents.xyz';
export const appName = 'prezents';

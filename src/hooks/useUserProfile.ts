import { useWeb3 } from '../contexts/Web3Context';
import { useState } from 'react';

const defaultProfile = {
  profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg',
  name: 'John Doe',
  age: 32,
};

export function useUserProfile() {
  const { account } = useWeb3();
  const [profile, setProfile] = useState({ ...defaultProfile });

  const ensName = account ? `${account.slice(0, 6)}...${account.slice(-4)}.eth` : '';

  return {
    ...profile,
    ensName,
    setProfile,
  };
} 
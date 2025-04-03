import { mockProfiles } from '../data/mockProfiles';

// Simulating API calls with local data
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getProfiles = () => {
  return Promise.resolve(mockProfiles);
};

export const getProfileById = (id) => {
  const profile = mockProfiles.find(profile => profile.id === id);
  if (!profile) {
    return Promise.reject(new Error("Profile not found"));
  }
  return Promise.resolve(profile);
};

export const createProfile = async (profileData) => {
  await delay(1000);
  const newProfile = {
    id: mockProfiles.length + 1,
    ...profileData
  };
  mockProfiles.push(newProfile);
  return newProfile;
};

export const updateProfile = async (id, profileData) => {
  await delay(1000);
  const index = mockProfiles.findIndex(p => p.id === Number(id));
  if (index === -1) throw new Error("Profile not found");
  
  const updatedProfile = { ...mockProfiles[index], ...profileData };
  mockProfiles[index] = updatedProfile;
  return updatedProfile;
};

export const deleteProfile = async (id) => {
  await delay(800);
  const index = mockProfiles.findIndex(p => p.id === Number(id));
  if (index === -1) throw new Error("Profile not found");
  
  mockProfiles.splice(index, 1);
  return { success: true };
};
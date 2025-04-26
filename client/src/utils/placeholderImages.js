// Placeholder base64 images for employee profiles
// Simple silhouettes for male and female employees when no image is uploaded

export const maleProfileImage = '/juniorjoyhr.jpg';
export const femaleProfileImage = '/juniorjoyhr.jpg';

// Function to get profile image based on gender
export const getProfileImageByGender = (gender) => {
  return gender === 'Female' ? femaleProfileImage : maleProfileImage;
};

export default {
  maleProfileImage,
  femaleProfileImage,
  getProfileImageByGender,
};

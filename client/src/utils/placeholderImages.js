// Placeholder base64 images for employee profiles
// Simple silhouettes for male and female employees when no image is uploaded

const placeholderImages = {
  employee: '/placeholders/employee.png',
  user: '/placeholders/user.png',
  training: '/placeholders/training.png',
  department: '/placeholders/department.png',
  company: '/placeholders/company.png',
  logo: '/juniorjoyhr.jpg',
  maleProfile: '/juniorjoyhr.jpg',
  femaleProfile: '/juniorjoyhr.jpg'
};

// Function to get profile image based on gender
export const getProfileImageByGender = (gender) => {
  return gender === 'Female' ? placeholderImages.femaleProfile : placeholderImages.maleProfile;
};

export default placeholderImages;

import { InAppReview } from '@capgo/capacitor-in-app-review';

export const requestAppReview = async () => {
  try {
    const result = await InAppReview.requestReview();
    return result;
  } catch (error) {
    console.error('Failed to request app review:', error);
    return null;
  }
};

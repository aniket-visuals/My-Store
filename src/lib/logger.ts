export const logError = (context: string, error: any) => {
  console.error(`[${context}] Error:`, error);
  // Future: send to an error tracking service like Sentry or LogRocket
};

export const logInfo = (context: string, message: string, data?: any) => {
  console.log(`[${context}] ${message}`, data || '');
};

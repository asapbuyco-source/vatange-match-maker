/**
 * Simulates an MTN Mobile Money payment request.
 * In a real app, this would hit a backend endpoint which interacts with the MTN Open API.
 */
export const processMoMoPayment = async (phoneNumber: string, amount: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log(`[MoMo] Initiating payment for ${phoneNumber} of amount ${amount}`);
    
    // Simulate network delay and USSD user interaction time (3 seconds)
    setTimeout(() => {
      const isSuccess = Math.random() > 0.1; // 90% success rate simulation
      
      if (isSuccess) {
        // Return a mock transaction ID
        const transactionId = `MOMO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        resolve(transactionId);
      } else {
        reject(new Error("Payment failed or timed out by user"));
      }
    }, 3000);
  });
};
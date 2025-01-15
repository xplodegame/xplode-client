// In your Express backend
import express from 'express';
import { Connection, PublicKey } from '@solana/web3.js';
import cors from 'cors';

const app = express();
app.use(cors({
  origin: 'http://localhost:5173'
}));
app.use(express.json());

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

app.post('/update-balance', async (req, res) => {
  console.log("the payment is being checked");
  const { user_id, amount, transaction_signature } = req.body;
  
  try {
    // Verify the transaction on Solana
    const tx = await connection.getTransaction(transaction_signature);
    if (tx) {
      // Update user balance in your database
      // ... your database update logic here
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Transaction not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify transaction' });
  }
});

app.listen(8080, () => {
  console.log('Server running on port 8080');
});
import { GraphQLServer } from 'graphql-yoga'
import * as sqlite3 from 'sqlite3'
import {
  allowTrust,
  createAccountInLedger,
  createTrustline,
  payment
} from './utils'

import {
  Asset,
  Keypair,
  Memo,
  Network,
  Operation,
  Server,
  TransactionBuilder
} from 'stellar-sdk'

import { AES, enc } from 'crypto-js'


const ENVCryptoSecret = '4da12d0d-8b0e-4b0a-8b0a-8b0e4b0a8b0e'

const resolvers = {
  
  Query: {
    async user(_, { username }, info) {
      return await getUserByUsername(username)
      
    }
  },
  Mutation: {
    async signup(_, { username }, info) {
      let user = await getUserByUsername(username);

      if (user) {
        return user;
      }

      const keypair = Keypair.random();

      const secret = AES.encrypt(keypair.secret(), ENVCryptoSecret).toString();

      const data = {
        username,
        stellarAccount: keypair.publicKey(),
        stellarSeed: secret,
      };

      user = await createUser(data);


      /*
        In a production app, you don't want to block to do this
        operation or have the keys to create accounts in this same
        app. Use something like AWS lambda, or a separate system to
        provision the Stellar account.
      */
      await createAccountInLedger(keypair.publicKey())
      await createTrustline(keypair)
      await allowTrust(keypair.publicKey())
      await payment(
        // keypair for issuing account - no bueno, we'll replace this later
        Keypair.fromSecret('SBYZ5NEJ34Y3FTKADVBO3Y76U6VLTREJSW4MXYCVMUBTL2K3V4Y644UX'),
        keypair.publicKey(),
        '10'
      )

      return user
    },
    /*
      For production apps don't rely  on the API to send you the senderUsername!

      It should be based on the Auth/session token.
    */
    async payment(_, { amount, senderUsername, recipientUsername, memo }, info) {
      const result= await getUsersByUsernameArray([senderUsername, recipientUsername]);
      if (!Array.isArray(result)) {
        throw new Error('Invalid result data');
      }

      const sender = result.find(u => u.username === senderUsername)
      const recipient = result.find(u => u.username === recipientUsername)

      const signerKeys = Keypair.fromSecret(
        // Use something like KMS in production
        AES.decrypt(
          sender.stellarSeed,
          ENVCryptoSecret
        ).toString(enc.Utf8)
      )

      try {
        const { hash } = await payment(
          signerKeys,
          recipient.stellarAccount,
          amount
        )

        return { id: hash }
      } catch (e) {
        console.log(`failure ${e}`)

        throw e
      }
    },
    async credit(_, { amount, username }, info) {
      let user:any = await getUserByUsername(username);

      if (!user) {
        throw new Error('User not found');
      }

      try {
        const { hash } = await payment(
          // keypair for issuing account - no bueno
          Keypair.fromSecret('SBYZ5NEJ34Y3FTKADVBO3Y76U6VLTREJSW4MXYCVMUBTL2K3V4Y644UX'),
          user.stellarAccount,
          amount
        )

        return { id: hash }
      } catch (e) {
        console.log(`failure ${e}`)

        throw e
      }
    },
    async debit(_, { amount, username }, info) {
      let user:any = await getUserByUsername(username);

      if (!user) {
        throw new Error('User not found');
      }
      const keypair = Keypair.fromSecret(
        AES.decrypt(
          user.stellarSeed,
          ENVCryptoSecret
        ).toString(enc.Utf8)
      )

      // When you send back a custom asset to the issuing account, the
      // asset you send back get destroyed
      const issuingAccount = 'GBX67BEOABQAELIP2XTC6JXHJPASKYCIQNS7WF6GWPSCBEAJEK74HK36'

      try {
        const { hash } = await payment(
          keypair,
          issuingAccount,
          amount
        )

        console.log(`account ${keypair.publicKey()} debited - now transfer real money to ${username} bank account`)

        return { id: hash }
      } catch (e) {
        console.log(`failure ${e}`)

        throw e
      }
    }
  },
}
const db=new sqlite3.Database(':memory:');
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT,
    stellarAccount TEXT,
    stellarSeed TEXT
  )
`);
async function getUserByUsername(username) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });
}

async function createUser(data) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO users (username, stellarAccount, stellarSeed) VALUES (?, ?, ?)',
      [data.username, data.stellarAccount, data.stellarSeed],
      function (err) {
        if (err) reject(err);
        resolve({ id: this.lastID });
      }
    );
  });
}
async function getUsersByUsernameArray(usernames) {
  return new Promise((resolve, reject) => {
    const placeholders = usernames.map(() => '?').join(',');
    const query = `SELECT * FROM users WHERE username IN (${placeholders})`;
    
    db.all(query, usernames, (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
}

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    db
  }),
})
server.start(() => console.log('Server is running on http://localhost:4000'))

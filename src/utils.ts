import {
  Asset,
  Keypair,
  Memo,
  Network,
  Operation,
  Server,
  TransactionBuilder
} from 'stellar-sdk'


// export const AstroDollar = new Asset(
//   'AstroDollar',
//   'GC2BKLYOOYPDEFJKLKY6FNNRQMGFLVHJKQRGNSSRRGSMPGF32LHCQVGF'
// )
export const asset =  Asset.native()
//critical data 
const secretKey="SDFMDZI3GG3SJ3RNY4IA7D5NQAKB52Z5L6FZNMLHP6FK34IKWMF2P7OF"
export async function createAccountInLedger(newAccount: string) {
  try {
    Network.useTestNetwork();
    const stellarServer = new Server('https://horizon-testnet.stellar.org');
    const provisionerKeyPair = Keypair.fromSecret(secretKey)
    console.log(provisionerKeyPair.publicKey())
    const provisioner = await stellarServer.loadAccount(provisionerKeyPair.publicKey())

    console.log('creating account in ledger', newAccount)

    const transaction = new TransactionBuilder(provisioner)
      .addOperation(
        Operation.createAccount({
          destination: newAccount,
          startingBalance: '2'
        })
      ).build()

    transaction.sign(provisionerKeyPair)

    const result = await stellarServer.submitTransaction(transaction);
    console.log('Account created: ', result)
  } catch (e) {
    console.log('Stellar account not created.',e.message)
  }
}

export async function createTrustline(accountKeypair: Keypair) {
  Network.useTestNetwork();
  const stellarServer = new Server('https://horizon-testnet.stellar.org');

  try {
    const account = await stellarServer.loadAccount(accountKeypair.publicKey())
    const transaction = new TransactionBuilder(account)
      .addOperation(
        Operation.changeTrust({
          asset: asset
        }))
      .build();

    transaction.sign(accountKeypair)

    const result = await stellarServer.submitTransaction(transaction)

    console.log('trustline created from  account to issuer and signers updated', result)

    return result
  } catch (e) {
    console.log('create trustline failed.', e.message)
  }
}

export async function allowTrust(trustor: string) {
  Network.useTestNetwork();
  const stellarServer = new Server('https://horizon-testnet.stellar.org');

  try {
    // Never store secrets in code! Use something like KMS and put
    // this somewhere were few people can access it.
    const issuingKeys = Keypair.fromSecret(secretKey)
    const issuingAccount = await stellarServer.loadAccount(issuingKeys.publicKey())

    const transaction = new TransactionBuilder(issuingAccount)
      .addOperation(
        Operation.allowTrust({
          trustor,
          assetCode: asset.code,
          authorize: true
        })
      )
      .build();

    transaction.sign(issuingKeys);

    const result = await stellarServer.submitTransaction(transaction)

    console.log('trust allowed')

    return result
  } catch (e) {
    console.log('allow trust failed', e)
  }
}

export async function payment(signerKeys: Keypair, destination: string, amount: string) {
  Network.useTestNetwork();
  const stellarServer = new Server('https://horizon-testnet.stellar.org');

  const account = await stellarServer.loadAccount(signerKeys.publicKey())

  let transaction = new TransactionBuilder(account)
    .addOperation(
      Operation.payment({
        destination,
        asset: asset,
        amount
      })
    )
    .build()

  transaction.sign(signerKeys)

  console.log(`sending ${amount} from ${signerKeys.publicKey()} to ${destination} `)
  try {
    const result = await stellarServer.submitTransaction(transaction)

    return result
  } catch (e) {
    console.log(`failure ${e.message}`)
    throw e
  }
}

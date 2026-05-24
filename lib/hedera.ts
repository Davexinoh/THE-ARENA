import { Client, TopicMessageSubmitTransaction, AccountId, PrivateKey } from '@hashgraph/sdk'

function getClient() {
  const client = Client.forTestnet()
  client.setOperator(
    AccountId.fromString(process.env.HEDERA_ACCOUNT_ID!),
  PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY!)
  )
  return client
}

export async function anchorVerdict(payload: object): Promise<string> {
  const client = getClient()

  const tx = await new TopicMessageSubmitTransaction({
    topicId: process.env.HEDERA_TOPIC_ID!,
    message: JSON.stringify(payload),
  }).execute(client)

  const receipt = await tx.getReceipt(client)
  return tx.transactionId.toString()
}
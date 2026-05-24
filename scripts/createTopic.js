const { Client, TopicCreateTransaction, AccountId, PrivateKey } = require('@hashgraph/sdk')

async function main() {
  const client = Client.forTestnet()
  client.setOperator(
    AccountId.fromString(process.env.HEDERA_ACCOUNT_ID),
    PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY)
  )

  const tx = await new TopicCreateTransaction().execute(client)
  const receipt = await tx.getReceipt(client)
  console.log('Topic ID:', receipt.topicId.toString())
  client.close()
}

main().catch(console.error)
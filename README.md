# Polymer Registry POC

This repo is a first template to start efforts towards a Polymer chain registry.

## Context

Polymer, as an interoperability hub implementing IBC in the Ethereum rollup ecosystem, interacts with a large number of connected rollups and others chains from the IBC network. Internally, IBC keeps tracks of counterparty chains through the abstraction of an IBC client. Furthermore there are the connection and channel abstractions that make up the IBC transport layer. A dApp developer ideally only has to interact with the channel they want to send packets over and the customizable security-cost-latency trade-off profile that IBC clients provide.

To make this more developer friendly, the Polymer registry keeps track of the mapping between chains and clientIDs, manages the connection hops when channels need to be created etc.

## Chain identifiers

On-chain on Polymer, connected chains are not kept track of. Instead client IDs are the unique identifiers that map to a certain chain (identified by a domain-specific naming convention, e.g. the EIP-155 numerical chainID for ETH ecosystem chains).

To ensure the mapping of clientIDs to chains there's a few options:

- relayers add the chainID as input in a client memo field
- an off-chain registry keeps track of the mapping
- an on-chain module (chain naming service) keeps track of the mapping

While the first option might be sufficient when the format is followed and relayers at client creation are honest, the permissionless nature of relayers could lead to consistency or security issues.

While the latter option is ideal in terms of decentralization, it requires additional development work and thus remains a roadmap item.

For now, the off-chain registry found here provides the necessary social consensus for the clientID -> chain mapping along with other network information and IBC (for Polymer Hub) configuration data.

## Adding chains

Chain network and IBC info can be added in the /chains directory.

Each chain has a dedicated .json file that should be named according to:

`namespace-chain-ID.json`

following the [CAIP-2 convention](https://chainagnostic.org/CAIPs/caip-2). For Base Sepolia testnet for example: eip155:84532.json for the chainName eip155:84532.

### Add Polymer IBC data

Network information can be fetched from an [Ethereum chain registry](https://github.com/ethereum-lists/chains/tree/master/_data/chains). Additionally you'll need to add Polymer custom information like so:

```json
  "polymer": {
    "clients": {
      "sim-client" : {
          "clientSuffix": "-sim",
          "canonConnFrom": "connection-4",
          "canonConnTo": "connection-5",
          "universalChannelId": "channel-11",
          "universalChannelAddr": "0x5031fb609569b67608Ffb9e224754bb317f174cD",
          "dispatcherAddr": "0x0dE926fE2001B2c96e9cA6b79089CEB276325E9F"
      },
      "op-client": {
          "clientSuffix": "-proofs-1",
          "canonConnFrom": "connection-10",
          "canonConnTo": "connection-11",
          "universalChannelId": "channel-17",
          "universalChannelAddr": "0x50E32e236bfE4d514f786C9bC80061637dd5AF98",
          "dispatcherAddr": "0xfc1d3e02e00e0077628e8cc9edb6812f95db05dc"
      }
    }
  }
  ```
Providing the information per client on connection hops, universal channel (id and middleware contract) and dispatcher.

### Build single output json file

To combine all required Polymer info into one single json, run:

```sh
node utils/buildOutput.js
```
## Using data from registry to build with Polymer and vIBC

The repo contains a few helper scripts to gain some information that can help trigger a channel handshake from your application.

### Find connection hops for multi-hop IBC channels over Polymer

To find what connection hops you need to input when creating an IBC channel between contracts on supported chains:

```sh
# Usage node utils/findConnectionHops.js <SOURCE CHAIN ID> <DESTINATION CHAIN ID>
node utils/findConnectionHops.js 11155420 84532
```

With example values corresponding to Optimism Sepolia as source and Base Sepolia as destination.

### Get the port ID for your contract on a chain

When creating a channel you'll need to pass in the port ID on the counterparty. To find the prefix, run:

```sh
# Usage: node utils/getPortID.js <EIP155 CHAIN ID> <CONTRACT ADDRESS>
node utils/getPortID.js 84532 0x1234567890AbCdEf1234567890aBcDeF12345678
```
As an example to find the port ID relating to the dummy address '0x1234567890AbCdEf1234567890aBcDeF12345678' on Base Sepolia.

## Client and app mapping

Additionally, there's a mapping where clientfIDs can be mapped to the chainID:
```js
// Example for Base Sepolia
{
    '<clientID>' : 'eip155:84532'
}
```

And applications can register like so:
```js
{
    '0x1234567890AbCdEf1234567890aBcDeF12345678' : {
        name: 'DummyApp',
        icon: 'https://dummyapp.com/icon.png',
        url: 'https://dummyapp.com'
    }
}
```

## Disclaimer

This registry is a work in progress and currently contains mostly manual input data. Automated fetching as well as solidified conventions will follow.



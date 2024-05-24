const prefix = 'polyibc.'
const eip155ChainID = process.argv[2];
const contractAddr = process.argv[3];

if (!eip155ChainID || !contractAddr) {
  console.error('Usage: node utils/getPortID.js <chainID> <contractAddr>');
  process.exit(1);
}

function getConfig(chainID) {
    return require(`../chains/eip155:${chainID}.json`);
}

function getSimClientPortID(chainID, contractAddr) {
    const simChainID = getConfig(chainID).polymer.clients['sim-client'].clientSuffix;
    return `${prefix}${simChainID}.${contractAddr.slice(2)}`;
}

function getProofClientPortID(chainID, contractAddr) {
    const proofChainID = getConfig(chainID).polymer.clients['op-client'].clientSuffix;
    return `${prefix}${proofChainID}.${contractAddr.slice(2)}`;
}

function main() {
    console.log(`Sim client Port ID: ${getSimClientPortID(eip155ChainID, contractAddr)}`);
    console.log(`Proof client Port ID: ${getProofClientPortID(eip155ChainID, contractAddr)}`);
}

main();

module.exports = {
    getSimClientPortID,
    getProofClientPortID
};

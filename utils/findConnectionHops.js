const source = process.argv[2];
const destination = process.argv[3];

if (!source || !destination) {
  console.log('Usage: node findConnectionHops.js <source> <destination>');
  process.exit(1);
}

function getConfigs(source, destination) {
  const srcConfigPath = `../chains/eip155:${source}.json`;
  const destConfigPath = `../chains/eip155:${destination}.json`;

  const srcConfig = require(srcConfigPath);
  const destConfig = require(destConfigPath);

  return { srcConfig, destConfig };
}

function getConnectionHops (source, destination) {
  const { srcConfig, destConfig } = getConfigs(source, destination);
  
  const simConHops = [srcConfig.polymer.clients['sim-client'].canonConnFrom, destConfig.polymer.clients['sim-client'].canonConnTo];
  const proofsConHops = [srcConfig.polymer.clients['op-client'].canonConnFrom, destConfig.polymer.clients['op-client'].canonConnTo];
  
  return { simConHops, proofsConHops };  
}


function getSimClientConnectionHops(source, destination) {
  const { simConHops } = getConnectionHops(source, destination);
  return simConHops
}

function getProofsClientConnectionHops(source, destination) {
  const { proofsConHops } = getConnectionHops(source, destination);
  return proofsConHops
}

function main() {
  const { srcConfig, destConfig } = getConfigs(source, destination);
  const { simConHops, proofsConHops } = getConnectionHops(source, destination);
  console.log(`Connection hops from ${srcConfig.name} to ${destConfig.name}:`)
  console.log('-'.repeat(80));
  console.log('Sim-client connection hops:', simConHops);
  console.log('Proof-client connection hops:', proofsConHops);  
}

main();

module.exports = {
  getSimClientConnectionHops,
  getProofsClientConnectionHops
};
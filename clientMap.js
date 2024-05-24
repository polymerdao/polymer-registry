// For every client created on Polymer, we need to map it to a chainID
// Chain IDs follow CAIP-2 standard
// For example, 'eip155:1' is the chain ID for Ethereum Mainnet

// The data for the clientMap can be entered manually or be pulled from the client metadata field
// that can be obtained by querying Polymer's API
export const clientMap = {
    'sim-test-0-0' : 'eip155:11155420',
    'sim-test-2-2' : 'eip155:84532',
    'optimism-4-4' : 'eip155:11155420', //deprecated
    'optimism-5-5' : 'eip155:84532', //deprecated
    'sim-test-8-8' : 'eip155:49483',
    'opstack-v2-9-9' : 'eip155:11155420',
    'optimism-10-10' : 'eip155:84532',
};
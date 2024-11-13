const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

// Directory containing the JSON files
const directoryPath = './chains';

// Helper function to verify RPC endpoint
async function verifyRPC(rpcUrl, expectedChainId) {
	try {
		const provider = rpcUrl.startsWith('wss://')
			? new ethers.WebSocketProvider(rpcUrl)
			: new ethers.JsonRpcProvider(rpcUrl);

		const networkChainId = (await provider.getNetwork()).chainId;

		if (rpcUrl.startsWith('wss://')) {
			await provider.destroy();
		}

		const isValid = BigInt(networkChainId) === BigInt(expectedChainId);
		if (!isValid) {
			console.error(`RPC ${rpcUrl} returned wrong chain ID: ${networkChainId} (expected ${expectedChainId})`);
		}
		return isValid;
	} catch (error) {
		console.error(`Failed to verify RPC ${rpcUrl}:`, error.message);
		return false;
	}
}

// Helper function to verify URL accessibility
async function verifyURL(url) {
	try {
		const response = await fetch(url);
		return response.status === 200;
	} catch (error) {
		console.warn(`Failed to verify URL ${url}:`, error.message);
		return false;
	}
}

// Helper function to verify explorer
async function verifyExplorer(explorer) {
	try {
		// First verify the base URL
		const baseResponse = await fetch(explorer.url);
		if (baseResponse.status !== 200) {
			console.warn(`Explorer base URL ${explorer.url} is not accessible`);
			return false;
		}

		// If it's an EIP3091 explorer, also verify block endpoint
		if (explorer.standard === 'EIP3091') {
			const blockUrl = `${explorer.url}/block/1`;
			const blockResponse = await fetch(blockUrl);
			if (blockResponse.status !== 200) {
				console.warn(`Explorer block endpoint ${blockUrl} is not accessible`);
				return false;
			}
		}

		return true;
	} catch (error) {
		console.warn(`Failed to verify explorer ${explorer.url}:`, error.message);
		return false;
	}
}

// Helper function to verify dispatcher address
async function verifyDispatcher(dispatcherAddr, rpcUrl) {
	try {
		const provider = new ethers.JsonRpcProvider(rpcUrl);
		const code = await provider.getCode(dispatcherAddr);
		return code !== '0x'; // Check if address has contract code
	} catch (error) {
		console.warn(`Failed to verify dispatcher ${dispatcherAddr}:`, error.message);
		return false;
	}
}

// Main function to read and process files
async function processFiles(directoryPath) {
	try {
		const files = fs.readdirSync(directoryPath);
		console.log('Files:', files);

		const output = {};
		const verificationPromises = [];

		for (const file of files) {
			if (path.extname(file) === '.json' && file.startsWith('eip155-')) {
				const key = file.slice(7, -5);
				const rawData = fs.readFileSync(path.join(directoryPath, file));
				const jsonData = JSON.parse(rawData);

				output[key] = {};

				// Basic data copying
				if (jsonData.name) output[key].name = jsonData.name;
				if (jsonData.shortName) output[key].shortName = jsonData.shortName;
				if (jsonData.rpc) output[key].rpc = jsonData.rpc;
				if (jsonData.explorers) output[key].explorers = jsonData.explorers;
				if (jsonData.polymer) output[key] = { ...output[key], ...jsonData.polymer };

				// Verification promises
				if (jsonData.rpc && jsonData.rpc.length > 0) {
					verificationPromises.push(async () => {
						const results = await Promise.all(
							jsonData.rpc.map(rpc => verifyRPC(rpc, jsonData.chainId))
						);
						return results.every(result => result === true);
					});
				}

				if (jsonData.infoURL) {
					verificationPromises.push(async () => {
						return await verifyURL(jsonData.infoURL);
					});
				}

				if (jsonData.explorers) {
					verificationPromises.push(async () => {
						const results = await Promise.all(
							jsonData.explorers.map(explorer => verifyExplorer(explorer))
						);
						return results.every(result => result === true);
					});
				}

				if (jsonData.polymer?.dispatcherAddr && jsonData.rpc) {
					verificationPromises.push(async () => {
						return await verifyDispatcher(
							jsonData.polymer.dispatcherAddr,
							jsonData.rpc[0]
						);
					});
				}
			}
		}

		// Run all verifications
		console.log('Running verifications...');
		const results = await Promise.all(verificationPromises.map(fn => fn()));

		// If any verification failed, exit
		if (!results.every(result => result === true)) {
			console.error('\nOutput file not generated due to verification failures.');
			process.exit(1);
		}

		// Ensure dist directory exists
		if (!fs.existsSync('dist')) {
			fs.mkdirSync('dist');
		}

		// Write the output object to 'output.json' in the 'dist' directory
		fs.writeFileSync('dist/output.json', JSON.stringify(output, null, 2));
		console.log('output.json has been generated successfully.');
	} catch (error) {
		console.error('Error processing files:', error);
		process.exit(1);
	}
}

// Call the function with the directory path
processFiles(directoryPath);

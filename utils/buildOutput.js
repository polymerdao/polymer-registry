const fs = require('fs');
const path = require('path');

// Directory containing the JSON files
const directoryPath = './chains'; // Update this path as needed

// Function to read and process files
function processFiles(directoryPath) {
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error("Could not list the directory.", err);
            process.exit(1);
        }
        console.log('Files:', files);

        const output = {};

        files.forEach((file) => {
            // Check if the file is a JSON file
            if (path.extname(file) === '.json' && file.startsWith('eip155:')) {
                // Extract the key from the filename
                const key = file.slice(7, -5); // Remove 'eip-' prefix and '.json' suffix

                // Read the JSON file
                const rawData = fs.readFileSync(path.join(directoryPath, file));
                const jsonData = JSON.parse(rawData);

                // Add the 'polymer' field to the output object
                if (jsonData.polymer) {
                    output[key] = jsonData.polymer;
                }
            }
        });

        // Write the output object to 'output.json' in the  'dist' directory
        fs.writeFileSync('dist/output.json', JSON.stringify(output, null, 2));
        console.log('output.json has been generated successfully.');
    });
}

// Call the function with the directory path
processFiles(directoryPath);

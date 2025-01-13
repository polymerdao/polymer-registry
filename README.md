# Polymer Registry POC

This repo is a first template to start efforts towards a Polymer chain registry.

## Adding chains

Chain network and prover's info can be added in the /chains directory.

Each chain has a dedicated .json file that should be named after the chainID.


### Build single output json file

To combine all required Polymer info into one single json, run:

```sh
node buildOutput.js
```

## Disclaimer

This registry is a work in progress and currently contains mostly manual input data. Automated fetching as well as solidified conventions will follow.



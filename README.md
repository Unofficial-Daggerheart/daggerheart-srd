# Daggerheart SRD Foundry Module

### Unofficial Fan Project

This is an unofficial, fan-created FoundryVTT module for the Daggerheart System. The creator is not associated with Darrington Press.

### Installation

Install the system using this manifest link: `https://github.com/unofficial-daggerheart/daggerheart-srd/releases/latest/download/module.json`

### Contributors Guide

To update information within the packages you need to clone the repository into your local foundry module path and install the required tools. The we have two options:

* Edit the YAML files in the data folder and commit the updated YAML files to GitHub.
* Run the pack command to build the compendiums; open the module in a Foundry World to add or update the items in the compendiums. Once done, close Foundry and use the unpack command to update the YAML files. Then commit those to GitHub.

Please note, we have to follow the license and can only accept SRD content in this repository. Feel free to clone this project and make it your own, but make sure to not share any content that you do not own.

```
npm install
npm run pack
npm run unpack
```

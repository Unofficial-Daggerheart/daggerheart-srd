const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

class NameProcessor {
    constructor(options = {}) {
        this.options = {
            sourceDir: options.sourceDir || './data',
            outputDir: options.outputDir || './updated',
            ...options
        };
    }

    async processAll() {
        console.log(`Starting YAML processing...`);
        console.log(`Source: ${this.options.sourceDir}`);
        console.log(`Output: ${this.options.outputDir}`);

        const files = await this._findYAMLFiles(this.options.sourceDir);
        console.log(`Found ${files.length} YAML files`);

        const results = [];

        for (const file of files) {
            const result = await this._processFile(file);
            results.push(result);
        }

        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        console.log(`\n=== Processing Complete ===`);
        console.log(`✓ Successful: ${successful}`);
        console.log(`✗ Failed: ${failed}`);

        return failed === 0;
    }

    async _processFile(filePath) {
        const content = await fs.readFile(filePath, 'utf8');
        const data = yaml.load(content);
        const out = { ...data };

        // Make sure our names are not full capitals
        out.name = await this._capitalizeName(data.name);
        if (out.prototypeToken) { out.prototypeToken.name = out.name; }

        // Setup the new file path
        const relative = path.relative(this.options.sourceDir, filePath);
        const newFile = `${out.name.replaceAll(' ', '_').replace(/[<>:"/\\|?*]/g, '')}_${out._id}.yml`;
        const outputPath = path.join(this.options.outputDir, path.dirname(relative), newFile);

        await fs.mkdir(path.dirname(outputPath), { recursive: true });

        // Write the transformed YAML
        const yamlOutput = yaml.dump(out, {
            indent: 2,
            lineWidth: 160,
            noRefs: true
        });
        await fs.writeFile(outputPath, yamlOutput, 'utf8');

        return {
            original: filePath,
            new: outputPath,
            success: true
        };
    }

    async _filenameName(str) {
        return str.split(' ').map((word) => {
            if (word === "of" || word === "and") return word.toLowerCase();
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        }).join(' ');
    }

    async _capitalizeName(str) {
        return str.split(' ').map((word) => {
            const chk = word.toLowerCase();
            if (chk === "of" || chk === "and" || chk === "the") return chk;
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        }).join(' ');
    }

    async _findYAMLFiles(dir) {
        const files = [];
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    const subFiles = await this._findYAMLFiles(fullPath);
                    files.push(...subFiles);
                } else if (entry.isFile()) {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            console.error(`Error reading directory ${dir}:`, error.message);
        }
        return files;
    }
}

module.exports = NameProcessor;
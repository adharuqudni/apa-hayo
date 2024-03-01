import fs from 'fs';

export default class JsonDB {
    constructor(filename) {
        this.filename = filename;
        try {
            fs.readFileSync(this.filename);
        } catch (err) {
            fs.writeFileSync(this.filename, '{}');
        }
    }

    readFileSync() {
        return JSON.parse(fs.readFileSync(this.filename));
    }

    writeFileSync(data) {
        fs.writeFileSync(this.filename, JSON.stringify(data));
    }

    set(key, value) {
        const data = this.readFileSync();
        data[key] = value;
        this.writeFileSync(data);
    }

    get(key) {
        const data = this.readFileSync();
        return data[key];
    }

    getAllKeys() {
        const data = this.readFileSync();
        return Object.keys(data);
    }

    getAllValues() {
        const data = this.readFileSync();
        return Object.values(data);
    }

    getAll() {
        return this.readFileSync();
    }
}


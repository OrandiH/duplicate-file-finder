import fs from 'fs'

export function makeStream(callback) {
    const result = fs.createReadStream(workPath);
    return callback(result);
}
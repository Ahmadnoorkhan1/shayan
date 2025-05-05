const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const tmp = require('tmp-promise');
const { uploadFile } = require('./cloudflareStorage');
const ffmpegPath = require('ffmpeg-static');

async function mergeMp3Files(audioUrls,id) {
  const downloadedPaths = [];
  let listFilePath;
  let outputPath;

  try {
    // Step 1: Download MP3s to temp files
    for (let i = 0; i < audioUrls.length; i++) {
      const url = audioUrls[i];
      const response = await axios.get(url, { responseType: 'arraybuffer' });

      const tmpFile = await tmp.file({ postfix: '.mp3' });
      await fs.writeFile(tmpFile.path, response.data);
      downloadedPaths.push(tmpFile.path);
    }

    // Step 2: Create ffmpeg file list
    listFilePath = path.join(__dirname, 'file_list.txt');
    const listContent = downloadedPaths.map(p => `file '${p}'`).join('\n');
    await fs.writeFile(listFilePath, listContent);

    // Step 3: Merge files with ffmpeg
    outputPath = path.join(__dirname, `merged_${Date.now()}.mp3`);
    await new Promise((resolve, reject) => {
      exec(`${ffmpegPath} -f concat -safe 0 -i "${listFilePath}" -c copy "${outputPath}"`, (err, stdout, stderr) => {
        if (err) return reject(new Error(stderr));
        resolve();
      });
    });

    // Step 4: Upload to Cloudflare R2
    const mergedBuffer = await fs.readFile(outputPath);
    const folderPath = `audio/completeAudio/${id}`;
    const publicUrl = await uploadFile(mergedBuffer, path.basename(outputPath), folderPath, 'audio/mpeg');

    return publicUrl;

  } catch (error) {
    console.error("Error merging or uploading MP3 files:", error.message);
    throw error;

  } finally {
    // Cleanup: delete temp files
    try {
      await Promise.allSettled([
        ...downloadedPaths.map(p => fs.unlink(p)),
        listFilePath ? fs.unlink(listFilePath) : null,
        outputPath ? fs.unlink(outputPath) : null
      ]);
    } catch (cleanupError) {
      console.warn('Failed to delete some temporary files:', cleanupError.message);
    }
  }
}

module.exports = mergeMp3Files;

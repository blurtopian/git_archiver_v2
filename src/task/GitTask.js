// const { KoiiStorageClient } = require('@_koii/storage-task-sdk');
import { v4 as uuidv4 } from 'uuid';
const { namespaceWrapper } = require('@_koii/namespace-wrapper');
const fs = require('fs');
const archiver = require('archiver');
const simpleGit = require('simple-git');
const git = simpleGit();

class GitTask {
  constructor(repo) {
    this.repo = repo;
  }

  setRepo(repo) {
    this.repo = repo;
  }

  async clone() {
    // Create a new instance of the Koii Storage Client
    const basePath = await namespaceWrapper.getBasePath();
    const repoName = this.repo.name;
    const cloneDir = `${basePath}/${repoName}`;
    const cloneUrl = this.repo.clone_url;

    try {
      if (!fs.existsSync(cloneDir)) {
        await git.clone(cloneUrl, cloneDir);
        console.log('Repository cloned successfully.');
      } else {
        console.log('Directory already exists. Skipping clone.');
      }
      return 'Clone Done!';
    } catch (error) {
      console.error('Error fetching latest commit:', error);
    } finally {
      // Clean up: remove the temporary directory if needed
      // (Implement cleanup logic here if desired)
      fs.unlinkSync(zipPath);
      fs.rm(cloneDir, { recursive: true, force: true }, err => {
        if (err) {
          console.error(`Error deleting directory: ${err}`);
        } else {
          console.log(`Directory ${cloneDir} deleted successfully.`);
        }
      });

    }
  }

  async checkRepoSize() {
    try {
        const response = await fetch(GITHUB_API_URL, {
            headers: {
                'Authorization': `token YOUR_GITHUB_TOKEN`, // Replace with your GitHub token if needed
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        const data = await response.json();
        if (response.status !== 200) {
            throw new Error(`Failed to fetch repository data: ${data.message}`);
        }

        return data.size * 1024; // Size is returned in KB, convert to bytes
    } catch (error) {
        console.error('Error checking repository size:', error);
        throw error;
    }
}

  async storeFile() {
    const basePath = await namespaceWrapper.getBasePath();
    const repoName = this.repo.name;
    const cloneDir = `${basePath}/${repoName}`;
    const zipPath = `${cloneDir}.zip`;
    try {
      // TODO: Upload via IPFS
      // const client = new KoiiStorageClient();
      // const userStaking = await namespaceWrapper.getSubmitterAccount();
      // const { cid } = await client.uploadFile(zipPath, userStaking);
      const cid = uuidv4();

      console.log(`Stored file CID: ${cid}`);

      return cid;
    } catch (error) {
      console.error('Failed to upload file to IPFS:', error);
      fs.unlinkSync(`${basePath}/${filename}`);
      throw error;
    }
  }

  async cleanup() {
    const basePath = await namespaceWrapper.getBasePath();
    const repoName = this.repo.name;
    const cloneDir = `${basePath}/${repoName}`;
    const zipPath = `${cloneDir}.zip`;
    try {
      fs.unlinkSync(zipPath);
      fs.rm(cloneDir, { recursive: true, force: true }, err => {
        if (err) {
          console.error(`Error deleting directory: ${err}`);
        } else {
          console.log(`Directory ${cloneDir} deleted successfully.`);
        }
      });
    } catch (error) {
      console.error('Failed to delete file/directory:', error);
      throw error;
    }
  }

  async zipRepo() {
    const basePath = await namespaceWrapper.getBasePath();
    const repoName = this.repo.name;
    const cloneDir = `${basePath}/${repoName}`;
    const zipPath = `${cloneDir}.zip`;

    console.log(`Zipping the repository into ${zipPath}`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Sets the compression level
    });

    output.on('close', () => {
      console.log(
        `Repository zipped successfully. Total bytes: ${archive.pointer()}`,
      );
    });

    output.on('end', () => {
      console.log('Data has been drained');
    });

    archive.on('warning', err => {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    });

    archive.on('error', err => {
      throw err;
    });

    archive.pipe(output);

    archive.directory(cloneDir, false);

    archive.finalize();
  }

  async getLatestCommit() {
    try {
      // Clone the repository to a temporary directory (or just use a local repo)
      await git.clone(remoteUrl, 'temp-repo', ['--depth', '1']);

      // Change the working directory to the cloned repository
      git.cwd('temp-repo');

      // Get the latest commit
      const log = await git.log({ maxCount: 1 });
      console.log('Latest Commit:', log.latest);
      return log.latest;
    } catch (error) {
      console.error('Error fetching latest commit:', error);
    } finally {
      // Clean up: remove the temporary directory if needed
      // (Implement cleanup logic here if desired)
    }
  }

  async retrieveAndValidateFile(cid) {
    // TODO: instantiate the storage client
    // const client = new KoiiStorageClient();
    // const repoName = this.repo?.name;
    // const filename = `${repoName}.zip`;

    try {
      // get the uploaded file using the IPFS CID we stored earlier and the filename (in this case, `dealsData.json`)
      // const upload = await client.getFile(cid, filename);
      // return whether or not the file exists
      // return !!upload;
      return true;
    } catch (error) {
      console.error('Failed to download or validate file from IPFS:', error);
      throw error;
    }
  }
}

export const gitTask = new GitTask();
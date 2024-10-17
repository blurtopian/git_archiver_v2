import { namespaceWrapper } from "@_koii/namespace-wrapper";
import { gitTask } from './GitTask.js';
import { searchRandomRepo } from './github.js';


export async function task(roundNumber) {
  // Run your task and store the proofs to be submitted for auditing
  // The submission of the proofs is done in the submission function
  try {
    console.log('task called with round', roundNumber);
    const randomRepo = await searchRandomRepo();
    console.log('randomRepo.clone_url', randomRepo.clone_url)
    gitTask.setRepo(randomRepo);
    await gitTask.clone();
    await gitTask.zipRepo();
    const cid = await gitTask.storeFile();
    await gitTask.cleanup();

    await namespaceWrapper.storeSet('cid', cid);
    return 'Done';
  } catch (err) {
    console.error('ERROR IN EXECUTING TASK', err);
    return 'ERROR IN EXECUTING TASK' + err;
  }
}

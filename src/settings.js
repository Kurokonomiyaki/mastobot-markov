import Fs from 'fs';
import mergeOptions from 'merge-options';

/** DEFAULT OPTIONS */
const TOOT_OPTIONS = {
  visibility: 'unlisted',
  sensitive: false,
};
/** */

export const getSettings = (file) => {
  const data = Fs.readFileSync(file);
  if (data == null) {
    throw new Error('Unable to load settings');
  }

  const customSettings = JSON.parse(data);
  let { sourceInstanceUrl, destinationInstanceUrl } = customSettings;
  const { sourceInstanceToken, destinationInstanceToken, sourceAccountId } = customSettings;

  if (sourceInstanceUrl == null || sourceInstanceToken == null || destinationInstanceUrl == null || destinationInstanceToken == null || sourceAccountId == null) {
    throw new Error('access tokens, instance urls and account id are mandatory');
  }
  if (sourceInstanceUrl.endsWith('/') === false) {
    sourceInstanceUrl = `${sourceInstanceUrl}/`;
  }
  if (destinationInstanceUrl.endsWith('/') === false) {
    destinationInstanceUrl = `${destinationInstanceUrl}/`;
  }

  const tootOptions = mergeOptions(TOOT_OPTIONS, customSettings.tootOptions || {});

  const allowedVisibilities = ['public'];
  if (customSettings.ignoreUnlistedMessage == null || customSettings.ignoreUnlistedMessage === false) {
    allowedVisibilities.push('unlisted');
  }
  if (customSettings.ignorePrivateMessage == null || customSettings.ignorePrivateMessage === false) {
    allowedVisibilities.push('private');
  }
  if (customSettings.ignoreDirectMessage === false) {
    allowedVisibilities.push('direct');
  }

  let { minTimeBetweenToots, maxTimeBetweenToots } = customSettings;
  minTimeBetweenToots = minTimeBetweenToots || 120;
  maxTimeBetweenToots = maxTimeBetweenToots || 360;
  if (minTimeBetweenToots > maxTimeBetweenToots) {
    throw new Error('minTimeBetweenToots > maxTimeBetweenToots');
  }

  return {
    sourceInstanceUrl,
    sourceInstanceToken,
    sourceAccountId,
    ignoreDirectMessage: customSettings.ignoreDirectMessage || true,
    ignorePrivateMessage: customSettings.ignorePrivateMessage || false,
    ignoreUnlistedMessage: customSettings.ignoreUnlistedMessage || false,
    ignoreContentWarning: customSettings.ignoreContentWarning || false,
    allowedVisibilities,
    maxPagesToCollect: Math.ceil((customSettings.maxTootsToCollect || 1000000) / 40),
    destinationInstanceUrl,
    destinationInstanceToken,
    tootOptions,
    tootSuffix: customSettings.tootSuffix || null,
    markovOrder: 2,
    minTimeBetweenToots,
    maxTimeBetweenToots,
    sentencesFile: `${__dirname}/../sentences.dat`,
    lastExecutionFile: `${__dirname}/../lastexecution.dat`,
    modelFile: `${__dirname}/../model.json`,
  };
};

export default getSettings;

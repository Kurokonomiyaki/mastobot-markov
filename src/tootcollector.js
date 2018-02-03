import Mastodon from 'mastodon-api';
import Fs from 'fs';

import { parseToot } from './tootparser';
import { delayExecution } from './util';

const processData = async ({ allowedVisibilities, ignoreContentWarning }, toots, fd) => {
  let lastId = -1;
  let nbSentences = 0;
  for (let i = 0; i < toots.length; i += 1) {
    const { content, reblog, visibility, id, spoiler_text } = toots[i];
    if (reblog == null && allowedVisibilities.indexOf(visibility) !== -1 && (ignoreContentWarning === false || spoiler_text == null)) {
      const sentences = await parseToot(content);
      if (sentences != null && sentences.length > 0) {
        nbSentences += sentences.length;
        Fs.writeSync(fd, sentences.join('\n'));
        Fs.writeSync(fd, '\n');
      }
      lastId = id;
    }
  }

  return { lastId, nbSentences };
};

const collectPage = async (settings, instance, fd, requestParams, isFirstPage = false) => {
  const { sourceAccountId, lastExecutionFile } = settings;
  const response = await instance.get(`accounts/${sourceAccountId}/statuses`, requestParams);
  if (response.data == null || response.data.length === 0) {
    return { lastId: -1, nbSentences: 0 };
  }
  if (isFirstPage) {
    console.log('Will collect everything after this toot:', response.data[0].id);
    Fs.writeFileSync(lastExecutionFile, response.data[0].id, 'utf8');
  }

  return processData(settings, response.data, fd);
};

export const collectToots = async (settings) => {
  const { sentencesFile, lastExecutionFile } = settings;
  const instance = new Mastodon({
    access_token: settings.sourceInstanceToken,
    api_url: settings.sourceInstanceUrl,
  });

  let sinceId = null;
  if (Fs.existsSync(lastExecutionFile) && Fs.existsSync(sentencesFile)) {
    sinceId = Fs.readFileSync(lastExecutionFile).toString().trim();
  }
  let nbNewSentences = 0;
  let maxId = null;

  const fd = Fs.openSync(sentencesFile, 'a');

  console.log('Collecting first page:', maxId, sinceId);

  for (let i = 0; i < settings.maxPagesToCollect; i += 1) {
    const requestParams = { limit: 40 };
    if (sinceId != null) {
      requestParams.since_id = sinceId;
    }
    if (maxId != null) {
      requestParams.max_id = maxId;
    }

    const { lastId, nbSentences } = await delayExecution(() => collectPage(settings, instance, fd, requestParams, i === 0));

    console.log('Collecting next page:', lastId, sinceId);
    if (lastId === -1) {
      break;
    }

    maxId = lastId;
    nbNewSentences += nbSentences;
  }

  Fs.closeSync(fd);
  return nbNewSentences;
};

export default collectToots;

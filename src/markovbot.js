
import Mastodon from 'mastodon-api';

import { getSettings } from './settings';
import { collectToots } from './tootcollector';
import { updateModelFromFile, generateSentence } from './markovmodel';

const toot = (settings, instance, model) => {
  // const text = generateSentences(model, 80, settings.markovOrder) + settings.tootSuffix; // TODO add the min length to the settings file
  const text = generateSentence(model, settings.markovOrder) + settings.tootSuffix;
  instance.post('statuses', Object.assign(settings.tootOptions, {
    status: text,
  }));
  console.log('Published:', text);

  const { minTimeBetweenToots, maxTimeBetweenToots } = settings;
  const nextTime = Math.round(Math.random() * (maxTimeBetweenToots - minTimeBetweenToots)) + minTimeBetweenToots;
  setTimeout(() => toot(settings, instance, model), nextTime * 60 * 1000);
};

export const startBot = async () => {
  const settings = getSettings(`${__dirname}/../settings.json`);

  // always collect new toots at startup
  const nbNewSentences = await collectToots(settings);
  console.log(nbNewSentences, 'toot(s) collected');
  console.log('Updating model...');
  const model = updateModelFromFile(settings, nbNewSentences, settings.markovOrder);
  console.log('Done.');

  const instance = new Mastodon({
    access_token: settings.destinationInstanceToken,
    api_url: settings.destinationInstanceUrl,
  });

  // immediately toot and set the timer for the next toot
  toot(settings, instance, model);
};

export default startBot;

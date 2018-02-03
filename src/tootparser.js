import HtmlParser from 'htmlparser';
import Str from 'underscore.string';
import SentenceTokenizer from 'sbd';
import Url from 'url';
import Path from 'path';
import HtmlEntities from 'he';

export const parseHtml = async (data) => {
  return new Promise((resolve, reject) => {
    const handler = new HtmlParser.DefaultHandler((error, dom) => {
      if (error != null) {
        reject(error);
        return;
      }

      resolve(dom);
    });

    const parser = new HtmlParser.Parser(handler);
    parser.parseComplete(data);
  });
};

const domNodeToText = (node, text = []) => {
  const { name, type, attribs = {}, children } = node;
  const { class: className } = attribs;

  // regular text
  if (type === 'text') {
    const str = node.data.trim().replace(/"|&quot;|«|&laquo;|»|&raquo;/gi, '');
    if (str !== '') {
      text.push(str);
    }
    return;
  }

  // line jump
  if (name === 'p' || name === 'br') {
    text.push('\n');
  }

  // extract mentionned users and hashtags
  if (name === 'a') {
    if (className != null && className.includes('hashtag')) {
      const { href } = attribs;
      if (href != null) {
        const url = Url.parse(href);
        const { hostname, pathname } = url;

        if (pathname != null && hostname != null) {
          const hashtag = Path.posix.basename(pathname);
          if (hashtag != null) {
            text.push(`#${hashtag}`);
          }
        }
      }
    } else if (className != null && className.includes('mention')) {
      const { href } = attribs;
      if (href != null) {
        const url = Url.parse(href);
        const { hostname, pathname } = url;

        if (pathname != null && hostname != null) {
          const userName = Path.posix.basename(pathname);
          if (userName != null) {
            text.push(`${userName}`);
          }
        }
      }
    }
    return;
  }

  // analyze children
  if (children != null && children.length > 0) {
    children.forEach((child) => {
      domNodeToText(child, text);
    });
  }
};

const analyzeTootDom = (dom) => {
  // console.log('dom', JSON.stringify(dom, null, 2));

  const texts = [];
  if (dom.length > 0) {
    dom.forEach((child) => {
      domNodeToText(child, texts);
    });
  }

  if (texts.length === 0) {
    return null;
  }

  return HtmlEntities.decode(texts.join(' '));
};

// TODO find a better implementation
const removeBeginningMentions = (words) => {
  for (let i = 0; i < words.length; i += 1) {
    if (words[i].startsWith('@')) {
      words[i] = '';
    } else {
      break;
    }
  }
  return words;
};

// TODO find a better implementation
const removeEndingMentions = (words) => {
  for (let i = words.length - 1; i >= 0; i -= 1) {
    if (words[i].startsWith('@')) {
      words[i] = '';
    } else {
      break;
    }
  }
  return words;
};

// TODO find a better implementation
const cleanOrphanSymbols = (words) => {
  for (let i = 0; i < words.length; i += 1) {
    if (words[i] === ';' || words[i] === ',' || words[i] === ':' || words[i] === ')') {
      if (i > 0) {
        words[i - 1] += words[i];
      }
      words[i] = '';
    } else if (words[i] === '(') {
      if (i < words.length) {
        words[i + 1] = words[i] + words[i + 1];
      }
      words[i] = '';
    }
  }
  return words;
};

export const parseToot = async (toot) => {
  const dom = await parseHtml(toot);

  const text = analyzeTootDom(dom);
  if (text != null && text.trim() !== '') {
    let sentences = [];
    text.trim().split('\n').forEach((line) => {
      const newSentences = SentenceTokenizer.sentences(line.trim()).map((sentence) => {
        let words = Str.words(sentence);
        words = removeBeginningMentions(words);
        words = removeEndingMentions(words);
        words = cleanOrphanSymbols(words);
        return words.join(' ').trim();
      }).filter(value => value != null && value.trim() !== '');
      sentences = [...sentences, ...newSentences];
    });
    return sentences;
  }
  return null;
};

export default parseToot;

import hydrajs from './hydrajs';
import { REDHAT_DOT_COM } from './constants';
import marked from 'marked';
import dompurify from 'dompurify';
import isString from 'lodash/isString';
import assign from 'lodash/assign';
import isEmpty from 'lodash/isEmpty';

const defaultMarkdownOptions = { gfm: true, breaks: true, jsMarkdownExtra: false };

const versionSorter = (_a, _b) => { //Added because of wrong order of versions
  let a = _a.match(/(\d+|\w+)/gm);
  let b = _b.match(/(\d+|\w+)/gm);
  for (var i = 0; i < (a.length > b.length ? a.length : b.length); i++) {
    const x = parseInt(a[i]) || a[i];
    const y = parseInt(b[i]) || b[i];
    if (x === undefined || x < y) {
      return 1;
    } else if (y === undefined || y < x) {
      return -1;
    }
  }
  if (_a.length > _b.length) {
    return 1;
  } else if (_b.length > _a.length) {
    return -1;
  }
  return 0;
}

const versionSort = (arr) => {
  return arr.sort(versionSorter);
}

const getRedhatDotComHost = () => {
  const env = hydrajs.Env.getEnvName();
  switch (env) {
    case 'QA':
      return REDHAT_DOT_COM.QA;
    case 'DEV':
      return REDHAT_DOT_COM.DEV;
    case 'STAGE':
      return REDHAT_DOT_COM.STAGE;
    default:
      return REDHAT_DOT_COM.PROD;
  }
}
const markdownToHTML = (markdownText, options, callback) => {
    if (!isString(markdownText)) return '';
    if (isEmpty(markdownText)) {
        return markdownText;
    } else if (marked) {
        return marked(markdownText, assign({}, defaultMarkdownOptions, options), callback);
    }
}

const santitizeHTML = (markdownText, config) => {
    if (!isString(markdownText)) return '';
    if (isEmpty(markdownText)) {
        return markdownText;
    } else if (dompurify) {
        return dompurify.sanitize(markdownText, config);
    }
}

module.exports = {
  versionSort,
  versionSorter,
  getRedhatDotComHost,
  markdownToHTML,
  santitizeHTML
}

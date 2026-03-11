(function (document, tagName, scriptTagId) {
  var js,
    fjs = document.getElementsByTagName(tagName)[0];
  if (document.getElementById(scriptTagId)) return t;
  js = document.createElement(tagName);
  js.id = scriptTagId;
  js.src = 'https://embed.bsky.app/static/embed.js';
  fjs.parentNode.insertBefore(js, fjs);
})(document, 'script', 'bluesky-embed-js');

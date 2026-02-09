import DOMPurify from "dompurify";

export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "u", "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li", "a", "img", "blockquote", "code", "pre",
      "table", "thead", "tbody", "tr", "th", "td", "div", "span",
      "figure", "figcaption", "iframe", "video", "source", "hr", "sub", "sup",
      "dl", "dt", "dd", "abbr", "cite", "mark", "small", "del", "ins",
    ],
    ALLOWED_ATTR: [
      "href", "src", "alt", "class", "id", "target", "rel",
      "width", "height", "style", "title", "loading", "decoding",
      "allow", "allowfullscreen", "frameborder",
    ],
    ALLOW_DATA_ATTR: false,
  });
};

// slice.js

function extractContent(content, start, end) {
  // If content is an array
  if (Array.isArray(content)) {
    const from = start ? content.indexOf(start) : 0;
    const to = end ? content.lastIndexOf(end) : content.length - 1;

    // If start or end not found, or range is invalid
    if (from === -1 || to === -1 || from > to) {
      return [];
    }

    return content.slice(from, to + 1);
  }

  // If content is a string
  if (typeof content === "string") {
    const from = start ? content.indexOf(start) : 0;
    const to = end ? content.lastIndexOf(end) : content.length;

    // If start or end not found, or range is invalid
    if ((start && from === -1) || (end && to === -1) || from > to) {
      return '';
    }

    return content.slice(from, to + (end ? end.length : 0));
  }

  // If content is neither string nor array
  return null;
}

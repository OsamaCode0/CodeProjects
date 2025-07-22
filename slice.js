


function extractContent (start, end, content) {

  if (Array.isArray(content)) {
    let from = start ? content.indexOf(start) : 0;
    let to = end ? content.indexOf(end) : content.length - 1;
    return content.slice(from, to + 1);
  } 

  if (from === -1 || to === -1 || from > to) {
    return [];
  }


  if (typeof content === 'string'){
    let from = start ? content.indexOf(start) : 0
    let to = end ? content.lastOfIndex(end) : content.length - 1;

      return content.slice(from, to + 1);

  }

  if (from === -1 || to === -1 || from > to) {
    return '';
  }

}
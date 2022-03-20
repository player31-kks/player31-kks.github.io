function makeCircleBox() {
  const flexBox = document.createElement("div");
  flexBox.style = `display:flex;`;
  return flexBox;
}

function prependCircleAt(node, color) {
  const svg = document.createElement("span");
  svg.innerHTML = `<svg style="padding-right:6px; margin-bottom: 6px; " width="16"  height="16" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="50" fill= ${color} />
</svg>`;
  node.prepend(svg);
}

function makeThreeCircleCodeBlovck(codeBlock, fileName) {
  const div = makeCircleBox();

  prependCircleAt(div, "#FF5F56");
  prependCircleAt(div, "#FFBD2E");
  prependCircleAt(div, "#27C93F");

  const span = document.createElement("span");
  span.innerText = fileName;
  span.style.marginBottom = "6px";
  span.style.fontSize = "10px";
  span.style.userSelect = "none";
  if (codeBlock) div.append(span);
  codeBlock.prepend(div);
}

const codeblocks = document.querySelectorAll("div.highlighter-rouge");
for (const codeblockDiv of codeblocks) {
  const codeblock = codeblockDiv.querySelector("code");
  if (codeblock) {
    const fileName = codeblockDiv.dataset.fileName || "";
    makeThreeCircleCodeBlovck(codeblock, fileName);
  }
}

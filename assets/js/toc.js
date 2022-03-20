"use strict";
var TocNodeImpl = /** @class */ (function () {
  function TocNodeImpl(hTag, parent) {
    this.parent = parent;
    this.depth = parent !== "root" ? parent.depth + 1 : 0;
    this.child = [];
    this.text = hTag.innerText;
    this.localName = hTag.localName;
    this.id = hTag.id;
  }
  TocNodeImpl.prototype.diffToc = function (hTag) {
    if (hTag.localName > this.localName) {
      var childNode = new TocNodeImpl(hTag, this);
      this.child.push(childNode);
      return childNode;
    } else if (hTag.localName === this.localName) {
      var childNode = new TocNodeImpl(hTag, this.parent);
      if (this.parent !== "root") {
        this.parent.child.push(childNode);
        return childNode;
      } else {
        this.child.push(childNode);
      }
    } else {
      if (this.parent !== "root") {
        return this.parent.diffToc(hTag);
      }
    }
  };
  return TocNodeImpl;
})();
var TocController = /** @class */ (function () {
  function TocController() {
    var _this = this;
    this.handleScroll = function () {
      var _a;
      (_a = document.querySelector(".active")) === null || _a === void 0
        ? void 0
        : _a.classList.remove("active");
      var midHeight = window.scrollY + window.innerHeight / 2 - 325;
      var i;
      for (i = 0; i < _this.hTags.length; i++) {
        if (
          i === _this.hTags.length - 1 ||
          (midHeight >
            _this.hTags[i].getBoundingClientRect().top + window.scrollY &&
            midHeight <
              _this.hTags[i + 1].getBoundingClientRect().top + window.scrollY)
        ) {
          var active = document.querySelector("#toc-" + _this.hTags[i].id);
          active === null || active === void 0
            ? void 0
            : active.classList.add("active");
          return;
        }
      }
    };
    this.hTags = document.querySelectorAll("h1, h2, h3");
  }
  TocController.prototype.appendTocTo = function (area) {
    var toc = this.parseHTags();
    this.makeTocElement(toc, area);
    window.addEventListener("scroll", this.handleScroll);
  };
  TocController.prototype.parseHTags = function () {
    // htag들을 전부 모은다.
    var toc = this.makeTocNode(this.hTags);
    return toc;
  };
  TocController.prototype.makeTocNode = function (hTags) {
    hTags[0].id = "htag-0";
    var rootTocNode = new TocNodeImpl(hTags[0], "root");
    var previousNode = rootTocNode;
    var i;
    for (i = 1; i < hTags.length; i++) {
      hTags[i].id = "htag-" + i;
      var currentNode = previousNode.diffToc(hTags[i]);
      if (currentNode) {
        previousNode = currentNode;
      }
    }
    return rootTocNode;
  };
  TocController.prototype.makeTocElement = function (toc, area) {
    var tocBody = document.createElement("ul");
    tocBody.classList.add("toc");
    tocBody = this.makeSubToc(toc, tocBody);
    area.appendChild(tocBody);
  };
  TocController.prototype.makeSubToc = function (toc, tocBody) {
    var _this = this;
    var li = document.createElement("li");
    li.innerText = toc.text;
    li.id = "toc-" + toc.id;
    if (toc.depth == 0) {
      li.classList.add("active");
      li.classList.add(
        "text-slate-900",
        "font-semibold",
        "mb-4",
        "leading-6",
        "text-slate-100"
      );
    }
    li.classList.add("toc-depth-" + toc.depth, "text-md");
    this.addScrollEvent(li, toc);
    tocBody.appendChild(li);
    if (toc.child) {
      var subTocBody_1 = document.createElement("ul");
      toc.child.forEach(function (tocNode) {
        subTocBody_1 = _this.makeSubToc(tocNode, subTocBody_1);
      });
      tocBody.appendChild(subTocBody_1);
    }
    return tocBody;
  };
  TocController.prototype.addScrollEvent = function (element, toc) {
    element.addEventListener("click", function () {
      var target = document.querySelector("#" + toc.id);
      if (target) {
        window.scrollTo({
          top:
            (target === null || target === void 0 ? void 0 : target.offsetTop) -
            10,
          behavior: "smooth",
        });
      }
    });
  };
  return TocController;
})();

const tocWrapper = document.querySelector(".toc-wrapper");
var tocController = new TocController();
tocController.appendTocTo(tocWrapper);

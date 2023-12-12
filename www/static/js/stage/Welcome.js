define(["component/Pages"], function (Pages) {
  let study;
  let pages;
  return {
    name: "welcome",
    init: function (_study) {
      study = _study;
      pages = new Pages();
      return pages.init(study, ["welcome.html"], function () {
        study.next();
      });
    },
    show: function () {
      // show the form
      pages.next();
    },
  };
});

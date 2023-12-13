define(["component/Pages"], function (Pages) {
  let study;
  let pages;
  return {
    name: "complete",
    init: function (_study) {
      study = _study;
      pages = new Pages();
      return pages.init(study, ["complete.html"], function () {
        study.next();
      });
    },
    show: function () {
      // save the data
      study.data.save();
      // show the form
      pages.next();
    },
  };
});

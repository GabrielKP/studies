define(["component/Pages"], function (Pages) {
  let study;
  let pages;
  return {
    name: "consent",
    init: function (_study) {
      study = _study;
      pages = new Pages();
      return pages.init(study, ["consent.html"], function () {
        study.next();
      });
    },
    show: function () {
      // show the page
      pages.next();
      // disagree
      $("#disagree").on("click", () => {
        window.location.href =
          "https://app.prolific.co/submissions/complete?cc=" +
          study.config["code_noconsent"];
      });
    },
  };
});

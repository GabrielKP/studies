define(["component/Pages"], function (Pages) {
  let study;
  let pages;
  return {
    name: "consent",
    init: function (_study) {
      study = _study;
      pages = new Pages();
      return pages.init(study, ["consent.html"], function () {
        if (!study.config["debug"]) {
          $(window).on("beforeunload", function () {
            return "Are you sure you want to leave? You will have to restart the experiment.";
          });
        }
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

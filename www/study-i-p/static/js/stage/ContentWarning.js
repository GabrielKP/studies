define(["component/Pages"], function (Pages) {
  let study;
  let pages;
  return {
    name: "content_warning",
    init: function (_study) {
      study = _study;
      pages = new Pages();
      return pages.init(study, ["content_warning.html"], function () {
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
          study.config["code_content_warning_disagree"];
      });
    },
  };
});

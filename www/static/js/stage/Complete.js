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
      // show the html
      pages.next();
      $("#complete").on("click", () => {
        window.location.href =
          "https://app.prolific.co/submissions/complete?cc=" +
          study.config["code_completion"];
      });
    },
  };
});

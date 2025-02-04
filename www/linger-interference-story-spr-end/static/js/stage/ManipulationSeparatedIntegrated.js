define(["component/Pages"], function (Pages) {
  let study;
  let integrated_pages;
  let separated_pages;
  return {
    name: "manipulation_separated_integrated",
    init: function (_study) {
      study = _study;
      integrated_pages = new Pages();
      separated_pages = new Pages();
      separated_geometry_pages = new Pages();
      return Promise.all([
        integrated_pages.init(
          study,
          ["manipulation/continued.html"],
          function () {
            study.next();
          }
        ),
        separated_pages.init(
          study,
          ["manipulation/separated.html"],
          function () {
            study.next();
          }
        ),
        separated_geometry_pages.init(
          study,
          ["manipulation/continued.html"],
          function () {
            study.next();
          }
        ),
      ]);
    },
    show: function () {
      if (study.config["condition"] == "continued-geometry") {
        separated_geometry_pages.next();
      } else if (study.config["condition"] == "continued") {
        integrated_pages.next();
      } else {
        separated_pages.next();
      }
    },
  };
});

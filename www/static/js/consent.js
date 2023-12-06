define(["Pages"], function (Pages) {
  let study;
  return {
    init: function (study) {
      study = study;
      Pages.preload(["consent.html"]);
    },
    show: function () {
      // show the form
      Pages.next();
      // add event handlers
      $("#next").on("click", function () {});
    },
    finish: function () {
      // remove event handlers
      $("#next").off("click");
      // hide page
      // next stage
      study.next();
    },
  };
});

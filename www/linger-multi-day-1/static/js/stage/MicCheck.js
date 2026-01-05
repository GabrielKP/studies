define(["component/Pages"], function (Pages) {
  return {
    study: null,
    pages: null,
    name: "mic_check",
    init: function (_study) {
      this.study = _study;
      this.pages = new Pages();
      return this.pages.init(
        this.study,
        ["mic_check/instruct-1.html"],
        function () {
          this.study.next();
        }
      );
    },
    show: function () {
      // show the form
      this.pages.next();
    },
  };
});

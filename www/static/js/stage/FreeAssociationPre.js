define(["component/Pages", "component/FreeAssociation"], function (
  Pages,
  FreeAssociation
) {
  let study;
  let instruct_pages;
  let free_association;

  return {
    name: "free_association_pre",
    init: function (_study) {
      study = _study;
      instruct_pages = new Pages();
      free_association = new FreeAssociation();
      return Promise.all([
        instruct_pages.init(
          study,
          [
            "free_association/instruct-1.html",
            "free_association/instruct-2.html",
            "free_association/instruct-3.html",
          ],
          function () {
            free_association.start_task();
          }
        ),
        free_association.init(study, "free_association/task.html", function () {
          study.next();
        }),
      ]);
    },
    show: function () {
      // show instructions
      free_association.start_task();
      // instruct_pages.next();
    },
  };
});

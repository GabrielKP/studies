define(function () {
  var page_index = 0;
  var pages = null;
  return {
    preload: function (pagenames) {
      return Promise.all(
        $.map(pagenames, (pagename) => {
          return $.ajax({
            url: pagename,
            dataType: "html",
          }).then((page_html) => {
            self.pages[pagename] = page_html;
          });
        })
      );
    },
    next: function () {
      if (page_index == 0 || page_index < pages.length - 1) {
        page_index += 1;
        $("body").html(pages[page_index]);
      } else {
        console.log("No next page");
      }
    },
    previous: function () {
      if (page_index > 0) {
        page_index -= 1;
        $("body").html(pages[page_index]);
      } else {
        console.log("No previous page");
      }
    },
  };
});

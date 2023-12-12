define(function () {
  // Class for page handling
  class _Pages {
    page_index;
    pages;
    func_finish;
    study;

    constructor() {
      this.next = this.next.bind(this);
      this.previous = this.previous.bind(this);
    }

    _bind_buttons(func_next, func_previous) {
      // TODO: if func_next or func_previous is undefined, then don't bind
      $("#next").on("click", function () {
        func_next();
      });
      $("#prev").on("click", function () {
        func_previous();
      });
    }

    _enable_buttons(button_timeout) {
      setTimeout(function () {
        $("#next").prop("disabled", false);
      }, button_timeout);
      $("#prev").prop("disabled", false);
    }

    init(study, pagenames, func_finish = null) {
      this.study = study;
      this.page_index = 0;
      this.pages = Array(pagenames.length);
      this.func_finish = func_finish;

      return Promise.all(
        $.map(pagenames, (pagename, indx) => {
          return $.ajax({
            url: pagename,
            dataType: "html",
          }).then((page_html) => {
            console.debug("Page loaded: " + indx + " " + pagename);
            this.pages[indx] = page_html;
          });
        })
      );
    }

    next() {
      if (this.page_index < this.pages.length) {
        // display next
        $("body").html(this.pages[this.page_index]);
        this.page_index += 1;

        // bind button functions
        this._bind_buttons(this.next, this.previous);
        this._enable_buttons(this.study.config.default_button_timeout);

        return true;
      } else {
        if (this.func_finish != null) {
          this.func_finish();
        } else {
          console.log("No next page");
        }
        return false;
      }
    }

    previous() {
      if (this.page_index > 1) {
        // display previous
        this.page_index -= 2;
        $("body").html(this.pages[this.page_index]);
        this.page_index += 1;

        // bind button functions
        this._bind_buttons(this.next, this.previous);
        this._enable_buttons(0);

        return true;
      } else {
        console.log("No previous page");
        return false;
      }
    }
  }

  return _Pages;
});

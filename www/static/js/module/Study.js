define(["module/Data"], function (Data) {
  class _Study {
    stage_index;
    current_stage;
    stages;
    config;
    data;

    constructor() {
      this.next = this.next.bind(this);
      this.current_stage_name = this.current_stage_name.bind(this);
      this.current_page_name = this.current_page_name.bind(this);
    }

    init(uninit_stages, config) {
      this.current_stage = null;
      this.stage_index = 0;
      this.stages = Array(uninit_stages.length);
      this.config = config;

      // init the data module
      this.data = Data;
      this.data.init(this);

      return Promise.all(
        $.map(uninit_stages, (stage, indx) => {
          return stage.init(this).then(() => {
            this.stages[indx] = stage;
          });
        })
      );
    }

    next() {
      this.data.record_trialdata({
        status: "stage_end",
      });
      if (this.stage_index < this.stages.length) {
        this.current_stage = this.stages[this.stage_index];
        this.current_stage.show();
        this.stage_index += 1;

        this.data.record_trialdata({
          status: "stage_begin",
        });
        return true;
      } else {
        console.log("Last stage");
        // save data
        return false;
      }
    }

    current_stage_name() {
      if (this.current_stage == null) {
        return "initializing";
      }
      return this.current_stage.name;
    }

    current_page_name() {
      if (this.current_stage != null) {
        if (this.current_stage.pages == null) {
          return "no page";
        } else {
          return this.current_stage.pages.current_page_name();
        }
      } else {
        return "stage uninitialized";
      }
    }
  }

  return new _Study();
});

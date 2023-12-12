define(function () {
  class _Study {
    stage_index;
    stages;
    config;

    constructor() {
      this.next = this.next.bind(this);
    }

    init(uninit_stages, config) {
      this.stage_index = 0;
      this.stages = Array(uninit_stages.length);
      this.config = config;

      return Promise.all(
        $.map(uninit_stages, (stage, indx) => {
          return stage.init(this).then(() => {
            this.stages[indx] = stage;
          });
        })
      );
    }

    next() {
      if (this.stage_index < this.stages.length) {
        this.stages[this.stage_index].show();
        this.stage_index += 1;
        return true;
      } else {
        console.log("Last stage");
        // save data
        return false;
      }
    }
  }

  return new _Study();
});

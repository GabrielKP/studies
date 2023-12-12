define(function () {
  class _Data {
    study;
    trialdata;
    eventdata;
    prolific_pid;
    study_id;
    session_id;

    constructor() {
      this.record_trialdata = this.record_trialdata.bind(this);
      this.record_eventdata = this.record_eventdata.bind(this);
      this.make_datapoint = this.make_datapoint.bind(this);
    }

    init(study) {
      this.study = study;

      let urlParams = new URLSearchParams(window.location.search);
      this.prolificPID = urlParams.get("PROLIFIC_PID");
      this.studyID = urlParams.get("STUDY_ID");
      this.sessionID = urlParams.get("SESSION_ID");

      this.trialdata = [];
      this.eventdata = [];

      // bind the event listeners
      $(window).on("resize", () => {
        this.record_eventdata("window_resize", {
          width: $(window).width(),
          height: $(window).height(),
        });
      });
      $(window).on("focus", () => {
        this.record_eventdata("window_onfocus", {});
      });
      $(window).on("outfocus", () => {
        this.record_eventdata("window_outfocus", {});
      });

      this.record_eventdata("initialized", {});
      $(window).triggerHandler("resize");

      return Promise.resolve();
    }

    make_datapoint() {
      let datapoint = {};
      datapoint["prolific_pid"] = this.prolific_pid;
      datapoint["study_id"] = this.study_id;
      datapoint["session_id"] = this.session_id;
      datapoint["stage"] = this.study.current_stage_name();
      datapoint["page"] = this.study.current_page_name();
      datapoint["timestamp"] = new Date().getTime();
      return datapoint;
    }

    record_trialdata(data) {
      let trialdatapoint = this.make_datapoint();
      trialdatapoint["trial_index"] = this.trialdata.length;
      trialdatapoint["data"] = data;
      this.trialdata.push(trialdatapoint);
    }

    record_eventdata(event_type, data) {
      let eventdatapoint = this.make_datapoint();
      eventdatapoint["event_index"] = this.eventdata.length;
      eventdatapoint["event_type"] = event_type;
      eventdatapoint["data"] = data;
      this.eventdata.push(eventdatapoint);
    }

    save_data() {
      // save it
    }
  }

  return new _Data();
});

require([
  "module/Study",
  "stage/Consent",
  "stage/Complete",
  "stage/FreeAssociationPre",
  "stage/Fullscreen",
  "stage/GeneralInstructions",
  "stage/Welcome",
], function (
  Study,
  Consent,
  Complete,
  FreeAssociationPre,
  Fullscreen,
  GeneralInstructions,
  Welcome
) {
  let config = {
    default_button_timeout: 500,
    time_limit_pre: 180000,
    code_completion: "XXXXXX",
    code_noconsent: "YYYYYY",
    studytime: 4,
    enforce_fullscreen: true,
  };
  let debug_config = {
    debug: true,
    default_button_timeout: 0,
    time_limit_pre: 2000,
    code_completion: "XXXXXX",
    code_noconsent: "YYYYYY",
    studytime: 4,
    enforce_fullscreen: true,
  };
  let url_params = new URLSearchParams(window.location.search);
  if (url_params.get("mode") == "debug") {
    config = debug_config;
  }
  config["local"] = false;
  if (url_params.has("local")) {
    config["local"] = true;
  }

  let initialization = Study.init(
    [
      Welcome,
      Fullscreen,
      FreeAssociationPre,
      // Consent,
      // GeneralInstructions,
      // FreeAssociationPre,
      Complete,
    ],
    config
  );
  initialization.then(() => {
    Study.next();
  });
});

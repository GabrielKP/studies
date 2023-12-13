require([
  "module/Study",
  "stage/Consent",
  "stage/Complete",
  "stage/FreeAssociationPre",
  "stage/GeneralInstructions",
  "stage/Welcome",
], function (
  Study,
  Consent,
  Complete,
  FreeAssociationPre,
  GeneralInstructions,
  Welcome
) {
  let config = {
    default_button_timeout: 500,
    time_limit_pre: 180000,
  };
  let debug_config = {
    default_button_timeout: 0,
    time_limit_pre: 2000,
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

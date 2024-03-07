/*******************
 * Word chain game *
 *******************/

TIME_LIMIT = 180000; // 5 minutes

let listening = false;
let word_count = 0;
let word_start_time;
let word_end_time;
let word_text;
let word_key_chars;
let word_key_codes;
let word_key_onsets;
let word_spacebar_presses;
let key_start_time;
let key_end_time;
let mode;

function finish_task() {
  $("body").unbind("keydown", response_handler);
  $("body").html("<h1>Finished!</h1>");
}

function fade_cue(text, time_until_fade_out = 500, time_fade_out = 500) {
  $("#cue").html(text);
  $(".stim-div").fadeTo(250, 1);
  setTimeout(function () {
    $(".stim-div").fadeTo(time_fade_out, 0);
  }, time_until_fade_out);
}

function save_word() {
  var submit_object = {};
  word_text = $("#qinput").val();
  submit_object["phase"] = "wcg";
  submit_object["status"] = "ongoing";
  submit_object["mode"] = mode;
  submit_object["word_text"] = word_text;
  submit_object["word_count"] = word_count;
  submit_object["word_time"] = word_end_time - word_start_time;
  submit_object["word_key_chars"] = word_key_chars;
  submit_object["word_key_codes"] = word_key_codes;
  submit_object["word_key_onsets"] = word_key_onsets;
}

function ready_word_variables() {
  word_key_chars = [];
  word_key_codes = [];
  word_key_onsets = [];
  word_spacebar_presses = 0; // reset word spacebar presses
  word_start_time = new Date().getTime();
  key_start_time = new Date().getTime();
  listening = true;
}

function show_cue_new_textbox() {
  $("#qinput").val("");
  fade_cue(word_text.toUpperCase());
  ready_word_variables();
}

function show_next_exp_suppress() {
  if (mode == "switch_to_story") {
    finish_task();
  } else {
    show_cue_new_textbox();
  }
}

function response_handler(key) {
  if (!listening) return;
  listening = false;
  if (key.keyCode == 13) {
    // "ENTER" - key

    if ($("#qinput").val() == "") {
      // do not submit if textbox is empty
      listening = true;
      key.preventDefault();
      return;
    }

    // record keystroke
    key_end_time = new Date().getTime();
    word_key_chars.push(String.fromCharCode(key.keyCode));
    word_key_codes.push(key.keyCode);
    word_key_onsets.push(key_end_time - key_start_time);

    word_end_time = new Date().getTime();
    word_text = $("#qinput").val();
    save_word();
    word_count++;

    // disable enter key's default function (keeps text box unchanged after pressing enter)
    key.preventDefault();

    show_next_exp_suppress();
  } else if (key.keyCode == 32) {
    // handle the space bar key
    key.preventDefault();
    // 1. visual cue that space is pressed
    // 2. save the timemark of space bar press.
    // 3. add a tracker for each word, how often space bar is pressed for the word
    listening = true;
  } else if (
    key.keyCode == 192 ||
    key.keyCode == 219 ||
    key.keyCode == 220 ||
    key.keyCode == 211 ||
    key.keyCode == 59 ||
    key.keyCode == 222 ||
    key.keyCode == 188 ||
    key.keyCode == 190 ||
    key.keyCode == 191 ||
    key.keyCode == 61
  ) {
    // DISABLED keys: non-alphanumeric characters
    key.preventDefault();
    listening = true;
  } else {
    // "NORMAL" keys: save key char, code and time
    key_end_time = new Date().getTime();
    word_key_chars.push(String.fromCharCode(key.keyCode));
    word_key_codes.push(key.keyCode);
    word_key_onsets.push(key_end_time - key_start_time);
    key_start_time = new Date().getTime();
    listening = true;
  }
}

// Any click onscreen autofocuses to textbox
$(function () {
  $("html").on("click", function () {
    $("#qinput").focus();
  });
});

// Define function to prevent copy, paste, and cut
// ref: https://jsfiddle.net/lesson8/ZxKdp/
$("input,textarea").bind("cut copy paste", function (e) {
  e.preventDefault(); //disable cut,copy,paste
});

// register event listener
$("body").focus().keydown(response_handler);

// start experiment
$("#cue").html("Enter a word to begin!");
// Timer for pre FA
setTimeout(function () {
  mode = "switch_to_story";
}, TIME_LIMIT);

mode = "word_chain_game";
ready_word_variables();

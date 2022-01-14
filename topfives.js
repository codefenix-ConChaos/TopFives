// -------------------- - - -  Configurable Options Start - - - ---------------
const IGNORE_SYSOP            = true;
const OUTPUT_DELAY            = 1;
const TOP_NUM                 = 5;
const SIMPLE_LIST_FMT         = "  \1k\1h%2d\1n:\1k\1h %-30.30s%10d\n";
const SIMPLE_LIST_FMT_HL      = "  \1w\1h%2d\1n:\1w\1h %-30.30s%10d\n";
const SIMPLE_LIST_HDR_FMT     = "\n\1b\1h%s\n";
const ANIM_LIST_FMT           = "\1k\1h%d\1n:\1k\1h %-14.14s%6d\n";
const ANIM_LIST_FMT_HL        = "\1w\1h%d\1n:\1w\1h %-14.14s%6d\n";
const ANIM_LIST_HDR_FMT       = "\1n\1b%s";
const ANIM_LIST_HDR_FMT2      = "\1b\1h%s";
const ANIM_TIMEFRAME_HDR_X    = 57;
const ANIM_TIMEFRAME_HDR_Y    = 4;
const ANIM_TIMEFRAME_HDR_FMT  = "\1k\1h\x017%s";
const ANIM_TIMEFRAME_HDR_FMT2 = "\1w\1h\x017%s";
const ANIM_CATEGORY_1         = "num_of_calls";
const ANIM_CATEGORY_1_HDR     = "TOP " + TOP_NUM + " CALLERS";
const ANIM_CATEGORY_1_X       = 3;
const ANIM_CATEGORY_1_Y       = 9;
const ANIM_CATEGORY_2         = "messages_read";
const ANIM_CATEGORY_2_HDR     = "TOP " + TOP_NUM + " MESSAGE READERS";
const ANIM_CATEGORY_2_X       = 3;
const ANIM_CATEGORY_2_Y       = 16;
const ANIM_CATEGORY_3         = "time_on";
const ANIM_CATEGORY_3_HDR     = "TOP " + TOP_NUM + " MOST ONLINE (mins)";
const ANIM_CATEGORY_3_X       = 29;
const ANIM_CATEGORY_3_Y       = 9;
const ANIM_CATEGORY_4         = "messages_posted";
const ANIM_CATEGORY_4_HDR     = "TOP " + TOP_NUM + " MESSAGE POSTERS";
const ANIM_CATEGORY_4_X       = 29;
const ANIM_CATEGORY_4_Y       = 16;
const ANIM_CATEGORY_5         = "doors_ran";
const ANIM_CATEGORY_5_HDR     = "TOP " + TOP_NUM + " DOOR RUNNERS";
const ANIM_CATEGORY_5_X       = 55;
const ANIM_CATEGORY_5_Y       = 9;
const ANIM_CATEGORY_6         = "kb_downloaded";
const ANIM_CATEGORY_6_HDR     = "TOP " + TOP_NUM + " DOWNLOADERS (kbs)";
const ANIM_CATEGORY_6_X       = 55;
const ANIM_CATEGORY_6_Y       = 16;
const ANIM_END_PAUSE_X        = 1;
const ANIM_END_PAUSE_Y        = 23;
// --------------------- - - -  Configurable Options End - - - ----------------

const MONTH_NAMES = ["nothing", "January", "February", "March", "April", "May",
   "June", "July", "August", "September", "October", "November", "December"
];
const DEFAULT_OUTPUT_PATH = backslash(system.mods_dir) + "output.msg";
const OUTPUT_TEMPLATE_PATH = backslash(system.mods_dir) + "topfives.msg";
const LOG_PATH = backslash(system.logs_dir) + "logs";
var searchMonth = "";
var searchYear = "";
var outputPath = "";
var outputMode = "";
var searchDate = new Date();
searchDate.setDate(searchDate.getDate()-1); // Search date is day before
                                            // current to prevent empty result
                                            // sets on first day of month.
var paramMode = argv[0];
if (paramMode === "month") {
   searchMonth = right("0" + (searchDate.getMonth() + 1), 2);
   searchYear = right((searchDate.getFullYear().toString()), 2);
} else if (paramMode === "year") {
   searchMonth = "";
   searchYear = right((searchDate.getFullYear().toString()), 2);
} else if (paramMode === "lastyear") {
   searchMonth = "";
   searchYear = right(((searchDate.getFullYear()-1).toString()), 2);
} else if (!isNaN(paramMode)) { // Year number
   searchMonth = "";
   searchYear = right(paramMode, 2);
//} else if (paramMode !== undefined) { // Thought about adding a datestr option...
//   var pDate = new Date(paramMode);
//   searchMonth = right("0" + (pDate.getMonth() + 1), 2);
//   searchYear = right((pDate.getFullYear().toString()), 2);
} else {
   print("Usage:");
   print("jsexec topfives [month/year/lastyear/year number] <path_to_output> <simple>")
   exit();
}

var paramOutputPath = argv[1];
if (paramOutputPath === "" || paramOutputPath === undefined) {
   outputPath = DEFAULT_OUTPUT_PATH; // default output path.
} else {
   outputPath = paramOutputPath;
}

var outputMode = argv[2];
var fi; // file input
var fo; // file output
var rows;
var log_date; // ? unsure whether (or even how) to use...

var user_json = [{}];
var user_num = 0;
var user_name = "";
var time_on = 0;
var messages_read = 0;
var messages_posted = 0;
var emails = 0;
var feedback_sent = 0;
var files_uploaded = 0;
var kb_uploaded = 0;
var files_downloaded = 0;
var kb_downloaded = 0;
var doors_ran = 0;

var door_json = [{}];
var door_name = "";

var logFiles = directory(backslash(LOG_PATH) + searchMonth + "*" + searchYear + ".log");
for (var l = 0; l < logFiles.length; l++) {
   if (file_getname(logFiles[l]).substring(0,2)==="MS") {
      continue; // skip the mail server logs...
   }
   fi = new File(logFiles[l]);
	if (fi.open("r", true)) {
		rows = fi.readAll();
		for (var r = 0; r < rows.length; r++) {
         switch (rows[r].substring(0,2).trim()) {
            case "@": // Connection established.
               log_date = rows[r].substring(15, 25).trim();
               break;
            case "++": // Logon
               user_num = parseInt(rows[r].substring(4,8).trim());
               user_name = rows[r].substring(11,37).trim();
               break;
            case "X-": // External program execution
               doors_ran++;
               door_name = rows[r].substring(29).trim();
               var doorMatch = false;
               for (var index = 0; index < Object.keys(door_json).length; ++index) {
                  var dor = door_json[index];
                  if (dor.door_name === door_name) {
                     dor.times_ran += 1;
                     doorMatch = true;
                     break;
                  }
               }
               if (!doorMatch) {
                  door_json.push({
                     "door_name":door_name,
                     "times_ran":1
                  });
               }
               door_name = "";
               break;
            case "@-": // Disconnected with session summary:
               time_on = parseInt(rows[r].substring(rows[r].indexOf("T:")+2, rows[r].indexOf("R:")-1).trim());
               messages_read = parseInt(rows[r].substring(rows[r].indexOf("R:")+2, rows[r].indexOf("P:")-1).trim());
               messages_posted = parseInt(rows[r].substring(rows[r].indexOf("P:")+2, rows[r].indexOf("E:")-1).trim());
               emails = parseInt(rows[r].substring(rows[r].indexOf("E:")+2, rows[r].indexOf("F:")-1).trim());
               feedback_sent = parseInt(rows[r].substring(rows[r].indexOf("F:")+2, rows[r].indexOf("U:")-1).trim());
               kb_uploaded = parseInt(rows[r].substring(rows[r].indexOf("U:")+2, rows[r].indexOf("D:")-1).trim().split("k")[0]);
               files_uploaded = parseInt(rows[r].substring(rows[r].indexOf("U:")+2, rows[r].indexOf("D:")-1).trim().split("k")[1]);
               kb_downloaded = parseInt(rows[r].substring(rows[r].indexOf("D:")+2).trim().split("k")[0]);
               files_downloaded = parseInt(rows[r].substring(rows[r].indexOf("D:")+2).trim().split("k")[1]);

               var userMatch = false;
               for (var index = 0; index < Object.keys(user_json).length; ++index) {
                  var usr = user_json[index];
                  if (usr.user_name === user_name) {
                     if (IGNORE_SYSOP===true && user_num===1) { // do nothing
                     } else { // update existing json object on match
                        usr.num_of_calls += 1;
                        usr.time_on += time_on;
                        usr.messages_read += messages_read;
                        usr.messages_posted += messages_posted;
                        usr.emails += emails;
                        usr.feedback_sent += feedback_sent;
                        usr.files_uploaded += files_uploaded;
                        usr.kb_uploaded += kb_uploaded;
                        usr.files_downloaded += files_downloaded;
                        usr.kb_downloaded += kb_downloaded;
                        usr.doors_ran += doors_ran;
                        userMatch = true;
                     }
                     break;
                  }
               }

               if (!userMatch) {
                  if (IGNORE_SYSOP===true && user_num===1) { // do nothing
                  } else { // add user json object on non-match
                     user_json.push({
                        "user_name":user_name,
                        "num_of_calls":1,
                        "time_on":time_on,
                        "messages_read":messages_read,
                        "messages_posted":messages_posted,
                        "emails":emails,
                        "feedback_sent":feedback_sent,
                        "files_uploaded":files_uploaded,
                        "kb_uploaded":kb_uploaded,
                        "files_downloaded":files_downloaded,
                        "kb_downloaded":kb_downloaded,
                        "doors_ran":doors_ran
                     });
                  }
               }

               // Re-initialize for next log entry...
               user_num = 0;
               user_name = "";
               num_of_calls = 0;
               time_on = 0;
               messages_read = 0;
               messages_posted = 0;
               emails = 0;
               feedback_sent = 0;
               files_uploaded = 0;
               kb_uploaded = 0;
               files_downloaded = 0;
               kb_downloaded = 0;
               doors_ran = 0;
               break;
         }
      }
      fi.close();
   }
}

// Write results...
fo = new File(outputPath);
if (outputMode !== "simple") {
   // read the template into memory, prefix it with CtrlA-L to clear the screen
   // and remove the trailing CtrlA-Z if it exists
   var ft = new File(OUTPUT_TEMPLATE_PATH);
   if (ft.open(OUTPUT_TEMPLATE_PATH, "r")) {
      var temp = "\1L" + ft.read();                 // insert CtrlA-L to start
      if (temp.slice(-2).toUpperCase() === "\1Z") { // remove CtrlA-Z from end
         temp = temp.slice(0,-2);                   // if it exists
      }
      if (fo.open("w", true)) {
         fo.printf(temp);
         fo.close();
      }
   } else {
      file_copy(OUTPUT_TEMPLATE_PATH, outputPath); // Just copy the template if
   }                                               // the above fails...
}
if (fo.open(outputMode !== "simple"?"a":"w", true)) {
   if (outputMode !== "simple") {
      fo.printf("@GOTOXY:"+ANIM_TIMEFRAME_HDR_X+","+ANIM_TIMEFRAME_HDR_Y+"@@DELAY:" + OUTPUT_DELAY + "@");
      fo.printf(ANIM_TIMEFRAME_HDR_FMT, "FOR " + (searchMonth ===""?"THE YEAR":MONTH_NAMES[parseInt(searchMonth, 10)].toUpperCase()) + " '" + searchYear + "\n");
      fo.printf("@GOTOXY:"+ANIM_TIMEFRAME_HDR_X+","+ANIM_TIMEFRAME_HDR_Y+"@@DELAY:" + OUTPUT_DELAY + "@");
      fo.printf(ANIM_TIMEFRAME_HDR_FMT2, "FOR " + (searchMonth ===""?"THE YEAR":MONTH_NAMES[parseInt(searchMonth, 10)].toUpperCase()) + " '" + searchYear + "\n");
      defaultOutput(user_json, "user_name", ANIM_CATEGORY_1, ANIM_CATEGORY_1_HDR, ANIM_CATEGORY_1_X, ANIM_CATEGORY_1_Y);
      defaultOutput(user_json, "user_name", ANIM_CATEGORY_2, ANIM_CATEGORY_2_HDR, ANIM_CATEGORY_2_X, ANIM_CATEGORY_2_Y);
      defaultOutput(user_json, "user_name", ANIM_CATEGORY_3, ANIM_CATEGORY_3_HDR, ANIM_CATEGORY_3_X, ANIM_CATEGORY_3_Y);
      defaultOutput(user_json, "user_name", ANIM_CATEGORY_4, ANIM_CATEGORY_4_HDR, ANIM_CATEGORY_4_X, ANIM_CATEGORY_4_Y);
      defaultOutput(user_json, "user_name", ANIM_CATEGORY_5, ANIM_CATEGORY_5_HDR, ANIM_CATEGORY_5_X, ANIM_CATEGORY_5_Y);
      defaultOutput(user_json, "user_name", ANIM_CATEGORY_6, ANIM_CATEGORY_6_HDR, ANIM_CATEGORY_6_X, ANIM_CATEGORY_6_Y);
      fo.printf("@GOTOXY:"+ANIM_END_PAUSE_X+","+ANIM_END_PAUSE_Y+"@");
      fo.printf("\1n@PAUSE@\1Z");
   } else {
      fo.printf("\1w\1h" + system.name + " - Top " + TOP_NUM + " Lists");
      fo.printf("\n\1nFor " + (searchMonth ===""?"The Year":MONTH_NAMES[parseInt(searchMonth, 10)]) + " 20" + searchYear + "\n");
      // Top User lists...
      simpleOutput(user_json, "user_name", "num_of_calls", "TOP " + TOP_NUM + " CALLERS");
      simpleOutput(user_json, "user_name", "time_on", "TOP " + TOP_NUM + " MOST ONLINE (minutes)");
      simpleOutput(user_json, "user_name", "messages_read", "TOP " + TOP_NUM + " MESSAGE READERS");
      simpleOutput(user_json, "user_name", "messages_posted", "TOP " + TOP_NUM + " MESSAGE POSTERS");
      simpleOutput(user_json, "user_name", "emails", "TOP " + TOP_NUM + " " + "MAILERS");
      simpleOutput(user_json, "user_name", "feedback_sent", "TOP " + TOP_NUM + " " + "FEEDBACK SENDERS");
      simpleOutput(user_json, "user_name", "files_downloaded", "TOP " + TOP_NUM + " DOWNLOADERS (files)");
      simpleOutput(user_json, "user_name", "kb_downloaded", "TOP " + TOP_NUM + " DOWNLOADERS (kbs)");
      simpleOutput(user_json, "user_name", "files_uploaded", "TOP " + TOP_NUM + " UPLOADERS (files)");
      simpleOutput(user_json, "user_name", "kb_uploaded", "TOP " + TOP_NUM + " UPLOADERS (kbs)");
      simpleOutput(user_json, "user_name", "doors_ran", "TOP " + TOP_NUM + " DOOR RUNNERS");
      // Top doors used overall...
      simpleOutput(door_json, "door_name", "times_ran", "TOP " + TOP_NUM + " DOORS");
      fo.printf("\1n\1Z");
   }
   fo.close();
}

function defaultOutput(json_obj, name, stat, header, x, y) {
   fo.printf("@GOTOXY:"+x+","+y+"@");
   fo.printf("\1n\1b%s", header);
   fo.printf("\n@GOTOXY:"+x+","+y+"@@DELAY:" + OUTPUT_DELAY + "@");
   fo.printf("\1b\1h%s", header);
   fo.printf("@DELAY:" + OUTPUT_DELAY + "@\n");
   json_obj.sort(function (a, b) {
       return a[stat] < b[stat];
   });
   for (var r = 1; r < Object.keys(json_obj).length && r <= TOP_NUM; r++) {
      if (json_obj[r][stat] === 0) {
         break;
      }
      fo.printf("@GOTOXY:"+x+","+(y+r)+"@");
      fo.printf(r===1?ANIM_LIST_FMT_HL:ANIM_LIST_FMT,
         r,
         json_obj[r][name],
         json_obj[r][stat]
      );
   }
}

function simpleOutput(json_obj, name, stat, header) {
   fo.printf(SIMPLE_LIST_HDR_FMT, header);
   json_obj.sort(function (a, b) {
       return a[stat] < b[stat];
   });
   for (var r = 1; r < Object.keys(json_obj).length && r <= TOP_NUM; r++) {
      if (json_obj[r][stat] === 0) {
         break;
      }
      fo.printf(r===1?SIMPLE_LIST_FMT_HL:SIMPLE_LIST_FMT,
         r,
         json_obj[r][name],
         json_obj[r][stat]
      );
   }
}

function right(s, num) {
	"use strict";
	return s.slice(-1 * num);
}
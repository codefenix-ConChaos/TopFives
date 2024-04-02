> ⚠️ **_NOTE:_**  This project is no longer being maintained. Please feel free to fork it, clone it, make your own version of it, or whatever you wish.



# Top Fives (topfives.js)

by Craig Hendricks  
codefenix@conchaos.synchro.net  
 telnet://conchaos.synchro.net  
  https://conchaos.synchro.net  



## Description:

This script parses user stats out of Synchronet BBS's log files and generates
an animated Top-5 MSG bulletin (or optionally a simple one) which can be
displayed to users during login.

![ezgif-2-34197df246](https://user-images.githubusercontent.com/12660452/149966458-16612c9b-956d-4a57-a0d0-501c8b6f15a1.gif)


## How it works:

It parses the log files (mmddyy.log) in the /sbbs/data/logs directory. It keeps
a tally of the following categories for each user:

 - num_of_calls     - how many times the user logged on
 - time_on          - total time in minutes spent online
 - messages_read    - number of messages the user read
 - messages_posted  - number of messages posted by the user
 - emails           - number of emails sent by the user
 - feedback_sent    - number of emails the user sent to the sysop
 - files_uploaded   - number of individual files uploaded by the user
 - kb_uploaded      - kb-worth of files uploaded by the user
 - files_downloaded - number of individual files downloaded by the user
 - kb_downloaded    - kb-worth of files downloaded by the user
 - doors_ran        - number of external programs ran by the user

In addition, it also separately tracks the number of times each external
program has been ran (displayed in simple mode only, and not to be confused
the "doors_ran" value listed above. more on this below).

It stores this information in memory as JSON objects, sorts each category
in order from highest values to lowest, and then outputs the categories to a
static bulletin file.

The default animated bulletin output mode uses the topfiles.msg file as a
template, and then appends the generated bulletin content to the end. It makes
use of the AT codes DELAY and GOTOXY to display the results with an animation
effect.

Optionally, a "simple" version of the output can be generated instead, which
is just a continuous list of all categories with no AT codes used for
animation.



## Instructions:

Copy the following files to your /sbbs/mods directory:

 - topfives.js:  the script
 - topfives.msg: template MSG file
 - readme.txt:   this file for reference :P

On the command line, change to your /sbbs/exec directory and call the script
with jsexec using the following syntax:

   `jsexec topfives <month/year/lastyear/year number> [path_to_output] [simple]`

### Examples:

To generate a Top-5 bulletin for the current month and display it during login:

   `jsexec topfives month c:\sbbs\text\menu\logon2.msg`

   (change the number in the logon MSG filename to your liking)

If no path_to_output is specified, output is written to /sbbs/mods/output.msg
by default.

To generate a Top-5 bulletin for the previous year:

   `jsexec topfives lastyear`

To generate a Top-5 bulletin for ANY year, just specify the year:

   `jsexec topfives 2019`

Specify "simple" as the third parameter to generate a simple non-animated list
of all available categories. The output path is required in "simple" mode.

   `jsexec topfives month c:\sbbs\text\menu\logon2.msg simple`

Add a month and/or year call to your nightly BAT file or run it as a timed
event in SCFG to automatically generate updated logon MSG bulletins each day.

   ```
   cd c:\sbbs\exec
   jsexec topfives month c:\sbbs\text\menu\logon2.msg
   jsexec topfives year c:\sbbs\text\menu\logon3.msg
   ```



## Execution time:

On my system, month bulletins generate nearly instantly, and a bulletin for
2021 took around 9 seconds to complete.

Yearly bulletins take several seconds to generate since the script obviously
has to search through more log files to gather data. Boards with a lot of
visitors every day will have larger log files, so the script will take longer
to run. Your mileage may vary.



## Accuracy:

It's accurate as best I can tell. I've done some validation by comparing the
numbers in the output to the search results of Notepad++'s "Find in files"
function in the log file directory, as well as by comparing to the output of
utilities which do similar things (top10usr, syncdoor, etc.).



## Configuration and Customization:

Edit the included topfives.msg file to your liking using PabloDraw. MSG formats
are recommended. The script should take anything you save and append the
generated content to the end. It also will programmatically include a CtrlA-L
sequence to the beginning to clear the screen before displaying the file, as
well as remove any trailing CtrlA-Z sequence that exists at the end.

Note: Everything else that follows past this point involves making minor
      changes to the javascript file. If you feel comfortable making such
      changes, make a backup copy of topfives.js and proceed.

Some basic values at the top of the topfives.js script may be changed to suit
your preferences. They're located between the lines labeled "Configurable
Options Start" and "Configurable Options End".

- If you want to include the sysop in the bulletins, change IGNORE_SYSOP from
  true (default) to false.

- Change the OUTPUT_DELAY to adjust the animation speed, where 1 = 1 tenth of
  a second. 2 seems comfortable and not too slow, so that's the default.

- You can even change the bulletin from a Top-5 to a Top-10 by setting the
  TOP_NUM value, however, values larger than 5 will not look right with the
  included topfives.msg template file, and the default category placements, so
  it's probably best used with "simple" bulletins.

- The lines in each category are formatted using the strings are stored in
  SIMPLE_LIST_FMT and ANIM_LIST_FMT. The top #1 line is given a different
  format string in SIMPLE_LIST_FMT_HL and ANIM_LIST_FMT_HL respectively (HL
  meaning "highlighted").

  The SIMPLE_LIST_HDR_FMT is the formatting string for the header above each
  category in simple mode. For the default mode, there is ANIM_LIST_HDR_FMT as
  well as ANIM_LIST_HDR_FMT2. Why two? Because the output is animated. This
  lets you specify two different "frames" of formatting. For example, the
  default values fade from standard blue to high-intensity blue.

     ```
     ANIM_LIST_HDR_FMT  = "\1n\1b%s"; // standard blue
     ANIM_LIST_HDR_FMT2 = "\1b\1h%s"; // high-intensity blue
     ```

  Refer to the Synchronet Wiki page for CTRL-A code coloring:
     http://wiki.synchro.net/custom:ctrl-a_codes

- Lastly, if you want to change which categories get displayed in the
  bulletin, edit the "ANIM_CATEGORY\_\#" values to your liking. The default
  included topfives.msg template file has room for about 6 categories.

  Acceptable ANIM_CATEGORY\_\# values include:
   - num_of_calls
   - time_on
   - messages_read
   - messages_posted
   - emails
   - feedback_sent
   - files_uploaded
   - kb_uploaded
   - files_downloaded
   - kb_downloaded
   - doors_ran

The Top-5 most ran door programs (not to be confused with the Top-5 users who
ran doors) is not available in the default animated output mode. There are a
couple reasons for this: 1) at the time of this writing, the default mode only
uses the "user" json object in memory, and the most ran doors are tracked in a
separate json object, and 2) door program names tend to be longer than user
names and would therefore likely appear truncated in the default mode anyway.

The ANIM_CATEGORY\_\#\_HDR values are the headers for the categories. These may
be anything you want, but should be kept short (24 characters or fewer) so
they display OK.

The ANIM_CATEGORY\_\#\_X and ANIM_CATEGORY\_\#\_Y values are the X and Y
coordinates of where the category will be shown onscreen; X is the column and
Y is the row. If you decide to change these, it may take some trial-and-error
to get everything looking how you want.

By default, the categories are presented in the following sequence:
```
   +------------+------------+------------+
   | Category 1 | Category 3 | Category 5 |
   +------------+------------+------------+
   | Category 2 | Category 4 | Category 6 |
   +------------+------------+------------+
```
ANIM_TIMEFRAME_HDR_X and ANIM_TIMEFRAME_HDR_Y are the X and Y coordinates of
the timeframe header (ie: "For January '21" or "For the year '21").

Lastly, ANIM_END_PAUSE_X and ANIM_END_PAUSE_Y are the X and Y coordinates of
where the pause prompt gets written at the end of the bulletin.

I believe that the above available customization options are enough for most
sysops to fully make the resulting bulletins "their own". From this point on,
it's assumed that you have enough javascript knowledge to make any further
customizations, as they would require more changes to the script than simply
editing the constant values at the top. For example, if you want to completely
change how categories get displayed in both the simple and default modes, you
can do this by editing, rearranging, or removing (or better yet just commenting
out with //) the function calls to "defaultOutput" and "simpleOutput".

Have fun! I hope people find this script useful.



## Future plans:

- Add a config file so that the javascript file doesn't require modification
  for certain customization options. I admit I was too lazy to implement this
  on the initial version, plus I liked how short and simple the script was.

- Currently the script parses all available data from the logs, regardless
  of whether it ultimately gets written to the bulletin. Not a huge deal, but
  it's still wasteful. Might be nice to make it so it pulls data from the logs
  only if it's going to be used in the output, but I don't consider it a high
  priority item.



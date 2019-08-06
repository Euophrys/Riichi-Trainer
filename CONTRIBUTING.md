# Helping With Translations

To edit the files, I recommend [Visual Studio Code](https://code.visualstudio.com/). To download the repo, install [GitHub Desktop](https://desktop.github.com/). At the top right of this page, click "Fork" to make your own version to work in. Then, on the right side of your repo page, click "Clone or Download", then "Open in Desktop". You could also just download the zip if you don't want to bother with git, though you'll be making more work for me.

The translation files are found in the `src/translations` folder. Make a copy of the `en.js` file and rename it to the language code for your language. You can find the language codes [in this Wikipedia article.](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) The two-letter code should be used.

Open the file, and on the first line (`export const en = {`), change "en" to the same language code. Now you can work through the lines and change them to your language. A few notes:

* The format is key: value, eg in the line `shuupai: "{{value}} of {{suit}}"`, `shuupai` is the key and `"{{value}} of {{suit}}"` is the value. You must never change the keys, only the values.
* Don't translate anything inside of double-curly brackets. Eg, in `shuupai: "{{value}} of {{suit}}"`, "value" and "suit" must not be translated. These are variables that will be replaced with something. You can move them around to wherever makes sense, and even delete them, though that's probably not useful.
* To have a literal " within quotes, you'll need to escape it with a backslash, such as in `verbose: "Verbose tile names (\"one of bamboo\" vs \"1s\")"`. You could use single quotes to wrap the sentence, such as `verbose: 'Verbose tile names ("one of bamboo" vs "1s")'`, and this would require any single quotes in the sentence to be escaped instead.
* For languages without plural forms, you can simply delete lines that have keys ending in `_plural`. For languages which have multiple plural forms, add keys with `_0`, `_1`, etc for each form. Refer to [this documentation page](https://www.i18next.com/translation-function/plurals) for more details.
* There are two forms of the history, "verbose" and "concise". The verbose lines should include a bit of explanation, aimed at people who are just getting familiar with mahjong, while the concise lines can assume knowledge and be snappy.

To test your new translation, you could either change the language code back to en and simply overwrite the English translation (put it back after), or you can do it the harder, proper way:

1) Open the `src/i18n.js` file.
2) Add a line near the top of the file like `import { en } from "./translations/en";`, replacing `en` with your language code in both places.
3) Add a line like `en: en,`, replacing `en` with your language code, within the object labelled "resources". If you added it at the end, ensure the penultimate line ends in a comma.
4) Open the `src/states/MainMenu.js` file.
5) Ctrl+F "English" to find where the language names are.
6) Add a line like `<DropdownItem onClick={() => this.changeLanguage("en")}>English</DropdownItem>` among the other DropdownItems. Change `en` to your language code, and change `English` to the name of your language in that language. For example, if you were translating Japanese, you'd put it as `日本語`.
7) Save both files.

Regardless of method, open a command prompt or terminal window in the Riichi-Trainer folder. Run `npm install` if you haven't already, then run `npm start`. If you did things correctly, a webpage should open with the trainer, and you can change the language to yours and see how things look. If you got errors, you can try to figure out why, or ask me.

When you're finished, commit the translation file to a new branch and push it up, then create a pull request with me as a reviewer. I'll do a quick check and merge it in if it looks good. If you don't know how to use git, you can just send me the translation file and I'll take care of it.

# Helping With Code

At this point, I don't feel there's all too much to add, but keep the purpose of the efficiency trainer in mind if you do add anything. It's purely for training efficiency based on ukeire and measuring your ability in that regard. For example, adding a timer for how long it takes you to discard would be a fine addition, as that adds another way to measure your progress. Giving the opponents hands that they can ron the player with would not, as it is not a defense trainer.

If you want to add a new section, you should probably just make your own app. If you really want it to be part of this, ask me about it first rather than just throwing a pull request with it at me.

I'm not too picky about style, as long as you use 4 space indentation and don't do anything truly out of the ordinary, just try to mimic the style found in these files. Use reasonable, readable variable names.

Make pull requests to the develop branch.

Some things I feel obligated to note:

* Whenever there's a variable holding a hand, it's generally going to be an array of 38, with the values saying how many of that specific tile are in the hand. For example, if hand[17] had a value of 2, the hand would have two 7p. It goes characters - circles - bamboo - honors. The indexes ending in 0 are for the red fives, or the tile backs in the case of 30. If a tile exists outside of a hand, it will generally be represented by that index as well.
* For localization, I'm using [i18next](https://react.i18next.com/), so look at those docs if you do anything that adds text. Use Google Translate or such to add new lines to the existing translation files rather than adding English into the other languages. Reuse existing translations whenever you can to minimize work for the kind people who do the translating.
* For styling, I'm using [reactstrap](https://reactstrap.github.io/), so look at those docs if you do anything that adds UI. It's basically just a [bootstrap](https://getbootstrap.com/docs/4.3/getting-started/introduction/) implementation for React, so you can refer to those too.
* If you want to do anything with the replay analyzer, there's an example replay for both Tenhou and Majsoul in the examples folder. Expanding the analyzer to include Majsoul replays would be great, as many Majsoul players use this trainer, but I don't know how the format works. I think it needs to be converted to a different encoding, but nothing I've tried has worked. The Tenhou log format is broken down at the bottom of [this GitHub page's readme](https://github.com/ApplySci/tenhou-log).
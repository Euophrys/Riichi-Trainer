# Helping With Translations

To edit the files, I recommend [Visual Studio Code](https://code.visualstudio.com/).

The translation files are found in the `src/translations` folder. Make a copy of the `en.js` file and rename it to the language code for your language. You can find the language codes [in this Wikipedia article.](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) The two-letter code should be used.

Open the file, and on the first line (`export const en = {`), change "en" to the same language code. Now you can work through the lines and change them to your language. A few notes:

* The format is key: value, eg in the line `shuupai: "{{value}} of {{suit}}"`, `shuupai` is the key and `"{{value}} of {{suit}}"` is the value. You must never change the keys, only the values.
* Don't translate anything inside of double-curly brackets. Eg, in `shuupai: "{{value}} of {{suit}}"`, "value" and "suit" must not be translated. These are variables that will be replaced with something.
* To have a literal " within quotes, you'll need to escape it with a backslash, such as in `verbose: "Verbose tile names (\"one of bamboo\" vs \"1s\")"`. You could use single quotes to wrap the sentence, such as `verbose: 'Verbose tile names ("one of bamboo" vs "1s")'`, and this would require any single quotes in the sentence to be escaped instead.
* For languages without plural forms, you can simply delete lines that have keys ending in `_plural`. For languages which have multiple plural forms, add keys with `_0`, `_1`, etc for each form. Refer to [this documentation page](https://www.i18next.com/translation-function/plurals) for more details.

To test your new translation, you could either change the language code back to en and simply overwrite the English translation (put it back after), or you can do it the harder, proper way:

1) Open the `src/i18n.js` file.
2) Add a line near the top of the file like `import { en } from "./translations/en";`, replacing `en` with your language code in both places.
3) Add a line like `en: en,`, replacing `en` with your language code, within the object labelled "resources". If you added it at the end, ensure the penultimate line ends in a comma.
4) Open the `src/states/MainMenu.js` file.
5) Ctrl+F "English" to find where the language names are.
6) Add a line like `<DropdownItem onClick={() => this.changeLanguage("en")}>English</DropdownItem>` among the other DropdownItems. Change `en` to your language code, and change `English` to the name of your language in its native language.
7) Save both files.
8) Open a command prompt or terminal window in the Riichi-Trainer folder. Run `npm install` if you haven't already, then run `npm start`. If you did things correctly, a webpage should open with the trainer, and you can change the language to yours and see how things look. If you got errors, you can try to figure out why, or ask me.

When you're finished, commit the translation file and push it up, then create a pull request with me as a reviewer. I'll do a quick check and merge it in if it looks good. If you don't know how to use git, you can just send me the translation file and I'll take care of it.

# For Programmers:
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

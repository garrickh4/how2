var _ = require('lodash');
var blessed = require('blessed');
var marked = require('marked');
var TerminalRenderer = require('marked-terminal');
var htmlentities = require('ent');

marked.setOptions({
    // Define custom renderer
    renderer: new TerminalRenderer({
        unescape: true,
    })
});

var screen;
var googleList;
var answersList;

function start() {
    screen = blessed.screen({
        smartCSR: true,
    //   rows: 20,
    //   cols: 20
        autoPadding: true
    });

    screen.title = 'howto';

    screen.key(['C-c'], function(ch, key) {
        return process.exit(0);
    });
}

function listStyle() {
    return {
        selectedBg: 'blue',
        selectedFg: 'white',
        // align: 'center',
        // fg: 'blue',
        mouse: true,
        keys: true,
        vi: true
    };
}

function showGoogling() {
    var box = blessed.box({
        content: 'Googling...'
    });
    screen.append(box);
    screen.render();
}

function showGoogleList(items, callback) {
    var options = {
        parent: screen,
        //   cols: 20,
        //   rows: 20,
        width: '100%',
        height: '100%',
        top: 'center',
        left: 'center',
        padding: 1,
        title: 'Select Answer:',
        mouse: true
    }
    _.extend(options, listStyle());
    googleList = blessed.list(options);

    googleList.setItems(items);

    googleList.prepend(new blessed.Text({
        // left: 2,
        content: 'Select one code tip:'
    }));

    googleList.on('select', function(event) {
        callback(this.selected);
    });

    googleList.key(['escape', 'q'], function() {
        process.exit(0);
    });

    googleList.select(0);
    googleList.focus();
    screen.render();
}

function makeTitleForAnswer(answer) {
    var withColors = marked(answer.body_markdown);

    var lines = withColors.split('\n');

    var firstLine;
    for(var i=0; i < lines.length; i++) {
        firstLine = lines[i]
        if(firstLine !== '') break;
    }
    firstLine = htmlentities.decode(firstLine);
    var score = '('+answer.score+') ';
    return score + firstLine;
}

function showAnswers(answers, callback) {
    var listBox = blessed.box({
        top: 'center',
        left: 'center',
        width: '90%',
        height: '90%',
        border: {
            type: 'line',
            // bg: 'yellow',
            // fg: '#ffffff'
        },
        tags: true,
    });

    var listOptions = {
        parent: listBox,
        border: {
            type: 'bg',
            // bg: 'yellow'
        },
        // bg: 'yellow',
        // fg: 'black'
    };
    _.extend(listOptions, listStyle());
    answersList = blessed.list(listOptions);

    answersList.setItems(answers.map(makeTitleForAnswer));

    answersList.on('select', function() {
        callback(this.selected);
    });

    answersList.key(['escape', 'q'], function() {
        screen.remove(listBox);
        googleList.focus();
        screen.render();
    });

    listBox.append(answersList);
    answersList.focus();
    screen.append(listBox);
    screen.render();
}

function showAnswer(answer) {
    var text = toEscapedMarkdown(answer.body_markdown);

    var answerBox = blessed.box({
        top: 'center',
        left: 'center',
        width: '80%',
        height: '80%',
        border: {
            type: 'line',
        },
        padding : 1,
        scrollable: true,
        alwaysScroll: true,
        scrollbar: {
            border: {
                bg: 'yellow'
            },
            bg: 'yellow'
        },
        keys: true,
        mouse: true
    });

    answerBox.setContent(text);

    answerBox.key(['escape', 'q'], function() {
        screen.remove(answerBox);
        answersList.focus();
        screen.render();
    });

    screen.append(answerBox);
    answerBox.focus();
    screen.render();
}

function toEscapedMarkdown(markdown) {
     return htmlentities.decode(marked(markdown));
}

function magicSelect(rows) {
    screen = blessed.screen({
        // smartCSR: true,
        rows: 20,
    //   cols: 20,
        // useBCE: true,
        autoPadding: true
    });
    var list = blessed.list({
    });
    list.setItems(rows)
    screen.append(list);
    screen.render();
}

module.exports = {
    marked: marked,
    start: start,
    stop: function() {
        if(screen) {
            screen.destroy();
        }
    },
    showGoogling: showGoogling,
    showGoogleList: showGoogleList,
    showAnswers: showAnswers,
    showAnswer: showAnswer,
    toEscapedMarkdown: toEscapedMarkdown,
    magicSelect: magicSelect
};
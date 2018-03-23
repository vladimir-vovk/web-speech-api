var synth = window.speechSynthesis;
var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
var SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
var voiceSelect = document.getElementById('voice-select');
var voices = [];
var dialog = [
    {first: 'Hi, Paul!', second: 'Hi, Vladimir!'},
    {first: 'How are you today?', 'second': 'I\'m fine, thanks! And how are you?'},
    {first: 'I feel disturbance in the Force... I need to call Yoda! See you on monday! ;)', 'second': 'See you!'},
];
var currentStep = 0;

document.onreadystatechange = () => {
    if (document.readyState === 'complete') {
        documentReady();
    }
};

window.speechSynthesis.onvoiceschanged = () => {
    getVoiceList();
};

function documentReady() {
    // requestMicrophoneAccess();
    document.getElementById('start-dialog').onclick = () => {
        startDialog();
    };
    document.getElementById('button-listen-again').onclick = () => {
        listenStep(currentStep);
    };

    document.getElementById('button-go-next').onclick = () => {
        currentStep += 1;
        if (currentStep >= dialog.length) {
            finishDialog();
        } else {
            sayStep(currentStep);
        }
    };
}

function requestMicrophoneAccess() {
    navigator.getUserMedia({audio: true}, () => {}, () => {
        alert('Please allow using microphone for this page.');
    });
}

function listenStep(step) {
    document.getElementById('button-listen-again').disabled = true;

    var prevPart = 'first';
    var stepPart = 'second';
    document.getElementById('step-' + step + '-' + prevPart).style.backgroundColor = 'white';
    document.getElementById('step-' + step + '-' + stepPart).style.backgroundColor = 'lightyellow';

    var recognizer = new SpeechRecognition();
    // var grammar = '#JSGF V1.0; grammar phrase; public <phrase> = ' + dialog[currentStep][stepPart] +';';
    // var speechRecognitionList = new SpeechGrammarList();
    // speechRecognitionList.addFromString(grammar, 1);
    // recognizer.grammars = speechRecognitionList;
    recognizer.interimResults = true;
    recognizer.lang = voices[document.getElementById('voice-select').selectedIndex].lang;
    recognizer.onresult = (event) => {
        console.log('onresult');
        var result = event.results[event.resultIndex];
        if (result.isFinal) {
            document.getElementById('voice-result').textContent = result[0].transcript;

            var original = dialog[currentStep][stepPart].replace(/[,!\.\-_\?]/g, '');
            console.log('original =', original);

            if (original.toLowerCase() == result[0].transcript.toLowerCase()) {
                document.getElementById('step-' + step + '-' + stepPart).style.backgroundColor = 'lightgreen';
                setTimeout(() => {
                    currentStep += 1;
                    if (currentStep >= dialog.length) {
                        finishDialog();
                    } else {
                        sayStep(currentStep);
                    }
                }, 1000);

            } else {
                document.getElementById('button-listen-again').disabled = false;
                document.getElementById('button-go-next').disabled = false;
            }

        } else {
            console.log('Interim result:', result[0].transcript);
            document.getElementById('voice-result').textContent = result[0].transcript;
        }
    };
    recognizer.start();
}

function sayStep(step) {
    if (synth.speaking) {
        console.log('Already speaking...');
        return;
    }

    var stepPart = 'first';
    var divs = document.getElementById('section-dialog').getElementsByTagName('div');
    for (var i = 0; i < divs.length; i++) {
        divs[i].style.backgroundColor = 'white';
    }
    document.getElementById('step-' + step + '-' + stepPart).style.backgroundColor = 'lightyellow';

    var text = dialog[currentStep][stepPart];
    var utter = new window.SpeechSynthesisUtterance(text);
    utter.onend = (event) => {
        console.log('utter onend');
        setTimeout(() => {
            listenStep(currentStep);
        }, 100);
    };

    utter.onerror = () => {
        console.error('utterance error ->', text);
    };

    var voiceIndex = document.getElementById('voice-select').selectedIndex;
    utter.voice = voices[voiceIndex];
    synth.speak(utter);
}

function finishDialog() {
    document.getElementById('section-dialog').innerHTML = '';
    document.getElementById('section-recognition-results').style.display = 'none';
    alert('Congratulations! You did it! :)');
}

function startDialog() {
    var sectionDialog = document.getElementById('section-dialog');
    sectionDialog.innerHTML = '';
    dialog.forEach((dialogStep, i) => {
        var firstDiv = document.createElement('div');
        firstDiv.textContent = ' - ' + dialogStep.first;
        firstDiv.setAttribute('id', 'step-' + i + '-first');
        sectionDialog.appendChild(firstDiv);

        var secondDiv = document.createElement('div');
        secondDiv.textContent = ' - ' + dialogStep.second;
        secondDiv.setAttribute('id', 'step-' + i + '-second');
        sectionDialog.appendChild(secondDiv);
    });

    document.getElementById('section-recognition-results').style.display = 'block';

    currentStep = 0;
    sayStep(currentStep);
}

function getVoiceList() {
    voices = synth.getVoices();
    voices = voices.filter((voice) => voice.lang.slice(0, 2) == 'en');
    var selected = voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex;
    voiceSelect.innerHTML = '';
    voices.forEach((voice) => {
        var option = document.createElement('option');
        option.textContent = voice.name + '(' + voice.lang + ')';

        if (voice.default) {
            option.textContent += ' -- DEFAULT';
        }

        option.setAttribute('data-lang', voice.lang);
        option.setAttribute('data-name', voice.name);
        voiceSelect.appendChild(option);
    });
}

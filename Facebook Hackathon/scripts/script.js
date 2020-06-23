const NativeUI = require('NativeUI');
const Textures = require('Textures');
const Patches = require('Patches');
const Scene = require('Scene');
const Diagnostics = require('Diagnostics');
const Reactive = require('Reactive');
const TouchGestures = require('TouchGestures');
const Persistence = require('Persistence');
const CameraInfo = require('CameraInfo');
const Material = require('Materials');
const Random = require('Random');
const Time = require('Time');
const sceneRoot = Scene.root;
var didPick = false;
Promise.all([
    Textures.findFirst('icon_1'),
    Textures.findFirst('icon_2'), 
    Textures.findFirst('icon_3'),
    sceneRoot.findFirst('cube11'),
    sceneRoot.findFirst('cube12'),
    sceneRoot.findFirst('cube13'),
    sceneRoot.findFirst('cube21'),
    sceneRoot.findFirst('cube22'),
    sceneRoot.findFirst('cube23'),
    sceneRoot.findFirst('cube31'),
    sceneRoot.findFirst('cube32'),
    sceneRoot.findFirst('cube33'),
    sceneRoot.findFirst('cube41'),
    sceneRoot.findFirst('cube42'),
    sceneRoot.findFirst('cube51'),
    sceneRoot.findFirst('cube52'),
    sceneRoot.findFirst('cube53'),
    sceneRoot.findFirst('cube61'),
    sceneRoot.findFirst('cube62'),
    sceneRoot.findFirst('cube63'),
    sceneRoot.findFirst('cube71'),
    sceneRoot.findFirst('cube72'),
    sceneRoot.findFirst('cube73'),
    sceneRoot.findFirst('maintext'),
    sceneRoot.findFirst('spinwheel2'),
    sceneRoot.findFirst('coin'),
    sceneRoot.findFirst('icon'),
]).then(onReady);
function onReady(assets) {
    const truths = ['What do most people think about you is true but is not?','What was the last thing you googled?'
    ,'If someone gave you a million dollars, what would you do with it?','What is your favourite R rated movie?','What would you do if you switched genders for a day?',
    'Describe your guilty pleasure','What is the stupidest thing you have ever done?','What would be the theme song of your life?',
    'What have you seen that you wish you could unsee?','Describe your favourite meme by facial expressions', 'If you could be a celebrity for a whole day, who would you be?',  'What is your biggest regret?' , 
    'What was the most defining moment of your life?', 'What was the highlight of your day/week?', 'Describe your most drunk experience', 'What is one thing you are glad that your mum doesn’t know?', 
    'What book/movie character has influenced you the most?', 'What was your dream job growing up?', 'Whose Instagram account would you want to manage for a day and what would you do if you managed it?', 
    'What is your happiest memory?'];
    const daresText = ['Sing a song','Do a fake cry','Pretend to be sick','Do your best impression of a baby',
    'Describe your crush','Record a Hi with a person beside you',
    'Speak about yourself in Third Person','Talk without your lips making contact','Laugh out loud continuously for 30 seconds',
    'Break an egg on your head (Tap Screen)'];
    const texture0 = assets[0];
    const texture1 = assets[1];
    const texture2 = assets[2];
    const arrayJengaBlocks = [];
    const textBox = assets[23];
    const spinWheel = assets[24];
    const coin = assets[25];
    const scoreIcon = assets[26];
    var alreadyPickedDares = [];
    var alreadyPickedTruths = [];
    // const isRecording = CameraInfo.isRecordingVideo;
    // Diagnostics.watch("recording",isRecording)
    // if(isRecording.eq(false)){
    //   Diagnostics.log('Hello')
    // }else{
    //   Diagnostics.log('No hello')
    // }
    var isTruth = false;
    var isDare = false;
    var dareIndex = -1;
    const userScope = Persistence.userScope;
    Patches.setScalarValue('dareIndex',dareIndex);
    for (i = 3; i<23;i++){
      arrayJengaBlocks.push(assets[i]);
    }
    arrayJengaBlocks.push(assets[3]);
    const picker = NativeUI.picker;
    const index = 0;
    const selection = 0;
    const configuration = {
      selectedIndex: index,
      items: [
        {image_texture: texture0},
        {image_texture: texture1},
        {image_texture: texture2}
      ]
    };
    picker.configure(configuration);
    picker.visible = true;
    picker.selectedIndex.monitor().subscribe(function(index) {
      Patches.inputs.setScalar('selection', index.newValue);
    });
    const score = {score: 0}
    userScope.get('score').then(function(result) {
      //score.score = parseInt(result.score);
      score.score = result.score;
      //Set the Medal here
      if(score.score >=0 && score.score <5){
        scoreIcon.material = Material.get('Bronze');

      }else if (score.score >=5 && score.score <15){
        scoreIcon.material = Material.get('Silver');

      }else if(score.score >= 15){
        scoreIcon.material = Material.get('Gold');
 
      }
    }).catch(function(error) {
      score.score = 0;
      scoreIcon.material = Material.get('Bronze');

    });

    CameraInfo.isRecordingVideo.monitor().subscribe(function(event){
      //Diagnostics.log('Hello')
      if(event.newValue == true && didPick == true){
        //Increase Count
        Diagnostics.log('Hello')
        score.score = score.score + 1;
        userScope.set('score',score).then(function(result){
          //Success
        }).catch(function(error){
          //Failed
        });
      }else{
        Diagnostics.log('False');
      }
    });

    //Spin Wheel Tap
    TouchGestures.onTap(spinWheel).subscribe(function(gesture){
      Time.setTimeout(function(){
        const valueRandom = Patches.getScalarValue('wheel').pinLastValue();
        const indexVal = valueRandom/2;
        if (valueRandom % 2 == 0){
          //Dare
          generateDareWheel(indexVal);
        }else{
          //Truth
          generateTruthWheel(indexVal);
        }
      },4000);
    });

    //Coin Tap 
    TouchGestures.onTap(coin).subscribe(function(gesture){
      const duration = Patches.getScalarValue('coinDuration').pinLastValue();
      Time.setTimeout(function(){
        const valueRandom = Patches.getScalarValue('coin').pinLastValue();
        const indexVal = valueRandom/2;
        if (valueRandom % 2 == 0){
          //Dare
          generateDareWheel(indexVal);
        }else{
          //Truth
          generateTruthWheel(indexVal);
        }
      },duration * 1000);
    });

    TouchGestures.onLongPress().subscribe(function(gesture){
      didPick = false;
      Patches.setBooleanValue('didPick', didPick);
      isTruth = false;
      Patches.setBooleanValue('isTruth', isTruth);
      isDare = false;
      Patches.setBooleanValue('isDare', isDare);
      dareIndex = -1;
      Patches.setScalarValue('dareIndex',dareIndex);
    })

    //Jenga Block Tap Functions 
    TouchGestures.onTap(arrayJengaBlocks[0]).subscribe(function(gesture){
      //Red
      generateDareRand();
    });
    TouchGestures.onTap(arrayJengaBlocks[1]).subscribe(function(gesture){
      //Green
      generateTruthRand();
    });
    TouchGestures.onTap(arrayJengaBlocks[2]).subscribe(function(gesture){
      //Red
      generateDareRand();
    });
    TouchGestures.onTap(arrayJengaBlocks[3]).subscribe(function(gesture){
      //Green
      generateTruthRand();
    });
    TouchGestures.onTap(arrayJengaBlocks[4]).subscribe(function(gesture){
      //Red
      generateDareRand();
    });
    TouchGestures.onTap(arrayJengaBlocks[5]).subscribe(function(gesture){
      //Green
      generateTruthRand();
    });
    TouchGestures.onTap(arrayJengaBlocks[6]).subscribe(function(gesture){
      //Green
      generateTruthRand();
    });
    TouchGestures.onTap(arrayJengaBlocks[7]).subscribe(function(gesture){
      //Red
      generateDareRand();
    });
    TouchGestures.onTap(arrayJengaBlocks[8]).subscribe(function(gesture){
      //Red
      generateDareRand();
    });
    TouchGestures.onTap(arrayJengaBlocks[9]).subscribe(function(gesture){
      //Red
      generateDareRand();
    });
    TouchGestures.onTap(arrayJengaBlocks[10]).subscribe(function(gesture){
      //Red
      generateDareRand();
    });
    TouchGestures.onTap(arrayJengaBlocks[11]).subscribe(function(gesture){
      //Green
      generateTruthRand();
    });
    TouchGestures.onTap(arrayJengaBlocks[12]).subscribe(function(gesture){
      //Red
      generateDareRand();
    });
    TouchGestures.onTap(arrayJengaBlocks[13]).subscribe(function(gesture){
      //Green
      generateTruthRand();
    });
    TouchGestures.onTap(arrayJengaBlocks[14]).subscribe(function(gesture){
      //Red
      generateDareRand();
    });
    TouchGestures.onTap(arrayJengaBlocks[15]).subscribe(function(gesture){
      //Red
      generateDareRand(); 
    });
    TouchGestures.onTap(arrayJengaBlocks[16]).subscribe(function(gesture){
      //Green
      generateTruthRand();
    });
    TouchGestures.onTap(arrayJengaBlocks[17]).subscribe(function(gesture){
      //Green
      generateTruthRand();
    });
    TouchGestures.onTap(arrayJengaBlocks[18]).subscribe(function(gesture){
      //Red
      generateDareRand();
    });
    TouchGestures.onTap(arrayJengaBlocks[19]).subscribe(function(gesture){
      //Green
      generateTruthRand();
    });

    function generateTruthWheel(index){
      index = Math.floor(index);
      Diagnostics.log("index is "+ index);
      var randomNum = generateRandomTruths();
      alreadyPickedTruths.push(randomNum);
      textBox.text = truths[randomNum];
      didPick = true;
      Patches.setBooleanValue('didPick', didPick);
      isTruth = true;
      Patches.setBooleanValue('isTruth', isTruth);
    }
    function generateDareWheel(index){
      didPick = true;
      Patches.setBooleanValue('didPick', didPick);
      var randomNum = generateRandomDares();
      alreadyPickedDares.push(randomNum);
      textBox.text = daresText[randomNum];
      isDare = true;
      Patches.setBooleanValue('isDare', isDare);
      dareIndex = randomNum;
      Patches.setScalarValue('dareIndex',dareIndex);
    }

    function generateTruthRand(){

      var randomNum = generateRandomTruths();
      alreadyPickedTruths.push(randomNum);
      //Number from 1 - 10
      textBox.text = truths[randomNum];
      didPick = true;
      Patches.setBooleanValue('didPick', didPick);
      isTruth = true;
      Patches.setBooleanValue('isTruth', isTruth);
    }

    function generateRandomTruths(index = 0){

      var randomNum = Random.random();
      randomNum = randomNum * 20;
      randomNum = Math.floor(randomNum);
      Diagnostics.log(randomNum);
      if(index > 19){
        return randomNum;
      }
      if(alreadyPickedTruths.indexOf(randomNum) !== -1){
        //Exists
        return generateRandomTruths(index++);
      }else{
        return randomNum;
      }
      
    }

    function generateRandomDares(index = 0){

      var randomNum = Random.random();
      randomNum = randomNum * 10;
      randomNum = Math.floor(randomNum);
      if(index > 9){
        return randomNum;
      }
      if(alreadyPickedDares.indexOf(randomNum) !== -1){
        //Exists
        return generateRandomDares(index++);
      }else{
        return randomNum;
      }
      
    }
    function generateDareRand(){
      var randomNum = generateRandomDares();
      alreadyPickedDares.push(randomNum);
      //Number from 1 - 10
      textBox.text = daresText[randomNum];
      didPick = true;
      Patches.setBooleanValue('didPick', didPick);
      isDare = true;
      Patches.setBooleanValue('isDare', isDare);
      dareIndex = randomNum;
      Patches.setScalarValue('dareIndex',dareIndex);
    }
}

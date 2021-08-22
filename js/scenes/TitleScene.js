const instructions =
`Story\:
The logistics of running plebfi is not for the faint of heart.
Jeremy will go to try and aid the plebs in need!`;

class TitleScene extends Phaser.Scene {
  constructor () {
    super('Title');
  }

  create() {
    this.titleText = this.add.text(this.scale.width/2, this.scale.height/2 , 'Pleb or Die', {
      fontSize: '64px',
      fill: '#6f6f6f'
    });
    this.instructionText = this.add.text(this.scale.width/2, this.scale.height * 0.80, instructions, 
      {
      fontSize: '24px',
      fill: '#6f6f6f'
    });
    this.titleText.setOrigin(.5);
    this.instructionText.setOrigin(.5);
    this.startGameButton = new UiButton(
      this,
      this.scale.width / 2,
      this.scale.height * 0.65,
      'button1',
      'button2',
      `Pay 500 sats\nthen click`,
      this.startScene.bind(this, 'Game')
    );
    this.btcIcon = this.add.image(200,200,'qrcode').setScale(1);
  }
  startScene(targetScene) {
    this.scene.start(targetScene);
  }
  
}
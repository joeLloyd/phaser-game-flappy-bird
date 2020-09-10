import * as Phaser from 'phaser';
import FlappyGame from '../scenes/FlappyGame';
import pipeUpAsset from "../assets/images/pipe.png";
import pipeDownAsset from "../assets/images/pipe-down.png";
import PointSound from "../assets/sound/point.wav";

class Pipes extends Phaser.Physics.Arcade.Group {
    scene: FlappyGame;

    constructor(world, scene: FlappyGame) {
        super(world, scene);
        this.init()
    }

    init() {
        this.defaults.setAllowGravity = false;
        this.defaults.setVelocityX = -(this.scene.scale.width / 5);
        const sectionOfWidth = this.scene.scale.width / 3;
        const pipePositions = [[sectionOfWidth, 0], [sectionOfWidth * 2, 0], [sectionOfWidth * 3, 0]]
        pipePositions.forEach(([x, y]) => {
            const pipeDown = new Pipe(this.scene, x, Phaser.Math.Between(0, -100), 'pipe-down');
            const pipeUp = new Pipe(this.scene, x, Phaser.Math.Between(this.scene.scale.height, this.scene.scale.height + 100), 'pipe-up');
            this.add(pipeDown, true);
            this.add(pipeUp, true);
        });
    }

    hitPlayer() {
        this.setVelocityX(0);
    }

    update() {
        this.children.entries.forEach((pipe: Pipe) => {
            if (pipe.body.position.x < -pipe.width) {
                pipe.reset();
            }
        })
        this.scene.physics.overlap(this, this.scene.player, () => this.hitPlayer())
    }
}

class Pipe extends Phaser.Physics.Arcade.Sprite {
    private readonly pipeType: 'pipe-up' | 'pipe-down';
    scene: FlappyGame;

    constructor(scene: FlappyGame, x: number, y: number, pipeType: 'pipe-up' | 'pipe-down') {
        super(scene, x, y, pipeType);
        this.scene = scene;
        this.pipeType = pipeType;

        if (pipeType === 'pipe-up') {
            this.setOrigin(0, 0);
        } else {
            this.setOrigin(0, 1);
        }
    }

    reset() {
        this.body.x = this.scene.scale.width
        this.scene.score.updateScore(0.5);
        if (this.pipeType === 'pipe-up') {
            this.body.y = Phaser.Math.Between(this.scene.scale.height * 0.4, this.scene.scale.height * 0.3);
            this.pointSound();
        } else {
            this.body.y = Phaser.Math.Between(this.scene.scale.height * 0.6, this.scene.scale.height * 0.7);
        }
    }

    static preload(scene) {
        scene.load.image('pipe-up', pipeUpAsset);
        scene.load.image('pipe-down', pipeDownAsset);
        scene.load.audio('point', PointSound);
    }

    /**
     * Apply and play the jump sound
     */
    pointSound() {
        const point  = this.scene.sound.add('point');
        point.addMarker({
            name: 'point-marker',
            start: 0,
            duration: 0.6,
            config: {
                volume: 0.2,
            }
        })
        point.play('point-marker');
    }
}

export default Pipes
export {Pipe};
